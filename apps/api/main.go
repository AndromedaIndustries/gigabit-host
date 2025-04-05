package main

import (
	"context"
	"os"
	"os/signal"
	"time"

	"github.com/andromedaindustries/gigabit-host/internal/pkg/api"
	"github.com/andromedaindustries/gigabit-host/internal/pkg/config"
	configInjector "github.com/andromedaindustries/gigabit-host/internal/pkg/config/middleware"
	"github.com/andromedaindustries/gigabit-host/internal/pkg/logging"
	"github.com/andromedaindustries/gigabit-host/internal/pkg/proxmox"
	"github.com/coreos/go-oidc/v3/oidc"
	"go.uber.org/zap"
)

func main() {
	const appName = "api"

	// Wait for 10 seconds for the server to shutdown
	wait := 10 * time.Second
	// Get the config for the application
	appConfig, err := config.InitializeConfig(appName)
	if err != nil {
		panic(err)
	}

	// Initialize logging
	logger := logging.InitializeLogging(appConfig, appName)

	provider, err := oidc.NewProvider(context.Background(), appConfig.AuthenticIssuer)
	if err != nil {
		appConfig.Logger.Error("Failed to connect to authentik", zap.Error(err))
		panic(err)
	}

	appConfig.OidcProvider = provider

	// initalize proxmox client
	proxmox.CreateClient(appConfig)

	// Create gorilla mux router
	apiServer := new(api.Api)
	apiServer.InitalizeRouter(appConfig)
	server := apiServer.InitalizeServer(
		wait,
		wait,
		wait*10,
	)

	// inject the config middleware
	apiServer.Router.Use(configInjector.Middleware(appConfig))

	// switch appConfig.Environment {
	// case "production":
	// 	apiServer.Router.Use(authinjector.Middleware(appConfig))
	// case "staging":
	// 	apiServer.Router.Use(authinjector.Middleware(appConfig))
	// }

	// Start the server
	appConfig.Logger.Info("Starting API server")
	go apiServer.ServeAPI()
	appConfig.Logger.Info("Started API server")
	// Create a os signal channel
	signalChannel := make(chan os.Signal, 1)

	signal.Notify(signalChannel, os.Interrupt)

	// Wait for the signal
	<-signalChannel

	// Create a deadline to wait for.
	ctx, cancel := context.WithTimeout(context.Background(), wait*10)
	defer cancel()

	server.Shutdown(ctx)
	appConfig.Logger.Info("Shutting down API server")
	logger()
	os.Exit(0)
}
