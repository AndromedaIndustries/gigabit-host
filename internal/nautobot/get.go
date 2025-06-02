package nautobot

import (
	"context"
	"fmt"
	"os"

	"github.com/nautobot/go-nautobot/v2"
	"go.temporal.io/sdk/log"
)

func GetIpv4PoolId() string {
	ipPoolId := os.Getenv("NAUTOBOT_IPV4_POOL_ID")
	if ipPoolId == "" {
		fmt.Println("NAUTOBOT_IPV4_POOL_ID environment variable is not set")
		os.Exit(1)
	}
	return ipPoolId
}

func GetIpv4Gateway() string {
	ipv4Gateway := os.Getenv("NAUTOBOT_IPV4_GATEWAY")
	if ipv4Gateway == "" {
		fmt.Println("NAUTOBOT_IPV4_GATEWAY environment variable is not set")
		os.Exit(1)
	}
	return ipv4Gateway
}

func GetIpv6PoolId() string {
	ipPoolId := os.Getenv("NAUTOBOT_IPV6_POOL_ID")
	if ipPoolId == "" {
		fmt.Println("NAUTOBOT_IPV6_POOL_ID environment variable is not set")
		os.Exit(1)
	}
	return ipPoolId
}

func GetIpv6Gateway() string {
	ipv6Gateway := os.Getenv("NAUTOBOT_IPV6_GATEWAY")
	if ipv6Gateway == "" {
		fmt.Println("NAUTOBOT_IPV6_GATEWAY environment variable is not set")
		os.Exit(1)
	}
	return ipv6Gateway
}

func GetNextIpFromIpam(ipPoolId string) nautobot.AvailableIP {

	token := os.Getenv("NAUTOBOT_TOKEN")
	if token == "" {
		fmt.Println("NAUTOBOT_TOKEN environment variable is not set")
		os.Exit(1)
	}

	nautobotHost := os.Getenv("NAUTOBOT_HOST")
	if nautobotHost == "" {
		fmt.Println("NAUTOBOT_HOST environment variable is not set")
		os.Exit(1)
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
	check(err, "Failed to get next IP from Nautobot")

	nextIP := resp[0]

	return nextIP
}

func GetNextAvalableIps(logger log.Logger) (*nautobot.IPAddress, string, *nautobot.IPAddress, string, error) {
	ipv4PoolId := GetIpv4PoolId()
	logger.Info("IPv4 Pool ID", "poolId", ipv4PoolId)
	ipv6PoolId := GetIpv6PoolId()
	logger.Info("IPv6 Pool ID", "poolId", ipv6PoolId)

	nextIPv4 := GetNextIpFromIpam(ipv4PoolId)
	if nextIPv4.Address == "" {
		logger.Error("No available IPv4 addresses in pool", "poolId", ipv4PoolId)
		return &nautobot.IPAddress{}, "", &nautobot.IPAddress{}, "", fmt.Errorf("no available IPv4 addresses in pool %s", ipv4PoolId)
	}
	ipv4Gateway := GetIpv4Gateway()
	ipObject := AddIpToIpam(nextIPv4.Address)

	nextIPv6 := GetNextIpFromIpam(ipv6PoolId)
	if nextIPv6.Address == "" {
		logger.Error("No available IPv6 addresses in pool", "poolId", ipv6PoolId)
		return &nautobot.IPAddress{}, "", &nautobot.IPAddress{}, "", fmt.Errorf("no available IPv6 addresses in pool %s", ipv6PoolId)
	}
	ipv6Gateway := GetIpv6Gateway()
	ipv6Object := AddIpToIpam(nextIPv6.Address)

	return ipObject, ipv4Gateway, ipv6Object, ipv6Gateway, nil
}
