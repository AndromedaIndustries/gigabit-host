package activities

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/Masterminds/squirrel"
	"go.temporal.io/sdk/activity"
	"golang.org/x/crypto/ssh"

	"github.com/andromeda/gigabit-host/internal/PostgressInterface"
	"github.com/andromeda/gigabit-host/internal/types"
)

type GetSshKeyParams struct {
	KeyID string
}

type GetSshKeyResponse struct {
	Key types.SshKey
}

func (a *Activities) GetSSHKey(
	ctx context.Context,
	params *GetSshKeyParams,
) (*GetSshKeyResponse, error) {
	logger := activity.GetLogger(ctx)

	// 1) Build the Squirrel query
	qb := squirrel.
		Select("row_to_json(k) AS full_key").
		From(`"SshKeys" k`).
		Where(squirrel.Eq{"k.id": params.KeyID}).
		PlaceholderFormat(squirrel.Dollar)

	sql, args, err := qb.ToSql()
	if err != nil {
		logger.Error("failed to build SQL", "err", err)
		return nil, err
	}
	logger.Info("GetSSHKey SQL", "sql", sql, "args", args)

	// 2) Execute
	dbClient := PostgressInterface.GetClient(logger)
	if dbClient == nil {
		logger.Error("Database client is nil")
		return nil, errors.New("database client is nil")
	}

	var rawJSON []byte
	if err := dbClient.QueryRow(ctx, sql, args...).Scan(&rawJSON); err != nil {
		logger.Error("query failed", "err", err)
		return nil, errors.New("query failed")
	}
	logger.Info("Found SSH key JSON", "json", string(rawJSON))

	// 3) Unmarshal
	key := &types.SshKey{}
	if err := json.Unmarshal(rawJSON, key); err != nil {
		logger.Error("unmarshal failed", "err", err)
		return nil, errors.New("ssh key not found or invalid JSON")
	}
	logger.Info("SSH key found", "key", key.ID)

	// 4) Validate SSH Key

	keyBytes := []byte(key.PublicKey)
	_, _, _, _, pubKeyErr := ssh.ParseAuthorizedKey(keyBytes)

	if pubKeyErr != nil {
		logger.Error("Failed to get a valid public key: %v", err)
		return nil, errors.New("ssh key not valid")
	}

	return &GetSshKeyResponse{Key: *key}, nil
}
