package activities

import (
	"context"
	"fmt"
	"os"

	"go.temporal.io/sdk/activity"

	"github.com/andromeda/gigabit-host/internal/ProxmoxInterface"
	"github.com/luthermonson/go-proxmox"
)

type GetNextVMIDResponse struct {
	NextVMID int `json:"next_vm_id"`
}

// GetNextVMID is a Temporal activity that fetches the next free VM ID from Proxmox.
func (a *Activities) GetNextVMID(ctx context.Context) (*GetNextVMIDResponse, error) {
	logger := activity.GetLogger(ctx)

	// 1) Initialize the Proxmox client. Adjust the base URL and credentials as needed.
	client := ProxmoxInterface.GetProxmoxClient(logger)

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
	client := ProxmoxInterface.GetProxmoxClient(logger)
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

// Get Proxmox Node with the least VMs
type GetNodeWithLeastVMsResponse struct {
	NodeName string `json:"node_name"`
}

// Temporal activity to get the Proxmox node with the least number of VMs.
func (a *Activities) GetNodeWithLeastVMs(ctx context.Context) (*GetNodeWithLeastVMsResponse, error) {
	logger := activity.GetLogger(ctx)

	// 1) Initialize the Proxmox client
	client := ProxmoxInterface.GetProxmoxClient(logger)
	if client == nil {
		logger.Error("Proxmox client is nil")
		return nil, fmt.Errorf("proxmox client is nil")
	}

	// 2) Get the nodes in the Proxmox cluster
	proxmoxNodes, err := client.Nodes(ctx)
	if err != nil {
		logger.Warn("Failed to connect to Proxmox cluster", "error", err)
		return nil, fmt.Errorf("cluster connection error: %w", err)
	}

	// log the cluster node status
	for _, node := range proxmoxNodes {
		logger.Info("Cluster node", "name", node.Node, "status", node.Status)
	}

	// 3) Get all nodes in the cluster
	var nodes []*proxmox.Node
	for _, clusterNode := range proxmoxNodes {
		logger.Info("Processing cluster node", "name", clusterNode.Node)
		pNode, err := client.Node(ctx, clusterNode.Node)
		if err != nil {
			logger.Warn("failed to fetch node", "name", clusterNode.Node, "err", err)
			continue
		}
		if pNode == nil {
			logger.Warn("client.Node returned nil pointer", "name", clusterNode.Node)
			continue
		}
		nodes = append(nodes, pNode)
	}

	// 4) Find the node with the least number of VMs
	var bestNode string
	minVMCount := int(^uint(0) >> 1) // Max int value

	// 5) Iterate through nodes and count VMs
	if len(nodes) == 0 {
		logger.Warn("No Proxmox nodes found")
		return nil, fmt.Errorf("no Proxmox nodes found")
	}

	// 6) Iterate through each node to find the one with the least VMs
	for _, n := range nodes {
		if n == nil {
			logger.Warn("skipping nil node in VM count loop")
			continue
		}
		vms, err := n.VirtualMachines(ctx)
		if err != nil {
			logger.Warn("Failed to fetch VMs for node", "node", n.Name, "error", err)
			continue
		}

		// Count the number of VMs on this node
		logger.Info("Node VM count", "node", n.Name, "vm_count", len(vms))

		if len(vms) < minVMCount {
			minVMCount = len(vms)
			bestNode = n.Name
		}
	}

	defaultNode := os.Getenv("PROXMOX_DEFAULT_NODE")
	if defaultNode != "" && bestNode == "" {
		logger.Warn("No suitable node found automatically")
		logger.Info("Using default node from environment variable", "default_node", defaultNode)
		bestNode = defaultNode
	}

	logger.Info("Best node found", "node", bestNode, "vm_count", minVMCount)
	return &GetNodeWithLeastVMsResponse{
		NodeName: bestNode,
	}, nil
}
