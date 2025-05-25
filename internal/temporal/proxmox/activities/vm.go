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
func (a *Activities) CloneVMActivity(
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
	logger.Info("Cloning VM template",
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
	newId, cloneTask, cloneErr := proxmoxVM.Clone(ctx, &proxmoxCloneOptions)
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
	status, completed, startErr := cloneTask.WaitForCompleteStatus(ctx, 300, 10)
	if startErr != nil {
		logger.Error("Failed to wait for Proxmox VM clone task", "vmId", idStr, "error", startErr)
		return nil, fmt.Errorf("failed to wait for Proxmox VM %d clone task: %w", &idStr, startErr)
	}

	if !completed {
		logger.Error("Proxmox VM clone task did not complete in time", "vmId", idStr, "status", status)
		return nil, fmt.Errorf("proxmox VM %d clone task did not complete in time, status: %v", &idStr, status)
	}

	if !status {
		logger.Error("Proxmox VM clone task failed", "vmId", idStr, "status", status)
		return nil, fmt.Errorf("proxmox VM %d clone task failed", &idStr)
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

// Start VM

type StartVMActivityParams struct {
	VmObject types.Service
	VmId     int
}

func (a *Activities) StartVMActivity(
	ctx context.Context,
	params StartVMActivityParams,
) error {
	logger := activity.GetLogger(ctx)

	// 1) Get the Proxmox client
	client := ProxmoxInterface.GetProxmoxClient()
	if client == nil {
		logger.Error("Proxmox client is nil")
		return fmt.Errorf("proxmox client is nil")
	}

	node, clientErr := client.Node(ctx, *params.VmObject.ProxmoxNode) // Adjust node name as needed
	if clientErr != nil {
		logger.Error("Failed to get Proxmox node", "error", clientErr)
		return fmt.Errorf("failed to get Proxmox node: %w", clientErr)
	}

	vm, nodeErr := node.VirtualMachine(ctx, params.VmId)
	if nodeErr != nil {
		logger.Error("Failed to get Proxmox VM", "vmId", params.VmId, "error", nodeErr)
		return fmt.Errorf("failed to get Proxmox VM %d: %w", params.VmId, nodeErr)
	}

	// 2) Start the VM
	startTask, startErr := vm.Start(ctx)
	if startErr != nil {
		logger.Error("Failed to start Proxmox VM", "vmId", params.VmId, "error", startErr)
		return fmt.Errorf("failed to start Proxmox VM %d: %w", params.VmId, startErr)
	}

	// 3) Wait for the task to complete
	status, completed, startErr := startTask.WaitForCompleteStatus(ctx, 30, 5) // Wait for up to 50 seconds, checking every 5 seconds
	if startErr != nil {
		logger.Error("Failed to wait for Proxmox VM start task", "vmId", params.VmId, "error", startErr)
		return fmt.Errorf("failed to wait for Proxmox VM %d start task: %w", params.VmId, startErr)
	}

	if !completed {
		logger.Error("Proxmox VM start task did not complete in time", "vmId", params.VmId, "status", status)
		return fmt.Errorf("proxmox VM %d start task did not complete in time, status: %v", params.VmId, status)
	}

	if !status {
		logger.Error("Proxmox VM start task failed", "vmId", params.VmId, "status", status)
		return fmt.Errorf("proxmox VM %d start task failed", params.VmId)
	}

	// 3) Return success
	logger.Info("VM started successfully", "vmId", params.VmId)

	// Optionally, you can return the updated VM object if needed
	return nil
}
