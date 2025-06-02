package nautobot

import (
	"fmt"

	"resty.dev/v3"
)

func DeleteIpFromIpam(ipId string) error {

	nautobotHost, token, err := getConnectionString()
	if err != nil {
		fmt.Println("Error getting Nautobot connection string:", err)
		return fmt.Errorf("failed to get Nautobot connection string: %w", err)
	}

	client := resty.New()
	defer client.Close()

	req := client.R().
		EnableTrace().
		SetHeader("Authorization", fmt.Sprintf("Token %s", token)).
		SetHeader("Content-Type", "application/json")

	res, err := req.Delete(nautobotHost + "/api/ipam/ip-addresses/" + ipId + "/")

	check(err, "Failed to delete IP to Nautobot")

	if res.IsError() {
		fmt.Printf("Error: %s\n", res.String())
		return fmt.Errorf("failed to delete IP address %s: %s", ipId, res.String())
	}

	return nil
}
