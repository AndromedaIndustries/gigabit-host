package activities

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/Masterminds/squirrel"
	"go.temporal.io/sdk/activity"

	"github.com/andromeda/gigabit-host/internal/PostgressInterface"
	"github.com/andromeda/gigabit-host/internal/types"
)

type GetTemplateParams struct {
	TemplateId string
}

type GetTemplateResponse struct {
	Template types.ProxmoxTemplate
}

func (a *Activities) GetProxmoxTemplate(
	ctx context.Context,
	params *GetTemplateParams,
) (*GetTemplateResponse, error) {
	logger := activity.GetLogger(ctx)

	// 1) Build the Squirrel query
	qb := squirrel.
		Select("row_to_json(t) AS full_template").
		From(`"ProxmoxTemplates" t`).
		Where(squirrel.Eq{"t.id": params.TemplateId}).
		PlaceholderFormat(squirrel.Dollar)

	sql, args, err := qb.ToSql()
	if err != nil {
		logger.Error("failed to build SQL", "err", err)
		return nil, err
	}
	logger.Info("GetProxmoxTemplate SQL", "sql", sql, "args", args)

	// 2) Run the query
	dbClient := PostgressInterface.GetClient()
	if dbClient == nil {
		logger.Error("database client is nil")
		return nil, errors.New("database client is nil")
	}

	var rawJSON []byte
	if err := dbClient.QueryRow(ctx, sql, args...).Scan(&rawJSON); err != nil {
		logger.Error("query failed", "err", err)
		return nil, errors.New("query failed")
	}
	logger.Info("Found template JSON", "json", string(rawJSON))

	// 3) Unmarshal into your Go struct
	tmpl := &types.ProxmoxTemplate{}
	if err := json.Unmarshal(rawJSON, tmpl); err != nil {
		logger.Error("unmarshal failed", "err", err)
		return nil, errors.New("template not found or invalid JSON")
	}
	logger.Info("Template found", "template", tmpl.ID)

	return &GetTemplateResponse{Template: *tmpl}, nil
}
