package logging

import (
	"github.com/andromedaindustries/gigabit-host/internal/pkg/config/types"
	"go.uber.org/zap"
)

func InitializeLogging(config *types.Config) func() {

	switch config.Environment {
	case "production":
		loggerConfig := zap.NewProductionConfig()
		loggerConfig.InitialFields = map[string]interface{}{
			"app":         "provisioner",
			"environment": config.Environment,
		}

		logger, err := loggerConfig.Build()
		if err != nil {
			panic(err)
		}
		config.Logger = logger

	default:
		loggerConfig := zap.NewDevelopmentConfig()
		loggerConfig.InitialFields = map[string]interface{}{
			"app":         "provisioner",
			"environment": config.Environment,
		}

		logger, err := loggerConfig.Build()
		if err != nil {
			panic(err)
		}
		config.Logger = logger
	}

	return func() {
		config.Logger.Sync()
	}
}
