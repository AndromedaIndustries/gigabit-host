package main

import (
	"crypto/tls"
	"fmt"
	"os"
	"os/signal"

	"github.com/andromeda/gigabit-host/apps/go-worker/helloworld"
	"github.com/andromeda/gigabit-host/apps/go-worker/proxmox"
	"github.com/andromeda/gigabit-host/internal/PostgressInterface"
	"github.com/andromeda/gigabit-host/internal/ProxmoxInterface"
	"github.com/joho/godotenv"
	"go.temporal.io/sdk/client"

	"github.com/sirupsen/logrus"
	logrusadapter "logur.dev/adapter/logrus"
	"logur.dev/logur"
)

func main() {
	err := godotenv.Load(".env")

	// raw logrus logger
	rawLog := logrus.New()

	// Create a logger
	logger := logur.LoggerToKV(logrusadapter.New(rawLog))

	if err != nil {
		logger.Info("Error loading .env file")
	}

	environment := os.Getenv("ENV")

	// Create a channel to signal the Worker to stop
	signalInterrupt := make(chan os.Signal, 1)

	// Initial heloworld log
	logger.Info("Hello World")

	if environment == "prod" {
		logger.Info("Running in Production Environment")
	} else {
		logger.Warn("Running in Development Environment")
	}

	// Attempt to connect to Proxmox
	logger.Info(fmt.Sprintf("Connected to proxmox running %s", ProxmoxInterface.GetVersion(logger)))

	// Attempt to connect to Postgress
	postgressClient := PostgressInterface.GetClient(logger)

	// Check if the PostgressInterface is connected
	if postgressClient == nil {
		logger.Error("Unable to connect to Postgress")
		os.Exit(1)
	}

	var temporalClient client.Client
	var temporalErr error

	if environment == "prod" {
		temporalHost := os.Getenv("TEMPORAL_SERVER")
		temporalNamespace := os.Getenv("TEMPORAL_NAMESPACE")
		temporalAccountId := os.Getenv("TEMPORAL_ACCOUNT_ID")
		temporalApiKey := os.Getenv("TEMPORAL_API_KEY")

		// Create a Temporal Client
		// A Temporal Client is a heavyweight object that should be created just once per process.
		temporalClient, temporalErr = client.Dial(client.Options{
			HostPort:          temporalHost,
			Namespace:         temporalNamespace + "." + temporalAccountId,
			ConnectionOptions: client.ConnectionOptions{TLS: &tls.Config{}},
			Credentials:       client.NewAPIKeyStaticCredentials(temporalApiKey),
			Logger:            logger,
		})
	} else {
		temporalHost := os.Getenv("TEMPORAL_SERVER")
		temporalNamespace := os.Getenv("TEMPORAL_NAMESPACE")

		// Create a Temporal Client
		// A Temporal Client is a heavyweight object that should be created just once per process.
		temporalClient, temporalErr = client.Dial(client.Options{
			HostPort:  temporalHost,
			Namespace: temporalNamespace,
			Logger:    logger,
		})
	}

	if temporalErr != nil {
		logger.Error("Unable to create client", temporalErr)
		os.Exit(1)
	}
	defer func() {
		temporalClient.Close()
		logger.Info("Temporal Client Closed")
	}()

	// Worker for the HelloWorld
	go func() {
		// Create a new Worker
		err = helloworld.HelloWorldWorker(signalInterrupt, temporalClient)

		if err != nil {
			logger.Error("Unable to start Worker", err)
		}

		os.Exit(0)
	}()

	// Worker for proxmox
	go func() {
		// proxmox worker
		err := proxmox.ProxmoxWorkers(signalInterrupt, temporalClient)
		if err != nil {
			logger.Error("Unable to start Worker", err)
		}

		<-signalInterrupt
		os.Exit(0)
	}()

	// attach the handler to interrupt
	signal.Notify(signalInterrupt, os.Interrupt)

	// wait for the signal
	// wait for the signal to be received
	<-signalInterrupt

	// stop the workers
	// stop the workers
	logger.Info("Stopping Workers")

	// wait until all workers are stopped
	// close the signal channel
	close(signalInterrupt)
}
