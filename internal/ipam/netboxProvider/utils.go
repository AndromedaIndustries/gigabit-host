package netboxprovider

import (
	"fmt"
	"os"
	"strconv"
)

func getNetboxToken() (string, error) {
	token := os.Getenv("NETBOX_TOKEN")
	if token == "" {
		fmt.Println("NETBOX_TOKEN environment variable is not set")
		os.Exit(1)
	}
	return token, nil
}

func getNetboxHost() (string, error) {
	netboxHost := os.Getenv("NETBOX_HOST")
	if netboxHost == "" {
		fmt.Println("NETBOX_HOST environment variable is not set")
		os.Exit(1)
	}
	return netboxHost, nil
}

func GetIpv4PoolId() (int32, error) {
	ipPoolId := os.Getenv("NETBOX_IPV4_POOL_ID")
	if ipPoolId == "" {
		fmt.Println("NETBOX_IPV4_POOL_ID environment variable is not set")
		return 0, fmt.Errorf("NETBOX_IPV4_POOL_ID environment variable is not set")
	}
	poolInt, err := strconv.ParseInt(ipPoolId, 10, 32)

	if err != nil {
		fmt.Println("unable to parse NETBOX_IPV4_POOL_ID into integer")
		return 0, fmt.Errorf("unable to parse NETBOX_IPV4_POOL_ID into integer")
	}

	return int32(poolInt), nil
}

func GetIpv6PoolId() (int32, error) {
	ipPoolId := os.Getenv("NETBOX_IPV6_POOL_ID")
	if ipPoolId == "" {
		fmt.Println("NETBOX_IPV6_POOL_ID environment variable is not set")
		return 0, fmt.Errorf("NETBOX_IPV6_POOL_ID environment variable is not set")
	}
	poolInt, err := strconv.ParseInt(ipPoolId, 10, 32)

	if err != nil {
		fmt.Println("unable to parse NETBOX_IPV6_POOL_ID into integer")
		return 0, fmt.Errorf("unable to parse NETBOX_IPV6_POOL_ID into integer")
	}

	return int32(poolInt), nil
}

func GetIpv4GatewayId() (int32, error) {
	ipv4GatewayId := os.Getenv("NETBOX_IPV4_GATEWAY_ID")
	if ipv4GatewayId == "" {
		fmt.Println("NETBOX_IPV4_GATEWAY_ID environment variable is not set")
		return 0, fmt.Errorf("NETBOX_IPV4_GATEWAY_ID environment variable is not set")
	}

	gwInt, err := strconv.ParseInt(ipv4GatewayId, 10, 32)

	if err != nil {
		fmt.Println("unable to parse NETBOX_IPV4_GATEWAY_ID into integer")
		return 0, fmt.Errorf("unable to parse NETBOX_IPV4_GATEWAY_ID into integer")
	}

	return int32(gwInt), nil
}

func GetIpv6GatewayId() (int32, error) {
	ipv6GatewayId := os.Getenv("NETBOX_IPV6_GATEWAY_ID")
	if ipv6GatewayId == "" {
		fmt.Println("NETBOX_IPV6_GATEWAY_ID environment variable is not set")
		return 0, fmt.Errorf("NETBOX_IPV6_GATEWAY_ID environment variable is not set")
	}

	gwInt, err := strconv.ParseInt(ipv6GatewayId, 10, 32)

	if err != nil {
		fmt.Println("unable to parse NETBOX_IPV6_GATEWAY_ID into integer")
		return 0, fmt.Errorf("z to parse NETBOX_IPV6_GATEWAY_ID into integer")
	}

	return int32(gwInt), nil
}
