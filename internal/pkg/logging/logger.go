package logging

import (
	"github.com/andromedaindustries/gigabit-host/internal/pkg/config/types"
	"go.uber.org/zap"
)

func InitializeLogging(config *types.Config, app_name string) func() {

	loggerConfig := zap.NewDevelopmentConfig()
	loggerConfig.InitialFields = map[string]interface{}{
		"app":         app_name,
		"environment": config.Environment,
	}

	logger, err := loggerConfig.Build()
	if err != nil {
		panic(err)
	}
	config.Logger = logger

	return func() {
		config.Logger.Sync()
	}
}
