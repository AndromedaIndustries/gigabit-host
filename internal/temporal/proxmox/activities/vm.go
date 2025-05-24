package activities

import (
	"errors"

	"github.com/andromeda/gigabit-host/internal/ProxmoxInterface"
	"github.com/andromeda/gigabit-host/internal/types"
	"logur.dev/logur"
)

type CloneVmActivityParam struct {
	VmObject *types.Service
}

func (a *Activities) CloneVmActivity(
	logger logur.KVLoggerFacade,
	param *CloneVmActivityParam,
) error {
	// Use the shared state in the Activity Object.
	logger.Info("CloneVmActivity", "Message", *a.Message, "Number", *a.Number)

	// Make the results of the Activity Execution available.
	logger.Info("Cloning VM", "VmObject", param.VmObject)

	proxmoxClient := ProxmoxInterface.GetProxmoxClient()

	if proxmoxClient == nil {
		logger.Error("Proxmox client is nil")
		return errors.New("proxmox client is nil")
	}

	return nil
}
