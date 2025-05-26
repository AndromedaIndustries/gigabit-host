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

type GetSkuParams struct {
	SkuId string
}

type GetSkuResponse struct {
	Sku types.Sku
}

func (a *Activities) GetSku(
	ctx context.Context,
	params *GetSkuParams,
) (*GetSkuResponse, error) {
	logger := activity.GetLogger(ctx)

	// 1) Build the Squirrel query
	qb := squirrel.
		Select("row_to_json(s) AS full_sku").
		From(`"Sku" s`).
		Where(squirrel.Eq{"s.id": params.SkuId}).
		PlaceholderFormat(squirrel.Dollar)

	sql, args, err := qb.ToSql()
	if err != nil {
		logger.Error("failed to build SQL", "err", err)
		return nil, err
	}
	logger.Info("GetSku SQL", "sql", sql, "args", args)

	// 2) Run the query
	dbClient := PostgressInterface.GetClient(logger)
	if dbClient == nil {
		logger.Error("database client is nil")
		return nil, errors.New("database client is nil")
	}

	var rawJSON []byte
	if err := dbClient.QueryRow(ctx, sql, args...).Scan(&rawJSON); err != nil {
		logger.Error("query failed", "err", err)
		return nil, errors.New("query failed")
	}
	logger.Info("Found SKU JSON", "json", string(rawJSON))

	// 3) Unmarshal into your Go struct
	sku := &types.Sku{}
	if err := json.Unmarshal(rawJSON, sku); err != nil {
		logger.Error("unmarshal failed", "err", err)
		return nil, errors.New("unmarshal failed")
	}

	return &GetSkuResponse{Sku: *sku}, nil
}
