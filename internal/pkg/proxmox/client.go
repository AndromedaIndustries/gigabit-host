package proxmox

import (
	"github.com/andromedaindustries/gigabit-host/internal/pkg/config/types"
	"github.com/luthermonson/go-proxmox"
	"go.uber.org/zap"
)

func getCredentials(config *types.Config) proxmox.Option {
	if config.ProxmoxAuthType == "token" {
		return proxmox.WithAPIToken(
			config.ProxmoxUser+"@"+config.ProxmoxRealm+"!"+config.ProxmoxTokenName,
			config.ProxmoxTokenSecret,
		)
	} else {
		credentials := proxmox.Credentials{
			Username: config.ProxmoxUser + "@" + config.ProxmoxRealm,
			Password: config.ProxmoxPassword,
		}

		return proxmox.WithCredentials(&credentials)
	}

}

func CreateClient(config *types.Config) {
	config.Logger.Info("Initializing Proxmox client", zap.String("address", config.ProxmoxAddress))
	config.ProxmoxClient = proxmox.NewClient(config.ProxmoxAddress, getCredentials(config))
}
