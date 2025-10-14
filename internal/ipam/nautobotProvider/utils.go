package nautobotprovider

import (
	"fmt"
	"os"
)

func getNautobotToken() (string, error) {
	token := os.Getenv("NAUTOBOT_TOKEN")
	if token == "" {
		fmt.Println("NAUTOBOT_TOKEN environment variable is not set")
		os.Exit(1)
	}
	return token, nil
}

func getNautobotHost() (string, error) {
	nautobotHost := os.Getenv("NAUTOBOT_HOST")
	if nautobotHost == "" {
		fmt.Println("NAUTOBOT_HOST environment variable is not set")
		os.Exit(1)
	}
	return nautobotHost, nil
}

func getIpv4PoolId() (string, error) {
	ipPoolId := os.Getenv("NAUTOBOT_IPV4_POOL_ID")
	if ipPoolId == "" {
		fmt.Println("NAUTOBOT_IPV4_POOL_ID environment variable is not set")
		return "", fmt.Errorf("NAUTOBOT_IPV4_POOL_ID environment variable is not set")
	}
	return ipPoolId, nil
}

func getIpv4Gateway() (string, error) {
	ipv4Gateway := os.Getenv("NAUTOBOT_IPV4_GATEWAY")
	if ipv4Gateway == "" {
		fmt.Println("NAUTOBOT_IPV4_GATEWAY environment variable is not set")
		return "", fmt.Errorf("NAUTOBOT_IPV4_GATEWAY environment variable is not set")
	}
	return ipv4Gateway, nil
}

func getIpv6PoolId() (string, error) {
	ipPoolId := os.Getenv("NAUTOBOT_IPV6_POOL_ID")
	if ipPoolId == "" {
		fmt.Println("NAUTOBOT_IPV6_POOL_ID environment variable is not set")
		return "", fmt.Errorf("NAUTOBOT_IPV6_POOL_ID environment variable is not set")
	}
	return ipPoolId, nil
}

func getIpv6Gateway() (string, error) {
	ipv6Gateway := os.Getenv("NAUTOBOT_IPV6_GATEWAY")
	if ipv6Gateway == "" {
		fmt.Println("NAUTOBOT_IPV6_GATEWAY environment variable is not set")
		return "", fmt.Errorf("NAUTOBOT_IPV6_GATEWAY environment variable is not set")
	}
	return ipv6Gateway, nil
}

func getNautobotRoleId() (string, error) {
	roleId := os.Getenv("NAUTOBOT_IPAM_ROLE_ID")
	if roleId == "" {
		fmt.Println("NAUTOBOT_IPAM_ROLE_ID environment variable is not set")
		return "", fmt.Errorf("NAUTOBOT_IPAM_ROLE_ID environment variable is not set")
	}
	return roleId, nil
}

func getNautobotStatusId() (string, error) {
	statusId := os.Getenv("NAUTOBOT_IPAM_STATUS_ID")
	if statusId == "" {
		fmt.Println("NAUTOBOT_IPAM_STATUS_ID environment variable is not set")
		return "", fmt.Errorf("NAUTOBOT_IPAM_STATUS_ID environment variable is not set")
	}
	return statusId, nil
}
