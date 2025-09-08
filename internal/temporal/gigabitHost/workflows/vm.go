package workflows

import (
	"strconv"
	"time"

	"github.com/andromeda/gigabit-host/internal/temporal/gigabitHost/activities"
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

	ao := workflow.ActivityOptions{
		// Maximum time from scheduling to complete (includes retries, queue wait, execution).
		ScheduleToCloseTimeout: time.Minute * 10,
		// Maximum time the activity code itself is allowed to run on a worker.
		StartToCloseTimeout: time.Minute * 10,
		// (optional) Maximum time to wait before the activity starts execution.
		ScheduleToStartTimeout: time.Minute * 2,
		// (optional) Maximum time for the worker to receive the task.
		HeartbeatTimeout: time.Minute * 2,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	logger := workflow.GetLogger(ctx)

	if params.UserId == "" {
		return nil, temporal.NewApplicationErrorWithCause(
			"InvalidInput",
			"UserId cannot be empty",
			nil,
		)
	}

	if params.ServiceId == "" {
		return nil, temporal.NewApplicationErrorWithCause(
			"InvalidInput",
			"ServiceId cannot be empty",
			nil,
		)
	}

	// Use the shared state in the Workflow Context.
	logger.Info("NewVMWorkflow", "UserId", params.UserId, "ServiceId", params.ServiceId)

	// ***** Get Service from Database *****

	// Set activity options with valid timeouts
	getServiceCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,     // time until activity is picked up
		StartToCloseTimeout:    5 * time.Minute, // max time for activity execution
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts:    5,               // retry up to 5 times
			InitialInterval:    time.Second * 5, // initial retry interval
			BackoffCoefficient: 2.0,             // exponential backoff
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
		return nil, err
	}

	logger.Info("successful got service from the database")

	if getServiceResponse.Service.ProxmoxVMID != nil && *getServiceResponse.Service.ProxmoxVMID != "" {
		logger.Info("VM already exists", "VMID", *getServiceResponse.Service.ProxmoxVMID)
		return &VmWorkflowResult{
			WorkflowId:    workflow.GetInfo(ctx).WorkflowExecution.ID,
			WorkflowRunId: workflow.GetInfo(ctx).WorkflowExecution.RunID,
		}, workflow.ErrCanceled
	}

	// ***** Get Proxmox Template from the Database *****

	getTemplateCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,
		StartToCloseTimeout:    5 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 1,
		},
	})

	var getTemplateResponse *activities.GetTemplateResponse

	err = workflow.ExecuteActivity(getTemplateCtx, activity.GetProxmoxTemplate, &activities.GetTemplateParams{
		TemplateId: getServiceResponse.Service.TemplateID,
	}).Get(getTemplateCtx, &getTemplateResponse)

	if err != nil {
		logger.Error("GetProxmoxTemplate failed", "error", err)
		return nil, err
	}

	logger.Info("GetProxmoxTemplate successful", "TemplateID", getTemplateResponse.Template.ID)

	// ***** Get the sku from the database *****
	getSkuCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,
		StartToCloseTimeout:    5 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 1,
		},
	})

	var getSkuParams = &activities.GetSkuParams{
		SkuId: getServiceResponse.Service.CurrentSKUID,
	}

	var GetSku *activities.GetSkuResponse

	err = workflow.ExecuteActivity(getSkuCtx, activity.GetSku, getSkuParams).Get(getSkuCtx, &GetSku)

	if err != nil {
		logger.Error("GetSku failed", "error", err)
		return nil, temporal.NewApplicationErrorWithCause(
			"GetSkuFailed",
			"Failed to get SKU from the database",
			err,
		)
	}

	logger.Info("GetSku successful", "SkuID", GetSku.Sku.ID)

	// ***** Get Next VM ID *****

	getNextVMIDCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,
		StartToCloseTimeout:    5 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 1,
		},
	})

	var getNextVMIDResponse *activities.GetNextVMIDResponse

	err = workflow.ExecuteActivity(getNextVMIDCtx, activity.GetNextVMID).Get(getNextVMIDCtx, &getNextVMIDResponse)
	if err != nil {
		logger.Error("GetNextVMID failed", "error", err)
		return nil, temporal.NewApplicationErrorWithCause(
			"GetNextVMIDFailed",
			"Failed to get next VM ID from the database",
			err,
		)
	}

	logger.Info("GetNextVMID successful", "NextVMID", getNextVMIDResponse.NextVMID)

	// ***** Get Best Node *****

	getNodeCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,
		StartToCloseTimeout:    5 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 2,
		},
	})

	var nodeWithLeastVMs *activities.GetNodeWithLeastVMsResponse

	err = workflow.ExecuteActivity(getNodeCtx, activity.GetNodeWithLeastVMs).Get(getNodeCtx, &nodeWithLeastVMs)
	if err != nil {
		logger.Error("GetNodeWithLeastVMs failed", "error", err)
		return nil, temporal.NewApplicationErrorWithCause(
			"GetNodeWithLeastVMsFailed",
			"Failed to get node with least VMs",
			err,
		)
	}

	logger.Info("GetNodeWithLeastVMs successful", "Node", nodeWithLeastVMs.NodeName)

	// ***** Get Storage with Most Free Space *****
	getStorageCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,
		StartToCloseTimeout:    5 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 2,
		},
	})

	var storageWithMostFreeSpace *activities.GetStorageWithMostFreeSpaceResponse

	err = workflow.ExecuteActivity(getStorageCtx, activity.GetStorageWithMostFreeSpace, &activities.GetStorageWithMostFreeSpaceParams{
		Node: nodeWithLeastVMs.NodeName,
	}).Get(getStorageCtx, &storageWithMostFreeSpace)

	if err != nil {
		logger.Error("GetStorageWithMostFreeSpace failed", "error", err)
		return nil, temporal.NewApplicationErrorWithCause(
			"GetStorageWithMostFreeSpaceFailed",
			"Failed to get storage with most free space",
			err,
		)
	}

	// Log the best storage found
	logger.Info("GetStorageWithMostFreeSpace successful", "StorageID", storageWithMostFreeSpace.StorageID)

	// ***** Clone VM from Template *****

	cloneVMParams := &activities.CloneVMActivityParams{
		Template:      getTemplateResponse.Template,
		CloneVMID:     getNextVMIDResponse.NextVMID,
		TargetNode:    nodeWithLeastVMs.NodeName,
		TargetStorage: storageWithMostFreeSpace.StorageID,
		VMObject:      getServiceResponse.Service,
	}

	cloneVMActivityCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,
		StartToCloseTimeout:    5 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 1,
		},
	})

	var cloneVMResponse *activities.CloneVMActivityResponse

	err = workflow.ExecuteActivity(cloneVMActivityCtx, activity.CloneVMActivity, cloneVMParams).Get(cloneVMActivityCtx, &cloneVMResponse)

	if err != nil {
		logger.Error("CloneVMActivity failed", "error", err)
		return nil, temporal.NewApplicationErrorWithCause(
			"CloneVMActivityFailed",
			"Failed to clone VM from template",
			err,
		)
	}

	logger.Info("CloneVMActivity successful", "VMID", cloneVMResponse.VMObject.ProxmoxVMID)

	// ***** Configure VM *****

	configureVMParams := &activities.ConfigureVMActivityParams{
		VmObject: *cloneVMResponse.VMObject,
		Sku:      GetSku.Sku,
	}

	configureVMActivityCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,
		StartToCloseTimeout:    5 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 1,
		},
	})

	var configureVMResponse *activities.ConfigureVMActivityResponse

	err = workflow.ExecuteActivity(configureVMActivityCtx, activity.ConfigureVMActivity, configureVMParams).Get(configureVMActivityCtx, &configureVMResponse)
	if err != nil {
		logger.Error("ConfigureVMActivity failed", "error", err)
		return nil, temporal.NewApplicationErrorWithCause(
			"ConfigureVMActivityFailed",
			"Failed to configure VM",
			err,
		)
	}

	logger.Info("ConfigureVMActivity successful", "VMObject", configureVMResponse.VmObject)

	// ***** Resize Disk if needed *****

	skuDiskSize := GetSku.Sku.Attributes.StorageSize

	if skuDiskSize > 55 { // If the configured sku disk size is larger than 50GB, resize it
		logger.Info("Resizing disk for VM", "VMID", *configureVMResponse.VmObject.ProxmoxVMID, "NewSizeGB", GetSku.Sku.Attributes.StorageSize)

		resizeDiskActivityCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
			ScheduleToStartTimeout: time.Minute,
			StartToCloseTimeout:    5 * time.Minute,
			RetryPolicy: &temporal.RetryPolicy{
				MaximumAttempts: 1,
			},
		})

		resizeDiskParams := &activities.ResizeDiskActivityParams{
			VmObject: *configureVMResponse.VmObject,
			Sku:      GetSku.Sku,
		}

		err = workflow.ExecuteActivity(resizeDiskActivityCtx, activity.ResizeDiskActivity, resizeDiskParams).Get(resizeDiskActivityCtx, nil)
		if err != nil {
			logger.Error("ResizeDiskActivity failed", "error", err)
			return nil, temporal.NewApplicationErrorWithCause(
				"ResizeDiskActivityFailed",
				"Failed to resize disk for VM",
				err,
			)
		}
		logger.Info("ResizeDiskActivity successful", "VMID", *configureVMResponse.VmObject.ProxmoxVMID)
	}

	// ***** Start VM *****
	startVMActivityCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,
		StartToCloseTimeout:    5 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 1,
		},
	})

	vmIdInt, err := strconv.Atoi(*configureVMResponse.VmObject.ProxmoxVMID)
	if err != nil {
		logger.Error("Failed to convert VM ID to int", "VMID", *configureVMResponse.VmObject.ProxmoxVMID, "error", err)
		return nil, temporal.NewApplicationErrorWithCause(
			"InvalidVMID",
			"Failed to convert VM ID to integer",
			err,
		)
	}

	startVmActivity := &activities.StartVMActivityParams{
		VmObject: *configureVMResponse.VmObject,
		VmId:     vmIdInt,
	}

	err = workflow.ExecuteActivity(startVMActivityCtx, activity.StartVMActivity, startVmActivity).Get(startVMActivityCtx, nil)
	if err != nil {
		logger.Error("StartVMActivity failed", "error", err)
		return nil, temporal.NewApplicationErrorWithCause(
			"StartVMActivityFailed",
			"Failed to start VM",
			err,
		)
	}

	logger.Info("StartVMActivity successful", "VMID", *configureVMResponse.VmObject.ProxmoxVMID)

	// ***** Update Service in Database *****
	updateServiceCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,
		StartToCloseTimeout:    5 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 1,
		},
	})

	updateServiceParams := &activities.UpdateServiceParams{
		Service: *configureVMResponse.VmObject,
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

	// ***** Return Workflow Result *****
	logger.Info("VM workflow completed successfully", "WorkflowID", workflow.GetInfo(ctx).WorkflowExecution.ID, "RunID", workflow.GetInfo(ctx).WorkflowExecution.RunID)

	workflow.CompleteSession(ctx)

	return &VmWorkflowResult{
		WorkflowId:    workflow.GetInfo(ctx).WorkflowExecution.ID,
		WorkflowRunId: workflow.GetInfo(ctx).WorkflowExecution.RunID,
	}, nil
}

type VmDeleteWorkflowParams struct {
	ServiceId string `json:"service_id"`
}

// func DeleteVMWorkflow(ctx workflow.Context, params VmWorkflowParams) error {
// 	logger := workflow.GetLogger(ctx)

// }
