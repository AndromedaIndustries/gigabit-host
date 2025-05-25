package workflows

import (
	"strconv"
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
	logger := workflow.GetLogger(ctx)

	if params.UserId == "" {
		return nil, workflow.NewContinueAsNewError(ctx, "UserId is empty")
	}

	if params.ServiceId == "" {
		return nil, workflow.NewContinueAsNewError(ctx, "ServiceId is empty")
	}

	// Use the shared state in the Workflow Context.
	logger.Info("NewVMWorkflow", "UserId", params.UserId, "ServiceId", params.ServiceId)

	// ***** Get Service from Database *****

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

	logger.Info("successful got service from the database")

	// ***** Get Proxmox Template from the Database *****

	getTemplateCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,
		StartToCloseTimeout:    5 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 2,
		},
	})

	var getTemplateResponse *activities.GetTemplateResponse

	err = workflow.ExecuteActivity(getTemplateCtx, activity.GetProxmoxTemplate, &activities.GetTemplateParams{
		TemplateId: getServiceResponse.Service.TemplateID,
	}).Get(getTemplateCtx, &getTemplateResponse)

	if err != nil {
		logger.Error("GetProxmoxTemplate failed", "error", err)
		return nil, workflow.NewContinueAsNewError(ctx, "GetProxmoxTemplate failed: %w", err)
	}

	logger.Info("GetProxmoxTemplate successful", "TemplateID", getTemplateResponse.Template.ID)

	// ***** Get the sku from the database *****
	getSkuCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,
		StartToCloseTimeout:    5 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 2,
		},
	})

	var getSkuParams = &activities.GetSkuParams{
		SkuId: getServiceResponse.Service.CurrentSKUID,
	}

	var GetSku *activities.GetSkuResponse

	err = workflow.ExecuteActivity(getSkuCtx, activity.GetSku, getSkuParams).Get(getSkuCtx, &GetSku)

	if err != nil {
		logger.Error("GetSku failed", "error", err)
		return nil, workflow.NewContinueAsNewError(ctx, "GetSku failed: %w", err)
	}

	logger.Info("GetSku successful", "SkuID", GetSku.Sku.ID)

	// ***** Get Next VM ID *****

	getNextVMIDCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		ScheduleToStartTimeout: time.Minute,
		StartToCloseTimeout:    5 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 2,
		},
	})

	var getNextVMIDResponse *activities.GetNextVMIDResponse

	err = workflow.ExecuteActivity(getNextVMIDCtx, activity.GetNextVMID).Get(getNextVMIDCtx, &getNextVMIDResponse)
	if err != nil {
		logger.Error("GetNextVMID failed", "error", err)
		return nil, workflow.NewContinueAsNewError(ctx, "GetNextVMID failed: %w", err)
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
		return nil, workflow.NewContinueAsNewError(ctx, "GetNodeWithLeastVMs failed: %w", err)
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
		return nil, workflow.NewContinueAsNewError(ctx, "GetStorageWithMostFreeSpace failed: %w", err)
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
		return nil, workflow.NewContinueAsNewError(ctx, "CloneVMActivity failed: %w", err)
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
		return nil, workflow.NewContinueAsNewError(ctx, "ConfigureVMActivity failed: %w", err)
	}

	logger.Info("ConfigureVMActivity successful", "VMObject", configureVMResponse.VmObject)

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
		return nil, workflow.NewContinueAsNewError(ctx, "Failed to convert VM ID to int: %w", err)
	}

	startVmActivity := &activities.StartVMActivityParams{
		VmObject: *configureVMResponse.VmObject,
		VmId:     vmIdInt,
	}

	err = workflow.ExecuteActivity(startVMActivityCtx, activity.StartVMActivity, startVmActivity).Get(startVMActivityCtx, nil)
	if err != nil {
		logger.Error("StartVMActivity failed", "error", err)
		return nil, workflow.NewContinueAsNewError(ctx, "StartVMActivity failed: %w", err)
	}

	logger.Info("StartVMActivity successful", "VMID", *configureVMResponse.VmObject.ProxmoxVMID)

	// ***** Update Service in Database *****

	updateServiceParams := &activities.UpdateServiceParams{
		Service: *configureVMResponse.VmObject,
	}

	err = workflow.ExecuteActivity(ctx, activity.UpdateService, updateServiceParams).Get(ctx, nil)
	if err != nil {
		logger.Error("UpdateService failed", "error", err)
		return nil, workflow.NewContinueAsNewError(ctx, "UpdateService failed: %w", err)
	}

	logger.Info("UpdateService successful", "ServiceID", updateServiceParams.Service.ID)

	return &VmWorkflowResult{
		WorkflowId:    workflow.GetInfo(ctx).WorkflowExecution.ID,
		WorkflowRunId: workflow.GetInfo(ctx).WorkflowExecution.RunID,
	}, nil
}
