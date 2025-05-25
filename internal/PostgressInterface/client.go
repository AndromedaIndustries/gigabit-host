package PostgressInterface

import (
	"context"
	"fmt"
	"os"
	"strings"
	"sync"

	"github.com/jackc/pgx/v5"
	"logur.dev/logur"
)

var lock = &sync.Mutex{}

type PostgressInterface struct {
	logger logur.KVLoggerFacade
	client *pgx.Conn
}

var singleInstance *PostgressInterface

func NewPostgressInterface(logger logur.KVLoggerFacade) *PostgressInterface {
	if singleInstance == nil {
		lock.Lock()
		defer lock.Unlock()

		if singleInstance == nil {
			logger.Info("Creating new ProxmoxInterface instance")
			singleInstance = &PostgressInterface{
				logger: logger,
				client: nil,
			}
			singleInstance.newPostgressClient()
		} else {
			logger.Info("Using existing ProxmoxInterface instance")
		}
	} else {
		logger.Info("Using existing ProxmoxInterface instance")
	}

	return singleInstance
}

func (p *PostgressInterface) newPostgressClient() {
	// 1) Grab raw env var
	raw := os.Getenv("POSTGRES_SUPABASE_URL")

	// 2) Replace scheme *and* strip ALL leading/trailing whitespace (including \r, \n, spaces)
	connStr := strings.TrimSpace(
		strings.Replace(raw, "postgresql://", "postgres://", 1),
	)

	p.logger.Info("Connecting to database", "connStrDebug", fmt.Sprintf("%q", connStr))

	// 3) Connect to the database
	conn, err := pgx.Connect(context.Background(), connStr)
	if err != nil {
		p.logger.Error("Unable to connect to database", err)
		return
	}

	p.client = conn

	p.logger.Info("Connected to Postgress")
}

func GetClient() *pgx.Conn {

	if singleInstance.client == nil {
		os.Exit(1)
	}

	return singleInstance.client
}
