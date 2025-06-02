package nautobot

import (
	"fmt"

	"github.com/nautobot/go-nautobot/v2"
	"resty.dev/v3"
)

type NewIP struct {
	Address string `json:"address"`
	Status  string `json:"status"`
	Role    string `json:"role"`
	Parent  string `json:"parent"`
}

func AddIpv4ToIpam(nextIP string) (*nautobot.IPAddress, error) {

	nautobotHost, token, err := getConnectionString()
	if err != nil {
		fmt.Println("Error getting Nautobot connection string:", err)
		return &nautobot.IPAddress{}, fmt.Errorf("failed to get Nautobot connection string: %w", err)
	}

	client := resty.New()
	defer client.Close()

	req := client.R().
		EnableTrace().
		SetHeader("Authorization", fmt.Sprintf("Token %s", token)).
		SetHeader("Content-Type", "application/json")

	status, statusErr := GetNautobotStatusId()
	if statusErr != nil {
		fmt.Println("Error getting Nautobot status ID:", statusErr)
		return &nautobot.IPAddress{}, fmt.Errorf("failed to get Nautobot status ID: %w", statusErr)
	}

	role, roleErr := GetNautobotRoleId()
	if roleErr != nil {
		fmt.Println("Error getting Nautobot role ID:", roleErr)
		return &nautobot.IPAddress{}, fmt.Errorf("failed to get Nautobot role ID: %w", roleErr)
	}

	parentId, parentErr := GetIpv4PoolId()
	if parentErr != nil {
		fmt.Println("Error getting IPv6 pool ID:", parentErr)
		return &nautobot.IPAddress{}, fmt.Errorf("failed to get IPv6 pool ID: %w", parentErr)
	}

	newIPv4 := NewIP{
		Address: nextIP,
		Status:  status,
		Role:    role,
		Parent:  parentId,
	}

	res, err := req.
		SetBody(newIPv4).
		SetResult(&nautobot.IPAddress{}).
		Post(nautobotHost + "/api/ipam/ip-addresses/")

	check(err, "Failed to add IP to Nautobot")

	if res.IsError() {
		fmt.Printf("Error: %s\n", res.String())
		return &nautobot.IPAddress{}, fmt.Errorf("failed to add IP address %s: %s", nextIP, res.String())
	}

	ipAddress := res.Result().(*nautobot.IPAddress)

	return ipAddress, nil
}

func AddIpv6ToIpam(nextIP string) (*nautobot.IPAddress, error) {

	nautobotHost, token, err := getConnectionString()
	if err != nil {
		fmt.Println("Error getting Nautobot connection string:", err)
		return &nautobot.IPAddress{}, fmt.Errorf("failed to get Nautobot connection string: %w", err)
	}

	client := resty.New()
	defer client.Close()

	req := client.R().
		EnableTrace().
		SetHeader("Authorization", fmt.Sprintf("Token %s", token)).
		SetHeader("Content-Type", "application/json")

	status, statusErr := GetNautobotStatusId()
	if statusErr != nil {
		fmt.Println("Error getting Nautobot status ID:", statusErr)
		return &nautobot.IPAddress{}, fmt.Errorf("failed to get Nautobot status ID: %w", statusErr)
	}

	role, roleErr := GetNautobotRoleId()
	if roleErr != nil {
		fmt.Println("Error getting Nautobot role ID:", roleErr)
		return &nautobot.IPAddress{}, fmt.Errorf("failed to get Nautobot role ID: %w", roleErr)
	}

	parentId, parentErr := GetIpv6PoolId()
	if parentErr != nil {
		fmt.Println("Error getting IPv6 pool ID:", parentErr)
		return &nautobot.IPAddress{}, fmt.Errorf("failed to get IPv6 pool ID: %w", parentErr)
	}

	newIPv6 := NewIP{
		Address: nextIP,
		Status:  status,
		Role:    role,
		Parent:  parentId,
	}

	res, err := req.
		SetBody(newIPv6).
		SetResult(&nautobot.IPAddress{}).
		Post(nautobotHost + "/api/ipam/ip-addresses/")

	check(err, "Failed to add IP to Nautobot")

	if res.IsError() {
		fmt.Printf("Error: %s\n", res.String())
		return &nautobot.IPAddress{}, fmt.Errorf("failed to add IP address %s: %s", nextIP, res.String())
	}

	ipAddress := res.Result().(*nautobot.IPAddress)

	return ipAddress, nil
}
