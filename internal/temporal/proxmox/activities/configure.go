package activities

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"github.com/luthermonson/go-proxmox"
	"go.temporal.io/sdk/activity"
	"golang.org/x/net/publicsuffix"

	"github.com/andromeda/gigabit-host/internal/ProxmoxInterface"
	"github.com/andromeda/gigabit-host/internal/types"
)

// ConfigureVMActivityParams holds the inputs to the activity.
type ConfigureVMActivityParams struct {
	VmObject      types.Service
	Sku           types.Sku
	EncodedSSHKey string
}

// ConfigureVMActivityResponse is what the activity returns on success.
type ConfigureVMActivityResponse struct {
	VmObject *types.Service
}

// ConfigureVMActivity configures CPU, memory, and cloud-init on a freshly-cloned VM.
func (a *Activities) ConfigureVMActivity(
	ctx context.Context,
	params *ConfigureVMActivityParams,
) (*ConfigureVMActivityResponse, error) {
	logger := activity.GetLogger(ctx)

	// 1) Proxmox client
	client := ProxmoxInterface.GetProxmoxClient(logger)
	if client == nil {
		logger.Error("Proxmox client is nil")
		return nil, fmt.Errorf("proxmox client is nil")
	}

	vm := params.VmObject
	node := *vm.ProxmoxNode

	// 2) Derive domain via publicsuffix (eTLD+1)
	domain, err := publicsuffix.EffectiveTLDPlusOne(vm.Hostname)
	if err != nil || domain == "" {
		domain = "example.com"
	} // :contentReference[oaicite:0]{index=0}

	// 4) Compute resources
	cores := strconv.Itoa(params.Sku.Attributes.CpuCores)
	memory := strconv.Itoa(params.Sku.Attributes.Memory * 1024) // MiB → KiB

	// 5) Apply the VM config
	logger.Info("Configuring VM",
		"hostname", vm.Hostname,
		"vmID", *vm.ProxmoxVMID,
		"cores", cores,
		"memoryKiB", memory,
	)

	// Turn the VMID string into int
	vmID, err := strconv.Atoi(*vm.ProxmoxVMID)
	if err != nil {
		logger.Error("invalid VM ID", "vmID", *vm.ProxmoxVMID, "error", err)
		return nil, err
	}

	proxmoxNode, err := client.Node(ctx, node)
	if err != nil {
		logger.Error("failed to get Proxmox node", "node", node, "error", err)
		return nil, err
	}

	proxmoxVM, err := proxmoxNode.VirtualMachine(ctx, vmID)
	if err != nil {
		logger.Error("failed to get Proxmox VM", "vmID", vmID, "error", err)
		return nil, err
	}

	memoryInt := params.Sku.Attributes.Memory * 1024
	// Assuming your client has a SetConfig method that mirrors the Python .config.set(...)
	_, err = proxmoxVM.Config(ctx,
		proxmox.VirtualMachineOption{
			Name:  "cores",
			Value: params.Sku.Attributes.CpuCores,
		},
		proxmox.VirtualMachineOption{
			Name:  "memory",
			Value: memoryInt,
		},
		proxmox.VirtualMachineOption{
			Name:  "ciuser",
			Value: vm.Username,
		},
		proxmox.VirtualMachineOption{
			Name:  "sshkeys",
			Value: params.EncodedSSHKey,
		},
		proxmox.VirtualMachineOption{
			Name:  "ciupgrade",
			Value: 1,
		},
		proxmox.VirtualMachineOption{
			Name:  "ipconfig0",
			Value: "ip=dhcp,ip6=auto",
		},
		proxmox.VirtualMachineOption{
			Name:  "nameserver",
			Value: "1.1.1.1",
		},
		proxmox.VirtualMachineOption{
			Name:  "searchdomain",
			Value: domain,
		},
	)

	if err != nil {
		logger.Warn("VM configuration failed", "error", err)
		return nil, err
	}

	// 6) Success: update status and timestamp
	vm.Status = "configured"
	logger.Info("VM configured successfully", "vmID", vmID)

	return &ConfigureVMActivityResponse{VmObject: &vm}, nil
}

// Resize disk for larger VMs
type ResizeDiskActivityParams struct {
	VmObject types.Service
	Sku      types.Sku
}

func (a *Activities) ResizeDiskActivity(
	ctx context.Context,
	params *ResizeDiskActivityParams,
) error {
	logger := activity.GetLogger(ctx)

	// 1) Proxmox client
	client := ProxmoxInterface.GetProxmoxClient(logger)
	if client == nil {
		logger.Error("Proxmox client is nil")
		return fmt.Errorf("proxmox client is nil")
	}

	vm := params.VmObject
	node := *vm.ProxmoxNode

	// 2) Get the Proxmox node and VM
	proxmoxNode, err := client.Node(ctx, node)
	if err != nil {
		logger.Error("failed to get Proxmox node", "node", node, "error", err)
		return err
	}

	vmID, err := strconv.Atoi(*vm.ProxmoxVMID)
	if err != nil {
		logger.Error("invalid VM ID", "vmID", *vm.ProxmoxVMID, "error", err)
		return err
	}

	proxmoxVM, err := proxmoxNode.VirtualMachine(ctx, vmID)
	if err != nil {
		logger.Error("failed to get Proxmox VM", "vmID", vmID, "error", err)
		return err
	}

	diskSize := strconv.Itoa(params.Sku.Attributes.StorageSize) + "G"

	// 3) Resize the disk

	targetDisk := os.Getenv("PROXMOX_TARGET_DISK")
	if targetDisk == "" {
		targetDisk = "virtio0" // Default disk if not set
	}

	err = proxmoxVM.ResizeDisk(ctx, targetDisk, diskSize)
	if err != nil {
		logger.Error("failed to resize disk", "vmID", vmID, "error", err)
		return fmt.Errorf("failed to resize disk for VM %d: %w", vmID, err)
	}

	logger.Info("Disk resized successfully", "vmID", vmID, "newSizeMiB", diskSize)

	return nil
}
