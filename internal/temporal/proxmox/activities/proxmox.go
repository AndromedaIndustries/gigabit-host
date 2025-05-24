package activities

import (
	"context"
	"fmt"

	"go.temporal.io/sdk/activity"

	"github.com/andromeda/gigabit-host/internal/ProxmoxInterface"
)

type GetNextVMIDResponse struct {
	NextVMID int `json:"next_vm_id"`
}

// GetNextVMID is a Temporal activity that fetches the next free VM ID from Proxmox.
func (a *Activities) GetNextVMID(ctx context.Context) (*GetNextVMIDResponse, error) {
	logger := activity.GetLogger(ctx)

	// 1) Initialize the Proxmox client. Adjust the base URL and credentials as needed.
	client := ProxmoxInterface.GetProxmoxClient()

	// 2) Get the cluster interface
	cluster, err := client.Cluster(ctx)
	if err != nil {
		logger.Warn("Failed to connect to Proxmox cluster", "error", err)
		return &GetNextVMIDResponse{
			NextVMID: 0,
		}, fmt.Errorf("cluster connection error: %w", err)
	}

	// 3) Ask Proxmox for the next VM ID
	nextID, err := cluster.NextID(ctx)
	if err != nil {
		logger.Warn("Failed to fetch next VM ID", "error", err)
		return &GetNextVMIDResponse{
			NextVMID: 0,
		}, fmt.Errorf("nextid error: %w", err)
	}

	// 4) Log and return
	logger.Info("Next VM ID fetched", "id", nextID)
	return &GetNextVMIDResponse{
		NextVMID: nextID,
	}, nil
}

type GetStorageWithMostFreeSpaceParams struct {
	Node string `json:"node"`
}

type GetStorageWithMostFreeSpaceResponse struct {
	StorageID string `json:"storage_id"`
}

// Get the storage with the most free space
func (a *Activities) GetStorageWithMostFreeSpace(ctx context.Context, params *GetStorageWithMostFreeSpaceParams) (*GetStorageWithMostFreeSpaceResponse, error) {
	logger := activity.GetLogger(ctx)

	// 1) Initialize the Proxmox client
	client := ProxmoxInterface.GetProxmoxClient()
	if client == nil {
		logger.Error("Proxmox client is nil")
		return nil, fmt.Errorf("proxmox client is nil")
	}

	// 2) Get the specified node
	node, err := client.Node(ctx, params.Node)
	if err != nil {
		logger.Warn("Failed to get Proxmox node", "node", params.Node, "error", err)
		return nil, fmt.Errorf("failed to get node %s: %w", params.Node, err)
	}

	// 3) Fetch storage information
	storage, err := node.Storages(ctx)
	if err != nil {
		logger.Warn("Failed to fetch storage information", "error", err)
		return nil, fmt.Errorf("failed to fetch storage info: %w", err)
	}

	// 4) Find the storage with the most free space
	var bestStorage string
	maxFreeSpace := uint64(0)

	for _, s := range storage {
		if s.Avail > maxFreeSpace {
			maxFreeSpace = s.Avail
			bestStorage = s.Name
		}
	}

	if bestStorage == "" {
		logger.Warn("No suitable storage found")
		return nil, fmt.Errorf("no suitable storage found")
	}

	logger.Info("Best storage found", "storage", bestStorage, "free_space", maxFreeSpace)
	return &GetStorageWithMostFreeSpaceResponse{
		StorageID: bestStorage,
	}, nil
}
