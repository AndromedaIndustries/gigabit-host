package nautobot

import (
	"fmt"
	"os"

	"github.com/nautobot/go-nautobot/v2"
	"resty.dev/v3"
)

type NewIP struct {
	Address string `json:"address"`
	Status  string `json:"status"`
	Role    string `json:"role"`
	Parent  string `json:"parent"`
}

func AddIpToIpam(nextIP string) *nautobot.IPAddress {

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

	ipPoolId := os.Getenv("NAUTOBOT_IP_POOL_ID")
	if ipPoolId == "" {
		fmt.Println("NAUTOBOT_IP_POOL_ID environment variable is not set")
		os.Exit(1)
	}
	client := resty.New()
	defer client.Close()

	req := client.R().
		EnableTrace().
		SetHeader("Authorization", fmt.Sprintf("Token %s", token)).
		SetHeader("Content-Type", "application/json")

	newIPv4 := NewIP{
		Address: nextIP,
		Status:  "7015e139-d33f-488d-9ac4-f399e7368f4c",
		Role:    "3ea0d0ba-fa8c-4b54-8bb6-2f7591b41673",
		Parent:  "df684270-6793-4372-85ef-ba4d1360f896",
	}

	res, err := req.
		SetBody(newIPv4).
		SetResult(&nautobot.IPAddress{}).
		Post(nautobotHost + "/api/ipam/ip-addresses/")

	check(err, "Failed to add IP to Nautobot")

	if res.IsError() {
		fmt.Printf("Error: %s\n", res.String())
		os.Exit(1)
	}

	ipAddress := res.Result().(*nautobot.IPAddress)

	return ipAddress
}
