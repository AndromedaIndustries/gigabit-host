package activities

import (
	"context"
	"fmt"
	"strconv"

	"go.temporal.io/sdk/activity"

	"github.com/andromeda/gigabit-host/internal/ProxmoxInterface"
	"github.com/andromeda/gigabit-host/internal/types"
	"github.com/luthermonson/go-proxmox"
)

// CloneVMActivityParams holds the inputs to the activity.
type CloneVMActivityParams struct {
	VMObject      types.Service
	TargetStorage string
	TargetNode    string
	Template      types.ProxmoxTemplate
	CloneVMID     int
}

type CloneVMActivityResponse struct {
	VMObject *types.Service
}

// CloneVMActivity clones a VM from a template, waits for it to finish,
// and returns the updated Service struct or an error.
func CloneVMActivity(
	ctx context.Context,
	params CloneVMActivityParams,
) (*CloneVMActivityResponse, error) {
	logger := activity.GetLogger(ctx)

	// 1) Get the Proxmox client
	client := ProxmoxInterface.GetProxmoxClient()
	if client == nil {
		logger.Error("Proxmox client is nil")
		return nil, fmt.Errorf("proxmox client is nil")
	}

	sourceNode := params.Template.ProxmoxNode
	sourceID, sourceErr := strconv.Atoi(params.Template.ProxmoxVMID)
	if sourceErr != nil {
		logger.Error("Failed to parse source VM ID", "error", sourceErr)
		return nil, fmt.Errorf("failed to parse source VM ID %s: %w", params.Template.ProxmoxVMID, sourceErr)
	}
	targetID := params.CloneVMID

	storage := params.TargetStorage
	if storage == "" {
		logger.Error("Target storage is empty")
		return nil, fmt.Errorf("target storage cannot be empty")
	}

	targetNode := params.TargetNode
	if targetNode == "" {
		logger.Error("Target node is empty")
		return nil, fmt.Errorf("target node cannot be empty")
	}

	// 2) Kick off the clone
	logger.Warn("Cloning VM template",
		"sourceVMID", sourceID,
		"targetVMID", targetID,
		"sourceNode", sourceNode,
		"targetNode", targetNode,
		"hostname", params.VMObject.Hostname,
	)

	proxmoxCloneOptions := proxmox.VirtualMachineCloneOptions{
		NewID:   targetID,
		Full:    1,
		Name:    params.VMObject.Hostname,
		Storage: storage,
	}

	proxmoxNode, nodeErr := client.Node(ctx, sourceNode)
	if nodeErr != nil {
		logger.Error("Failed to get Proxmox node", "node", sourceNode, "error", nodeErr)
		return nil, fmt.Errorf("failed to get Proxmox node %s: %w", sourceNode, nodeErr)
	}

	proxmoxVM, vmErr := proxmoxNode.VirtualMachine(ctx, sourceID)
	if vmErr != nil {
		logger.Error("Failed to get Proxmox VM", "vmID", sourceID, "error", vmErr)
		return nil, fmt.Errorf("failed to get Proxmox VM %d: %w", sourceID, vmErr)
	}

	// Start the clone task
	newId, task, cloneErr := proxmoxVM.Clone(ctx, &proxmoxCloneOptions)
	if cloneErr != nil {
		logger.Error("Failed to start clone task", "error", cloneErr)
		return nil, cloneErr
	}

	// 3) Update your Service object
	svc := params.VMObject
	idStr := strconv.Itoa(newId)
	svc.ProxmoxVMID = &idStr
	svc.ProxmoxNode = &targetNode

	// 4) Wait for the task to complete
	for {
		if task.Status == "failed" {
			logger.Error("Clone task failed")
			return nil, fmt.Errorf("clone task failed")
		}

		if task.Status == "stopped" || task.Status == "finished" {
			logger.Info("Clone task completed successfully", "taskID", task.ID, "status", task.Status)
			break
		}
		logger.Info("Waiting for clone task to complete", "taskID", task.ID, "status", task.Status)
	}

	// 6) Success!
	logger.Info("Clone completed", "newVMID", targetID)
	svc.Status = "active"
	statusReason := fmt.Sprintf("VM cloned from template %s with ID %d", params.Template.ID, sourceID)
	svc.StatusReason = &statusReason
	svc.ProxmoxVMID = &idStr
	svc.ProxmoxNode = &targetNode
	return &CloneVMActivityResponse{
		VMObject: &svc,
	}, nil
}
