package activities

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/Masterminds/squirrel"
	"github.com/andromeda/gigabit-host/internal/PostgressInterface"
	"github.com/andromeda/gigabit-host/internal/types"
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
		Select("row_to_json(s) AS full_service").
		From(`"Services" s`).
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

	// Use the shared state in the Activity Object.
	logger.Info("GetService", params.Service.CurrentSKUID)

	dbClient := PostgressInterface.GetClient()

	if dbClient == nil {
		logger.Error("Database client is nil")
		return nil, errors.New("database client is nil")
	}

	// Build the UPDATE ... SET ... WHERE id = $N
	builder := squirrel.
		Update(`"Services"`).
		PlaceholderFormat(squirrel.Dollar).
		Set("user_id", params.Service.UserID).
		Set("service_type", params.Service.ServiceType).
		Set("hostname", params.Service.Hostname).
		Set("template_id", params.Service.TemplateID).
		Set("os_name", params.Service.OSName).
		Set("os_version", params.Service.OSVersion).
		Set("public_key_id", params.Service.PublicKeyID).
		Set("username", params.Service.Username).
		Set("metadata", params.Service.Metadata).
		Set("sku_id", params.Service.SKUID).
		Set("current_sku_id", params.Service.CurrentSKUID).
		Set("initial_sku_id", params.Service.InitialSKUID).
		Set("subscription_active", params.Service.SubscriptionActive).
		Set("subscription_id", params.Service.SubscriptionID).
		Set("initial_checkout_id", params.Service.InitialCheckoutID).
		Set("status", params.Service.Status).
		Set("status_reason", params.Service.StatusReason).
		Set("payment_ids", params.Service.PaymentIDs).
		Set("payment_status", params.Service.PaymentStatus).
		Set("deleted_at", params.Service.DeletedAt).
		Set("account_id", params.Service.AccountID).
		Set("proxmox_node", params.Service.ProxmoxNode).
		Set("proxmox_vm_id", params.Service.ProxmoxVMID).
		Set("updated_at", squirrel.Expr("NOW()")).
		Where(squirrel.Eq{"id": params.Service.ID})

	sql, args, err := builder.ToSql()
	if err != nil {
		logger.Error("failed to build SQL", err)
		return nil, err
	}

	if _, err := dbClient.Exec(ctx, sql, args...); err != nil {
		logger.Error("failed to update service", err)
		return nil, errors.New("failed to update service")
	}

	logger.Info("Updated services successfully", "ServiceID", params.Service.ID)

	return &UpdateServiceResponse{
		Status:  "Success",
		Success: true,
	}, nil
}
