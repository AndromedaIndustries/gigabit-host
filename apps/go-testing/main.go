package main

import (
	"fmt"
	"os"
	"time"

	"github.com/andromeda/gigabit-host/internal/nautobot"
	"github.com/joho/godotenv"
)

type NewIP struct {
	Address string `json:"address"`
	Status  string `json:"status"`
	Role    string `json:"role"`
	Parent  string `json:"parent"`
}

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Error loading .env file")
		os.Exit(1)
	}

	nextIP := nautobot.GetNextIpFromIpam()
	fmt.Printf("Next available IP: %s\n", nextIP)

	res := nautobot.AddIpToIpam(nextIP)

	// get the ID from the response
	ipAddressId := res.Id

	// sleep for 2 mins
	time.Sleep(2 * time.Minute)

	deleteErr := nautobot.DeleteIpFromIpam(ipAddressId)

	if !deleteErr {
		fmt.Printf("Failed to delete IP address %s\n", ipAddressId)
		os.Exit(1)
	}

	fmt.Printf("IP address %s deleted successfully\n", ipAddressId)
}
