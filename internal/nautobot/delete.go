package nautobot

import (
	"fmt"
	"os"

	"resty.dev/v3"
)

func DeleteIpFromIpam(ipId string) error {

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
