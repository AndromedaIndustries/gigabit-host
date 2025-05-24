package workflows

import (
	"time"

	"github.com/andromeda/gigabit-host/internal/temporal/proxmox/activities"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

type VmWorkflowParams struct {
	UserId    string `json:"user_id"`
	ServiceId string `json:"service_id"`
}

type VmWorkflowResult struct {
	WorkflowId    string
	WorkflowRunId string
}

func NewVMWorkflow(ctx workflow.Context, params VmWorkflowParams) (*VmWorkflowResult, error) {

	if params.UserId == "" {
		return nil, workflow.NewContinueAsNewError(ctx, "UserId is empty")
	}

	if params.ServiceId == "" {
		return nil, workflow.NewContinueAsNewError(ctx, "ServiceId is empty")
	}

	// Use the shared state in the Workflow Context.
	workflow.GetLogger(ctx).Info("NewVMWorkflow", "UserId", params.UserId, "ServiceId", params.ServiceId)

	// ***** Get Service *****

	// Set activity options with valid timeouts
	getServiceCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,     // time until activity is picked up
		StartToCloseTimeout:    5 * time.Minute, // max time for activity execution
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 2,
		},
	})

	getServicesParams := &activities.GetServiceParams{
		UserId:    params.UserId,
		ServiceId: params.ServiceId,
	}

	var activity activities.Activities

	var getServiceResponse *activities.GetServiceResponse
	err := workflow.ExecuteActivity(getServiceCtx, activity.GetService, getServicesParams).Get(getServiceCtx, &getServiceResponse)

	if err != nil {
		return nil, workflow.ErrSessionFailed
	}

	return &VmWorkflowResult{
		WorkflowId:    workflow.GetInfo(ctx).WorkflowExecution.ID,
		WorkflowRunId: workflow.GetInfo(ctx).WorkflowExecution.RunID,
	}, nil
}
