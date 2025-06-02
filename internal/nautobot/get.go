package nautobot

import (
	"context"
	"fmt"

	"github.com/nautobot/go-nautobot/v2"
	"go.temporal.io/sdk/log"
)

func GetNextIpFromIpam(ipPoolId string) (nautobot.AvailableIP, error) {

	nautobotHost, token, err := getConnectionString()
	if err != nil {
		fmt.Println("Error getting Nautobot connection string:", err)
		return nautobot.AvailableIP{}, fmt.Errorf("failed to get Nautobot connection string: %w", err)
	}

	config := nautobot.NewConfiguration()
	config.Servers[0].URL = nautobotHost + "/api"
	c := nautobot.NewAPIClient(config)

	ctx := context.Background()
	auth := context.WithValue(
		ctx,
		nautobot.ContextAPIKeys,
		map[string]nautobot.APIKey{
			"tokenAuth": {
				Key:    token,
				Prefix: "Token",
			},
		},
	)

	resp, _, err := c.IpamAPI.IpamPrefixesAvailableIpsList(auth, ipPoolId).Execute()
	if err != nil {
		fmt.Println("Error fetching available IPs from Nautobot:", err)
		return nautobot.AvailableIP{}, fmt.Errorf("failed to fetch available IPs from Nautobot: %w", err)
	}

	nextIP := resp[0]

	return nextIP, nil
}

func GetNextAvalableIps(logger log.Logger) (*nautobot.IPAddress, string, *nautobot.IPAddress, string, error) {
	ipv4PoolId, err := GetIpv4PoolId()
	if err != nil {
		logger.Error("Failed to get IPv4 pool ID", "error", err)
		return &nautobot.IPAddress{}, "", &nautobot.IPAddress{}, "", fmt.Errorf("failed to get IPv4 pool ID: %w", err)
	}
	logger.Info("IPv4 Pool ID", "poolId", ipv4PoolId)
	ipv6PoolId, err := GetIpv6PoolId()
	if err != nil {
		logger.Error("IPv6 pool ID is not set")
		return &nautobot.IPAddress{}, "", &nautobot.IPAddress{}, "", fmt.Errorf("IPv6 pool ID is not set")
	}
	logger.Info("IPv6 Pool ID", "poolId", ipv6PoolId)

	nextIPv4, err := GetNextIpFromIpam(ipv4PoolId)
	if err != nil {
		logger.Error("Failed to get next IPv4 address from IPAM", "poolId", ipv4PoolId, "error", err)
		return &nautobot.IPAddress{}, "", &nautobot.IPAddress{}, "", fmt.Errorf("failed to get next IPv4 address from IPAM: %w", err)
	}
	ipv4Gateway, err := GetIpv4Gateway()
	if err != nil {
		logger.Error("Failed to get IPv4 gateway", "error", err)
		return &nautobot.IPAddress{}, "", &nautobot.IPAddress{}, "", fmt.Errorf("failed to get IPv4 gateway: %w", err)
	}
	ipObject, err := AddIpv4ToIpam(nextIPv4.Address)
	if err != nil {
		logger.Error("Failed to add IPv4 address to IPAM", "address", nextIPv4.Address, "error", err)
		return &nautobot.IPAddress{}, "", &nautobot.IPAddress{}, "", fmt.Errorf("failed to add IPv4 address %s to IPAM: %w", nextIPv4.Address, err)
	}

	nextIPv6, err := GetNextIpFromIpam(ipv6PoolId)
	if err != nil {
		logger.Error("Failed to get next IPv6 address from IPAM", "poolId", ipv6PoolId, "error", err)
		return ipObject, ipv4Gateway, &nautobot.IPAddress{}, "", fmt.Errorf("failed to get next IPv6 address from IPAM: %w", err)
	}

	ipv6Gateway, err := GetIpv6Gateway()
	if err != nil {
		logger.Error("Failed to get IPv6 gateway", "error", err)
		return ipObject, ipv4Gateway, &nautobot.IPAddress{}, "", fmt.Errorf("failed to get IPv6 gateway: %w", err)
	}
	ipv6Object, err := AddIpv6ToIpam(nextIPv6.Address)
	if err != nil {
		logger.Error("Failed to add IPv6 address to IPAM", "address", nextIPv6.Address, "error", err)
		return ipObject, ipv4Gateway, &nautobot.IPAddress{}, "", fmt.Errorf("failed to add IPv6 address %s to IPAM: %w", nextIPv6.Address, err)
	}

	return ipObject, ipv4Gateway, ipv6Object, ipv6Gateway, nil
}
