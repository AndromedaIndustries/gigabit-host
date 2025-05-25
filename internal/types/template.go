package types

// Proxmox mirrors the optional Proxmox block.
type Proxmox struct {
	VMID *int    `json:"vmid,omitempty"`
	Node *string `json:"node,omitempty"`
	Name *string `json:"name,omitempty"`
}

// Metadata holds distro/version plus an optional Proxmox section.
type Metadata struct {
	Distro  *string  `json:"distro,omitempty"`
	Version *string  `json:"version,omitempty"`
	Proxmox *Proxmox `json:"proxmox,omitempty"`
}

// ProxmoxTemplate is the top-level object.
type ProxmoxTemplate struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Version     string   `json:"version"`
	ProxmoxNode string   `json:"proxmox_node"`
	ProxmoxVMID string   `json:"proxmox_vm_id"`
	Description *string  `json:"description,omitempty"`
	CreatedAt   string   `json:"created_at" db:"created_at"`
	UpdatedAt   string   `json:"updated_at" db:"updated_at"`
	DeletedAt   *string  `json:"deleted_at,omitempty" db:"deleted_at"`
	Metadata    Metadata `json:"metadata"`
}
