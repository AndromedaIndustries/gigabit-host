package activities

import (
	"context"
	"encoding/json"
	"errors"

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

	const jsonSQL = `
SELECT row_to_json(s) AS full_service
  FROM "Services" s
 WHERE subscription_active=$1
   AND id              =$2
   AND user_id         =$3;
    `

	// Use the shared state in the Activity Object.
	logger.Info("GetService", "UserId", params.UserId, "ServiceId", params.ServiceId)

	dbClient := PostgressInterface.GetClient()

	if dbClient == nil {
		logger.Error("Database client is nil")
		return nil, errors.New("database client is nil")
	}

	service := &types.Service{}
	var rawJSON []byte
	// Query the database for the service
	err := dbClient.QueryRow(
		context.Background(),
		jsonSQL,
		true,
		params.ServiceId,
		params.UserId).Scan(&rawJSON)

	if err != nil {
		logger.Error("query failed: %v", err)
		return nil, errors.New("query failed")
	}

	logger.Info("Found service", "Service", string(rawJSON))

	if err := json.Unmarshal(rawJSON, &service); err != nil {
		logger.Error("Service not found", "UserId", params.UserId, "ServiceId", params.ServiceId)
		return nil, errors.New("service not found")
	}

	logger.Info("Service found", "Service", service)

	return &GetServiceResponse{
		Service: *service,
	}, nil

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

	logger.Info("Updating services")

	return &UpdateServiceResponse{
		Status:  "Success",
		Success: true,
	}, nil
}
