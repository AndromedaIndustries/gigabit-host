package netboxprovider

import (
	"context"
	"fmt"
	"net/netip"

	"go.temporal.io/sdk/log"

	ipamcommon "github.com/andromeda/gigabit-host/internal/ipam/ipamCommon"
	"github.com/netbox-community/go-netbox/v4"
)

type NetboxIpamStruct struct {
	client    netbox.APIClient
	v4Gateway netbox.IPAddress
	v6Gateway netbox.IPAddress
}

func NewNetboxIpamClient(ctx context.Context, logger log.Logger) (*NetboxIpamStruct, error) {
	nbToken, err := getNetboxToken()
	if err != nil {
		return nil, err
	}

	nbHost, err := getNetboxHost()
	if err != nil {
		return nil, err
	}

	ipv4GatewayId, err := GetIpv4GatewayId()
	if err != nil {
		return nil, err
	}

	ipv6GatewayId, err := GetIpv6GatewayId()
	if err != nil {
		return nil, err
	}

	client := netbox.NewAPIClientFor(nbHost, nbToken)

	v4Gateway, _, err := client.IpamAPI.IpamIpAddressesRetrieve(ctx, ipv4GatewayId).Execute()
	if err != nil {
		return nil, err
	}

	logger.Info("Retrieved IPv4 GatewayAddress: ", "addr", v4Gateway.Address)

	v6Gateway, _, err := client.IpamAPI.IpamIpAddressesRetrieve(ctx, ipv6GatewayId).Execute()
	if err != nil {
		return nil, err
	}

	logger.Info("Retrieved IPv6 GatewayAddress: ", "addr", v6Gateway.Address)

	return &NetboxIpamStruct{
		client:    *client,
		v4Gateway: *v4Gateway,
		v6Gateway: *v6Gateway,
	}, nil
}

func (nb *NetboxIpamStruct) V4Gateway() *ipamcommon.IpAddress {
	addr, err := netip.ParsePrefix(nb.v4Gateway.Address)
	if err != nil {
		fmt.Println("Error parsing CIDR:", err)
		return nil
	}

	return &ipamcommon.IpAddress{
		Address:     addr.Addr().String(),
		Description: nb.v4Gateway.Description,
		DnsName:     nb.v4Gateway.Description,
	}
}
func (nb *NetboxIpamStruct) V6Gateway() *ipamcommon.IpAddress {
	addr, err := netip.ParsePrefix(nb.v6Gateway.Address)
	if err != nil {
		fmt.Println("Error parsing CIDR:", err)
		return nil
	}

	return &ipamcommon.IpAddress{
		Address:     addr.Addr().String(),
		Description: nb.v6Gateway.Description,
		DnsName:     nb.v6Gateway.Description,
	}
}

func (nb *NetboxIpamStruct) addIp(
	ctx context.Context,
	logger log.Logger,
	ip ipamcommon.IpAddress,
) (ipamcommon.IpAddress, error) {

	status := netbox.PATCHEDWRITABLEIPADDRESSREQUESTSTATUS_ACTIVE

	payload := netbox.WritableIPAddressRequest{
		Address:     ip.Address,
		Status:      &status,
		DnsName:     ip.DnsName,
		Description: ip.Description,
	}

	created, _, err := nb.client.IpamAPI.
		IpamIpAddressesCreate(ctx).
		WritableIPAddressRequest(payload).
		Execute()
	if err != nil {
		return ipamcommon.IpAddress{}, fmt.Errorf("create ip address in NetBox: %w", err)
	}

	ip.ID.Int = &created.Id

	logger.Info("Allocated NetBox IP ", "addr", ip.Address, "vmID", *ip.Description, "FQDN", *ip.DnsName)
	return ip, nil
}

func (nb *NetboxIpamStruct) DeleteIp(ctx context.Context, logger log.Logger, ipId ipamcommon.IpId) error {

	_, err := nb.client.IpamAPI.IpamIpAddressesDestroy(ctx, *ipId.Int).Execute()
	if err != nil {
		return fmt.Errorf("error deleting IP Address with ID %d: %w", *ipId.Int, err)
	}

	return nil
}

func (nb *NetboxIpamStruct) getNextIp(ctx context.Context, logger log.Logger, ipPoolId ipamcommon.IpId) (ipamcommon.IpAddress, error) {
	ipAddress, _, err := nb.client.IpamAPI.IpamPrefixesAvailableIpsList(ctx, *ipPoolId.Int).Execute()
	if err != nil {
		return ipamcommon.IpAddress{}, fmt.Errorf("error Getting next avalable IP Address from prefix pool ID %d: %w", ipPoolId.Int, err)
	}

	if len(ipAddress) == 0 {
		return ipamcommon.IpAddress{}, fmt.Errorf("no avalable IP Address from prefix pool ID %d: %w", ipPoolId.Int, err)
	}

	return ipamcommon.IpAddress{
		Address: ipAddress[0].Address,
	}, nil

}

func (nb *NetboxIpamStruct) GetNextAvalableIps(ctx context.Context, logger log.Logger, vmId, fqdn string) (ipamcommon.IpAddress, ipamcommon.IpAddress, error) {

	description := fmt.Sprintf("IP for VM ID %s", vmId)

	ipv4PoolId, err := GetIpv4PoolId()
	if err != nil {
		return ipamcommon.IpAddress{}, ipamcommon.IpAddress{}, err
	}

	ipv4Address, err := nb.getNextIp(ctx, logger, ipamcommon.IpId{Int: &ipv4PoolId})
	if err != nil {
		return ipamcommon.IpAddress{}, ipamcommon.IpAddress{}, err
	}

	ipv4Address.Description = &description
	ipv4Address.DnsName = &fqdn

	ipv4, err := nb.addIp(ctx, logger, ipv4Address)
	if err != nil {
		return ipamcommon.IpAddress{}, ipamcommon.IpAddress{}, err
	}

	ipv6PoolId, err := GetIpv6PoolId()
	if err != nil {
		return ipamcommon.IpAddress{}, ipamcommon.IpAddress{}, err
	}

	ipv6Address, err := nb.getNextIp(ctx, logger, ipamcommon.IpId{Int: &ipv6PoolId})
	if err != nil {
		return ipamcommon.IpAddress{}, ipamcommon.IpAddress{}, err
	}

	ipv6Address.Description = &description
	ipv6Address.DnsName = &fqdn

	ipv6, err := nb.addIp(ctx, logger, ipv6Address)
	if err != nil {
		return ipamcommon.IpAddress{}, ipamcommon.IpAddress{}, err
	}

	return ipv4, ipv6, nil

}
