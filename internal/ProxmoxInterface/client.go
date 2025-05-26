package ProxmoxInterface

import (
	"context"
	"fmt"
	"os"

	"github.com/luthermonson/go-proxmox"
	"go.temporal.io/sdk/log"
)

func getProxmoxClientUsingToken(logger log.Logger, hostname string) (*proxmox.Client, error) {
	// Username from env
	proxmoxUsername := os.Getenv("PROXMOX_USER")
	if proxmoxUsername == "" {
		logger.Error("PROXMOX_USERNAME not set")
		os.Exit(1)
	}

	// realm from env
	proxmoxRealm := os.Getenv("PROXMOX_REALM")
	if proxmoxRealm == "" {
		logger.Error("PROXMOX_REALM not set")
		os.Exit(1)
	}

	// tokenName from env
	proxmoxTokenName := os.Getenv("PROXMOX_TOKEN_NAME")
	if proxmoxTokenName == "" {
		logger.Error("PROXMOX_TOKEN_NAME not set")
		os.Exit(1)
	}

	// tokenValue from env
	proxmoxTokenSecret := os.Getenv("PROXMOX_TOKEN_SECRET")
	if proxmoxTokenSecret == "" {
		logger.Error("PROXMOX_TOKEN_SECRET not set")
		os.Exit(1)
	}

	ProxmoxTokenID := fmt.Sprintf("%s@%s!%s", proxmoxUsername, proxmoxRealm, proxmoxTokenName)

	client := proxmox.NewClient("https://"+hostname+"/api2/json",
		proxmox.WithAPIToken(ProxmoxTokenID, proxmoxTokenSecret),
	)

	logger.Info("Proxmox client created")
	return client, nil
}

func GetVersion(logger log.Logger) string {

	client := GetProxmoxClient(logger)

	version, err := client.Version(context.Background())
	if err != nil {
		logger.Error("Unable to get Proxmox version: ", err)
	}

	// Return the version as a string
	return fmt.Sprintf("Proxmox version: %s", version)
}

func GetProxmoxClient(logger log.Logger) *proxmox.Client {

	// Get auth type from env
	proxmoxAuthType := os.Getenv("PROXMOX_AUTH_TYPE")
	if proxmoxAuthType == "" {
		logger.Error("PROXMOX_AUTH_TYPE not set")
	}

	// Hostname from env
	proxmoxAddress := os.Getenv("PROXMOX_ADDRESS")
	if proxmoxAddress == "" {
	}

	var client *proxmox.Client
	var clientError error

	if proxmoxAuthType == "token" {
		client, clientError = getProxmoxClientUsingToken(logger, proxmoxAddress)
		if clientError != nil {
			logger.Error("Error creating Proxmox client:", clientError)
			return nil
		}
	}

	if proxmoxAuthType == "password" {
		logger.Error("Password auth not implemented")
		os.Exit(1)
	}

	if clientError != nil {
		logger.Error("Unable to create Proxmox client")
		os.Exit(1)
	}

	return client
}
