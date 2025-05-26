package PostgressInterface

import (
	"context"
	"os"
	"strings"

	"github.com/jackc/pgx/v5"
	"go.temporal.io/sdk/log"
)

func GetClient(logger log.Logger) *pgx.Conn {
	// 1) Grab raw env var
	raw := os.Getenv("POSTGRES_SUPABASE_URL")

	// 2) Replace scheme *and* strip ALL leading/trailing whitespace (including \r, \n, spaces)
	connStr := strings.TrimSpace(
		strings.Replace(raw, "postgresql://", "postgres://", 1),
	)

	// 3) Connect to the database
	conn, err := pgx.Connect(context.Background(), connStr)
	if err != nil {
		logger.Error("Unable to connect to database", err)
	}

	logger.Info("Connected to Postgress")

	return conn
}
