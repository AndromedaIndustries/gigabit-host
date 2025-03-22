package config

import (
	"log"

	"github.com/andromedaindustries/gigabit-host/internal/pkg/config/types"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

func InitializeConfig(appName string) (*types.Config, error) {
	var appConfig types.Config

	// load .env file to set environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	if err := envconfig.Process(appName, &appConfig); err != nil {
		return nil, err
	}
	return &appConfig, nil
}
