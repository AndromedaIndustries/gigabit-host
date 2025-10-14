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
	ipaminterface "github.com/andromeda/gigabit-host/internal/ipam/ipamInterface"
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

	ipamClient, err := ipaminterface.New(ctx, logger)
	if err != nil {
		logger.Error("failed to initialize ipam client: %e", err)
	}

	logger.Info("Getting next available IPs from Nautobot")
	ipv4, ipv6, ipErr := ipamClient.GetNextAvalableIps(ctx, logger, vm.ID.String(), vm.Hostname)
	if ipErr != nil {
		logger.Error("failed to get next available IPs", "error", ipErr)
		return nil, ipErr
	}

	v4Gateway := ipamClient.V4Gateway().Address
	logger.Info("v4 Gateway IP is ", "addr", v4Gateway)
	v6Gateway := ipamClient.V6Gateway().Address
	logger.Info("v6 Gateway IP is ", "addr", v6Gateway)

	memoryInt := params.Sku.Attributes.Memory * 1024
	// Assuming your client has a SetConfig method that mirrors the Python .config.set(...)
	_, err = proxmoxVM.Config(ctx,
		proxmox.VirtualMachineOption{
			Name:  "net0",
			Value: fmt.Sprintf("virtio,bridge=%s,firewall=1", os.Getenv("PROXMOX_CUSTOMER_BRIDGE_NAME")),
		},
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
			Value: "ip=" + ipv4.Address + ",gw=" + v4Gateway + ",ip6=" + ipv6.Address + ",gw6=" + v6Gateway,
		},
		proxmox.VirtualMachineOption{
			Name:  "nameserver",
			Value: "9.9.9.9 1.1.1.1",
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
	vm.Metadata.Ipv4Address = &ipv4.Address
	vm.Metadata.Ipv4AddressId = ipv4.ID.Str
	vm.Metadata.Ipv6Address = &ipv6.Address
	vm.Metadata.Ipv6AddressId = ipv6.ID.Str
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

	resizeTask, err := proxmoxVM.ResizeDisk(ctx, targetDisk, diskSize)
	if err != nil {
		logger.Error("failed to resize disk", "vmID", vmID, "error", err)
		return fmt.Errorf("failed to resize disk for VM %d: %w", vmID, err)
	}

	status, completed, waitErr := resizeTask.WaitForCompleteStatus(ctx, 30, 5)

	if waitErr != nil {
		logger.Error("Failed to wait for Proxmox VM resize disk task", "vmId", vmID, "error", waitErr)
		return fmt.Errorf("failed to wait for Proxmox VM %d  resize disk task: %w", vmID, waitErr)
	}

	if !completed {
		logger.Error("Proxmox VM  resize disk task did not complete in time", "vmId", vmID, "status", status)
		return fmt.Errorf("proxmox VM %d  resize disk task did not complete in time, status: %v", vmID, status)
	}

	if !status {
		logger.Error("Proxmox VM  resize disk task failed", "vmId", vmID, "status", status)
		return fmt.Errorf("proxmox VM %d  resize disk task failed", vmID)
	}

	logger.Info("Disk resized successfully", "vmID", vmID, "newSizeMiB", diskSize)

	return nil
}
