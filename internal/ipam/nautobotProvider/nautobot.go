package nautobotprovider

import (
	"context"
	"fmt"

	ipamcommon "github.com/andromeda/gigabit-host/internal/ipam/ipamCommon"
	"github.com/nautobot/go-nautobot/v2"
	"go.temporal.io/sdk/log"
	"resty.dev/v3"
)

type addressFamily string

const (
	v4 addressFamily = "v4"
	v6 addressFamily = "v6"
)

type NautobotIpamStruct struct {
	token     string
	host      string
	v4Gateway string
	v4PoolId  ipamcommon.IpId
	v6Gateway string
	v6PoolId  ipamcommon.IpId
	roleId    string
	statusId  string
	config    *nautobot.Configuration
}

type newIP struct {
	Address string `json:"address"`
	Status  string `json:"status"`
	Role    string `json:"role"`
	Parent  string `json:"parent"`
}

func NewNautobotIpamClient(ctx context.Context, log log.Logger) (*NautobotIpamStruct, error) {

	nbToken, err := getNautobotToken()
	if err != nil {
		return nil, err
	}

	nbHost, err := getNautobotHost()
	if err != nil {
		return nil, err
	}

	ipv4Gateway, err := getIpv4Gateway()
	if err != nil {
		return nil, err
	}

	ipv6Gateway, err := getIpv6Gateway()
	if err != nil {
		return nil, err
	}

	roleId, err := getNautobotRoleId()
	if err != nil {
		return nil, err
	}

	statusId, err := getNautobotStatusId()
	if err != nil {
		return nil, err
	}

	ipv4PoolId, err := getIpv4PoolId()
	if err != nil {
		return nil, err
	}

	ipv6PoolId, err := getIpv6PoolId()
	if err != nil {
		return nil, err
	}

	config := nautobot.NewConfiguration()
	config.Servers[0].URL = nbHost + "/api"

	return &NautobotIpamStruct{
		token:     nbToken,
		host:      nbHost,
		roleId:    roleId,
		statusId:  statusId,
		config:    config,
		v4PoolId:  ipamcommon.IpId{Str: &ipv4PoolId},
		v4Gateway: ipv4Gateway,
		v6PoolId:  ipamcommon.IpId{Str: &ipv6PoolId},
		v6Gateway: ipv6Gateway,
	}, nil
}

func (nb *NautobotIpamStruct) addIp(ctx context.Context, logger log.Logger, ip ipamcommon.IpAddress, family addressFamily) (ipamcommon.IpAddress, error) {

	client := resty.New().SetContext(ctx)
	defer client.Close()

	req := client.R().
		EnableTrace().
		SetHeader("Authorization", fmt.Sprintf("Token %s", nb.token)).
		SetHeader("Content-Type", "application/json")

	var newIP newIP
	newIP.Address = ip.Address
	newIP.Status = nb.statusId
	newIP.Role = nb.roleId

	if family == addressFamily(v4) {
		newIP.Parent = *nb.v4PoolId.Str
	}
	if family == addressFamily(v6) {
		newIP.Parent = *nb.v6PoolId.Str
	}

	res, err := req.
		SetBody(newIP).
		SetResult(&nautobot.IPAddress{}).
		Post(nb.host + "/api/ipam/ip-addresses/")

	if err != nil {
		return ipamcommon.IpAddress{}, fmt.Errorf("Failed to add IP to Nautobot")
	}

	if res.IsError() {
		fmt.Printf("Error: %s\n", res.String())
		return ipamcommon.IpAddress{}, fmt.Errorf("failed to add IP address %s: %s", newIP, res.String())
	}

	ipAddress := res.Result().(*nautobot.IPAddress)

	return ipamcommon.IpAddress{
		Address:     ipAddress.Address,
		DnsName:     ipAddress.DnsName,
		Description: ipAddress.Description,
	}, nil
}

func (nb *NautobotIpamStruct) DeleteIp(ctx context.Context, logger log.Logger, ip ipamcommon.IpId) error {

	client := resty.New().SetContext(ctx)
	defer client.Close()

	req := client.R().
		EnableTrace().
		SetHeader("Authorization", fmt.Sprintf("Token %s", nb.token)).
		SetHeader("Content-Type", "application/json")

	res, err := req.Delete(nb.host + "/api/ipam/ip-addresses/" + *ip.Str + "/")
	if err != nil {
		return fmt.Errorf("failed to delete IP to Nautobot: %e", err)
	}

	if res.IsError() {
		fmt.Printf("Error: %s\n", res.String())
		return fmt.Errorf("failed to delete IP address %s: %s", *ip.Str, res.String())
	}

	return nil
}

func (nb *NautobotIpamStruct) getNextIp(ctx context.Context, logger log.Logger, ipPoolId ipamcommon.IpId) (ipamcommon.IpAddress, error) {
	client := nautobot.NewAPIClient(nb.config)
	auth := context.WithValue(
		ctx,
		nautobot.ContextAPIKeys,
		map[string]nautobot.APIKey{
			"tokenAuth": {
				Key:    nb.token,
				Prefix: "Token",
			},
		},
	)

	resp, _, err := client.IpamAPI.IpamPrefixesAvailableIpsList(auth, *ipPoolId.Str).Execute()
	if err != nil {
		fmt.Println("Error fetching available IPs from Nautobot:", err)
		return ipamcommon.IpAddress{}, fmt.Errorf("failed to fetch available IPs from Nautobot: %w", err)
	}

	nextIP := resp[0]

	return ipamcommon.IpAddress{
		Address: nextIP.Address,
	}, nil
}

func (nb *NautobotIpamStruct) GetNextAvalableIps(ctx context.Context, logger log.Logger, vmId, fqdn string) (ipamcommon.IpAddress, ipamcommon.IpAddress, error) {

	description := fmt.Sprintf("IP for VM ID %s", vmId)

	nextIPv4, err := nb.getNextIp(ctx, logger, nb.v4PoolId)
	if err != nil {
		logger.Error("Failed to get next IPv4 address from IPAM", "poolId", nb.v4PoolId.Str, "error", err)
		return ipamcommon.IpAddress{}, ipamcommon.IpAddress{}, fmt.Errorf("failed to get next IPv4 address from IPAM: %w", err)
	}

	nextIPv4.Description = &description
	nextIPv4.DnsName = &fqdn

	v4Address, err := nb.addIp(ctx, logger, nextIPv4, addressFamily(v4))
	if err != nil {
		logger.Error("Failed to add IPv4 address to IPAM", "address", nextIPv4.Address, "error", err)
		return ipamcommon.IpAddress{}, ipamcommon.IpAddress{}, fmt.Errorf("failed to add IPv4 address %s to IPAM: %w", nextIPv4.Address, err)
	}

	nextIPv6, err := nb.getNextIp(ctx, logger, nb.v6PoolId)
	if err != nil {
		logger.Error("Failed to get next IPv6 address from IPAM", "poolId", *nb.v6PoolId.Str, "error", err)
		return ipamcommon.IpAddress{}, ipamcommon.IpAddress{}, fmt.Errorf("failed to get next IPv6 address from IPAM: %w", err)
	}

	nextIPv6.Description = &description
	nextIPv6.DnsName = &fqdn

	v6Address, err := nb.addIp(ctx, logger, nextIPv6, addressFamily(v6))
	if err != nil {
		logger.Error("Failed to add IPv6 address to IPAM", "address", nextIPv6.Address, "error", err)
		return ipamcommon.IpAddress{}, ipamcommon.IpAddress{}, fmt.Errorf("failed to add IPv6 address %s to IPAM: %w", nextIPv6.Address, err)
	}

	return v4Address, v6Address, nil
}

func (nb *NautobotIpamStruct) V4Gateway() *ipamcommon.IpAddress {
	return &ipamcommon.IpAddress{
		Address: nb.V4Gateway().Address,
	}
}

func (nb *NautobotIpamStruct) V6Gateway() *ipamcommon.IpAddress {
	return &ipamcommon.IpAddress{
		Address: nb.V6Gateway().Address,
	}
}
