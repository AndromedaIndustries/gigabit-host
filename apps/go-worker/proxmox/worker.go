package proxmox

import (
	"os"

	"github.com/andromeda/gigabit-host/internal/temporal/gigabitHost/activities"
	"github.com/andromeda/gigabit-host/internal/temporal/gigabitHost/workflows"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
	"go.temporal.io/sdk/workflow"
)

func registerNewVM(worker worker.Worker) {
	// Register your Workflow Definitions with the Worker.
	// Use the RegisterWorkflow or RegisterWorkflowWithOptions method for each Workflow registration.
	registerNewVMWorkflowOptions := workflow.RegisterOptions{
		Name: "New VM Workflow",
	}

	worker.RegisterWorkflowWithOptions(workflows.NewVMWorkflow, registerNewVMWorkflowOptions)

	// Register your Activity Definitons with the Worker.
	// Use this technique for registering all Activities that are part of a struct and set the shared variable values.
	// Use the RegisterActivity or RegisterActivityWithOptions method for each Activity.

}

func ProxmoxWorkers(interrupt chan os.Signal, temporalClient client.Client) error {
	// Create a new Worker.
	proxmoxWorker := worker.New(temporalClient, "proxmox", worker.Options{})

	// Register new VM Workflow
	registerNewVM(proxmoxWorker)

	// Register your Activity Definitons with the Worker.
	// Use this technique for registering all Activities that are part of a struct and set the shared variable values.
	message := "This could be a connection string or endpoint details"
	number := 100
	activities := &activities.Activities{
		Message: &message,
		Number:  &number,
	}
	// Use the RegisterActivity or RegisterActivityWithOptions method for each Activity.
	proxmoxWorker.RegisterActivity(activities)

	// Run the Worker
	workerErr := proxmoxWorker.Run(worker.InterruptCh())
	if workerErr != nil {
		return workerErr
	}

	<-interrupt
	return nil
}
