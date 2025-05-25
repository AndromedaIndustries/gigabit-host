package activities

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"unicode/utf8"

	"github.com/Masterminds/squirrel"
	"github.com/andromeda/gigabit-host/internal/PostgressInterface"
	"github.com/andromeda/gigabit-host/internal/types"
	"github.com/andromeda/gigabit-host/internal/utilities"
	"go.temporal.io/sdk/activity"
)

type GetServiceParams struct {
	UserId    string
	ServiceId string
}

type GetServiceResponse struct {
	Service types.Service
}

func (a *Activities) GetService(
	ctx context.Context,
	params *GetServiceParams,
) (*GetServiceResponse, error) {
	logger := activity.GetLogger(ctx)

	// 1) Build the Squirrel query
	qb := squirrel.
		Select("row_to_json(t) AS full_service").
		FromSelect(
			squirrel.Select(
				"id",
				"user_id",
				"service_type",
				"hostname",
				"template_id",
				"os_name",
				"os_version",
				"public_key_id",
				"username",
				// cast metadata text → JSON so it's emitted as an object
				"metadata::jsonb AS metadata",
				"sku_id",
				"current_sku_id",
				"initial_sku_id",
				"subscription_active",
				"subscription_id",
				"initial_checkout_id",
				"status",
				"status_reason",
				"payment_ids",
				"payment_status",
				"created_at",
				"updated_at",
				"deleted_at",
				"account_id",
				"proxmox_node",
				"proxmox_vm_id",
			).
				From(`"Services"`),
			"t",
		).
		Where(squirrel.Eq{
			"subscription_active": true,
			"id":                  params.ServiceId,
			"user_id":             params.UserId,
		}).
		PlaceholderFormat(squirrel.Dollar)

	sql, args, err := qb.ToSql()
	if err != nil {
		logger.Error("failed to build SQL", "err", err)
		return nil, err
	}

	logger.Info("GetService SQL", "sql", sql, "args", args)

	logger.Info("GetService", "UserId", params.UserId, "ServiceId", params.ServiceId)

	// 2) Execute
	dbClient := PostgressInterface.GetClient()

	if dbClient == nil {
		logger.Error("Database client is nil")
		return nil, errors.New("database client is nil")
	}

	var rawJSON []byte
	if err := dbClient.QueryRow(ctx, sql, args...).Scan(&rawJSON); err != nil {
		logger.Error("query failed", "err", err)
		return nil, errors.New("query failed")
	}

	// 3) Unmarshal
	svc := &types.Service{}
	if err := json.Unmarshal(rawJSON, svc); err != nil {
		logger.Error("unmarshal failed", "err", err)
		return nil, errors.New("service not found")
	}

	logger.Info("Service found svc with ID", svc.ID)
	return &GetServiceResponse{Service: *svc}, nil

}

type UpdateServiceParams struct {
	Service types.Service
}

type UpdateServiceResponse struct {
	Status  string
	Success bool
}

func (a *Activities) UpdateService(
	ctx context.Context,
	params *UpdateServiceParams,
) (*UpdateServiceResponse, error) {
	logger := activity.GetLogger(ctx)

	// 1. Convert raw UUID bytes (16-byte slice) into dashed string form.
	idStr := params.Service.ID.String()

	// 2. Dereference pointer fields so Exec sees plain values or nil.
	var nodeVal interface{}
	if params.Service.ProxmoxNode != nil {
		nodeVal = *params.Service.ProxmoxNode
	}
	var vmIDVal interface{}
	if params.Service.ProxmoxVMID != nil {
		vmIDVal = *params.Service.ProxmoxVMID
	}

	// 3. Ensure Metadata (if it's JSON raw bytes) is a string.

	metaBytes, err := json.Marshal(params.Service.Metadata)
	if err != nil {
		logger.Error("failed to marshal metadata", "err", err)
		return nil, errors.New("failed to marshal metadata")
	}
	metadataVal := string(metaBytes)

	// 4. Build the UPDATE query.
	builder := squirrel.
		Update(`"Services"`).
		PlaceholderFormat(squirrel.Dollar).
		Set("user_id", params.Service.UserID).
		Set("service_type", utilities.Sanitize(params.Service.ServiceType)).
		Set("hostname", utilities.Sanitize(params.Service.Hostname)).
		Set("template_id", utilities.Sanitize(params.Service.TemplateID)).
		Set("os_name", utilities.Sanitize(params.Service.OSName)).
		Set("os_version", utilities.Sanitize(params.Service.OSVersion)).
		Set("public_key_id", utilities.Sanitize(params.Service.PublicKeyID)).
		Set("username", utilities.Sanitize(params.Service.Username)).
		Set("metadata", metadataVal).
		Set("sku_id", utilities.Sanitize(params.Service.SKUID)).
		Set("current_sku_id", utilities.Sanitize(params.Service.CurrentSKUID)).
		Set("initial_sku_id", utilities.Sanitize(params.Service.InitialSKUID)).
		Set("subscription_active", params.Service.SubscriptionActive).
		Set("status", utilities.Sanitize(params.Service.Status)).
		Set("status_reason", params.Service.StatusReason).
		Set("payment_status", params.Service.PaymentStatus).
		Set("proxmox_node", nodeVal).
		Set("proxmox_vm_id", vmIDVal).
		Set("updated_at", squirrel.Expr("NOW()")).
		Where(squirrel.Eq{"id": idStr})

	sqlStr, args, err := builder.ToSql()
	if err != nil {
		logger.Error("failed to build SQL", "err", err)
		return nil, err
	}

	// 5. (Optional) Double-check that no []byte or pointer slips through
	for i, a := range args {
		switch v := a.(type) {
		case []byte:
			if !utf8.Valid(v) {
				logger.Error("arg []byte not valid UTF-8", "index", i, "raw", v)
			}
		case *string, *int, *bool:
			logger.Error("arg is Go pointer, dereference first", "index", i, "type", fmt.Sprintf("%T", v))
		}
	}

	logger.Info("UpdateService SQL", "sql", sqlStr, "args", args)
	if _, err := PostgressInterface.GetClient().Exec(ctx, sqlStr, args...); err != nil {
		logger.Error("failed to exec update", "err", err)
		return nil, errors.New("failed to update service")
	}

	logger.Info("Updated service successfully", "ServiceID", idStr)
	return &UpdateServiceResponse{"Success", true}, nil
}
