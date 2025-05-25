// /home/xn4p4lm/projects/andromeda/gigabit-host/internal/types/vmObject/service.go
package types

import (
	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

type ServiceMetadata struct {
	InitialSku  string `json:"initial_sku"`
	InitalPrice string `json:"initial_price"`
}

type Service struct {
	ID                 ulid.ULID       `json:"id" db:"id"`
	UserID             uuid.UUID       `json:"user_id" db:"user_id"`
	ServiceType        string          `json:"service_type" db:"service_type"`
	Hostname           string          `json:"hostname" db:"hostname"`
	TemplateID         string          `json:"template_id" db:"template_id"`
	OSName             string          `json:"os_name" db:"os_name"`
	OSVersion          string          `json:"os_version" db:"os_version"`
	PublicKeyID        string          `json:"public_key_id" db:"public_key_id"`
	Username           string          `json:"username" db:"username"`
	Metadata           ServiceMetadata `json:"metadata" db:"metadata"`
	SKUID              string          `json:"sku_id" db:"sku_id"`
	CurrentSKUID       string          `json:"current_sku_id" db:"current_sku_id"`
	InitialSKUID       string          `json:"initial_sku_id" db:"initial_sku_id"`
	SubscriptionActive bool            `json:"subscription_active" db:"subscription_active"`
	SubscriptionID     *string         `json:"subscription_id,omitempty" db:"subscription_id"`
	InitialCheckoutID  *string         `json:"initial_checkout_id,omitempty" db:"initial_checkout_id"`
	Status             string          `json:"status" db:"status"`
	StatusReason       *string         `json:"status_reason,omitempty" db:"status_reason"`
	PaymentIDs         []string        `json:"payment_ids" db:"payment_ids"`
	PaymentStatus      *string         `json:"payment_status,omitempty" db:"payment_status"`
	CreatedAt          string          `json:"created_at" db:"created_at"`
	UpdatedAt          string          `json:"updated_at" db:"updated_at"`
	DeletedAt          *string         `json:"deleted_at,omitempty" db:"deleted_at"`
	AccountID          *string         `json:"account_id,omitempty" db:"account_id"`
	ProxmoxNode        *string         `json:"proxmox_node,omitempty" db:"proxmox_node"`
	ProxmoxVMID        *string         `json:"proxmox_vm_id,omitempty" db:"proxmox_vm_id"`
}
