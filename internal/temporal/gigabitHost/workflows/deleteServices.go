package workflows

import (
	"time"

	"github.com/andromeda/gigabit-host/internal/temporal/gigabitHost/activities"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

type DeleteServicesResults struct {
	WorkflowId    string
	WorkflowRunId string
}

func DeleteServicesWorkflow(ctx workflow.Context) (*DeleteServicesResults, error) {

	logger := workflow.GetLogger(ctx)

	// Set activity options with valid timeouts
	getServicesCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,     // time until activity is picked up
		StartToCloseTimeout:    5 * time.Minute, // max time for activity execution
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts:    5,               // retry up to 5 times
			InitialInterval:    time.Second * 5, // initial retry interval
			BackoffCoefficient: 2.0,             // exponential backoff
		},
	})
	var activity activities.Activities

	var getServicesResponse *activities.GetServicesResponse
	err := workflow.ExecuteActivity(getServicesCtx, activity.GetServices).Get(getServicesCtx, &getServicesResponse)

	if err != nil {
		return nil, err
	}

	for _, service := range getServicesResponse.Services {
		workflow.GetLogger(ctx).Info(service.Hostname)

		deleteCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
			ScheduleToStartTimeout: time.Minute,     // time until activity is picked up
			StartToCloseTimeout:    5 * time.Minute, // max time for activity execution
			RetryPolicy: &temporal.RetryPolicy{
				MaximumAttempts:    5,               // retry up to 5 times
				InitialInterval:    time.Second * 5, // initial retry interval
				BackoffCoefficient: 2.0,             // exponential backoff
			},
		})

		err := workflow.ExecuteActivity(deleteCtx, activity.DeleteVMActivity, activities.DeleteVMActivityParams{
			VmObject: service,
		}).Get(deleteCtx, nil)

		if err != nil {
			return nil, err
		}

		statusReason := "End of Service"

		service.ServiceActive = false
		service.Status = "Service Terminated"
		service.StatusReason = &statusReason
		service.Metadata.Ipv4Address = nil
		service.Metadata.Ipv4AddressId = nil
		service.Metadata.Ipv6Address = nil
		service.Metadata.Ipv6AddressId = nil

		updateServiceCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
			ScheduleToStartTimeout: time.Minute,
			StartToCloseTimeout:    5 * time.Minute,
			RetryPolicy: &temporal.RetryPolicy{
				MaximumAttempts: 1,
			},
		})

		updateServiceParams := &activities.UpdateServiceParams{
			Service: service,
		}

		err = workflow.ExecuteActivity(updateServiceCtx, activity.UpdateService, updateServiceParams).Get(ctx, nil)
		if err != nil {
			logger.Error("UpdateService failed", "error", err)
			return nil, temporal.NewApplicationErrorWithCause(
				"UpdateServiceFailed",
				"Failed to update service in the database",
				err,
			)
		}

		logger.Info("UpdateService successful", "ServiceID", updateServiceParams.Service.ID)
	}

	return nil, nil
}
