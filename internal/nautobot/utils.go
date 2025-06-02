package nautobot

import (
	"fmt"
	"os"
)

func check(err error, message string) {
	if err != nil {
		if message != "" {
			fmt.Println(message)
		}
		panic(err)
	}
}

func GetNautobotToken() (string, error) {
	token := os.Getenv("NAUTOBOT_TOKEN")
	if token == "" {
		fmt.Println("NAUTOBOT_TOKEN environment variable is not set")
		os.Exit(1)
	}
	return token, nil
}

func GetNautobotHost() (string, error) {
	nautobotHost := os.Getenv("NAUTOBOT_HOST")
	if nautobotHost == "" {
		fmt.Println("NAUTOBOT_HOST environment variable is not set")
		os.Exit(1)
	}
	return nautobotHost, nil
}

func getConnectionString() (string, string, error) {
	host, err := GetNautobotHost()
	if err != nil {
		fmt.Println("Error getting Nautobot host:", err)
		return "", "", err
	}

	token, err := GetNautobotToken()
	if err != nil {
		fmt.Println("Error getting Nautobot token")
		return "", "", fmt.Errorf("NAUTOBOT_TOKEN environment variable is not set")
	}

	return host, token, nil
}

func GetIpv4PoolId() (string, error) {
	ipPoolId := os.Getenv("NAUTOBOT_IPV4_POOL_ID")
	if ipPoolId == "" {
		fmt.Println("NAUTOBOT_IPV4_POOL_ID environment variable is not set")
		return "", fmt.Errorf("NAUTOBOT_IPV4_POOL_ID environment variable is not set")
	}
	return ipPoolId, nil
}

func GetIpv4Gateway() (string, error) {
	ipv4Gateway := os.Getenv("NAUTOBOT_IPV4_GATEWAY")
	if ipv4Gateway == "" {
		fmt.Println("NAUTOBOT_IPV4_GATEWAY environment variable is not set")
		return "", fmt.Errorf("NAUTOBOT_IPV4_GATEWAY environment variable is not set")
	}
	return ipv4Gateway, nil
}

func GetIpv6PoolId() (string, error) {
	ipPoolId := os.Getenv("NAUTOBOT_IPV6_POOL_ID")
	if ipPoolId == "" {
		fmt.Println("NAUTOBOT_IPV6_POOL_ID environment variable is not set")
		return "", fmt.Errorf("NAUTOBOT_IPV6_POOL_ID environment variable is not set")
	}
	return ipPoolId, nil
}

func GetIpv6Gateway() (string, error) {
	ipv6Gateway := os.Getenv("NAUTOBOT_IPV6_GATEWAY")
	if ipv6Gateway == "" {
		fmt.Println("NAUTOBOT_IPV6_GATEWAY environment variable is not set")
		return "", fmt.Errorf("NAUTOBOT_IPV6_GATEWAY environment variable is not set")
	}
	return ipv6Gateway, nil
}

func GetNautobotRoleId() (string, error) {
	roleId := os.Getenv("NAUTOBOT_IPAM_ROLE_ID")
	if roleId == "" {
		fmt.Println("NAUTOBOT_IPAM_ROLE_ID environment variable is not set")
		return "", fmt.Errorf("NAUTOBOT_IPAM_ROLE_ID environment variable is not set")
	}
	return roleId, nil
}

func GetNautobotStatusId() (string, error) {
	statusId := os.Getenv("NAUTOBOT_IPAM_STATUS_ID")
	if statusId == "" {
		fmt.Println("NAUTOBOT_IPAM_STATUS_ID environment variable is not set")
		return "", fmt.Errorf("NAUTOBOT_IPAM_STATUS_ID environment variable is not set")
	}
	return statusId, nil
}
