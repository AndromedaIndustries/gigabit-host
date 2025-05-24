package helloworld

import (
	"os"

	"github.com/andromeda/gigabit-host/internal/temporal/helloworld"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
	"go.temporal.io/sdk/workflow"
)

func HelloWorldWorker(interrupt chan os.Signal, temporalClient client.Client) error {
	// Create a new Worker.
	helloWorldWorker := worker.New(temporalClient, "helloworld", worker.Options{})

	// Use RegisterOptions to set the name of the Workflow Type for example.
	registerHelloWorldWorkflowOptions := workflow.RegisterOptions{
		Name: "HelloWorldWorkflow",
	}

	// Register your Workflow Definitions with the Worker.
	// Use the RegisterWorkflow or RegisterWorkflowWithOptions method for each Workflow registration.
	helloWorldWorker.RegisterWorkflowWithOptions(helloworld.HelloWorldWorkflowDefinition, registerHelloWorldWorkflowOptions)

	// Register your Activity Definitons with the Worker.
	// Use this technique for registering all Activities that are part of a struct and set the shared variable values.
	message := "This could be a connection string or endpoint details"
	number := 100
	activities := &helloworld.YourActivityObject{
		Message: &message,
		Number:  &number,
	}
	// Use the RegisterActivity or RegisterActivityWithOptions method for each Activity.
	helloWorldWorker.RegisterActivity(activities)

	// Run the Worker
	workerErr := helloWorldWorker.Run(worker.InterruptCh())
	if workerErr != nil {
		return workerErr
	}

	<-interrupt
	return nil
}
