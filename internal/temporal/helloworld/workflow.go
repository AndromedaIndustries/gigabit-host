package helloworld

import (
	"go.temporal.io/sdk/workflow"
)

// YourWorkflowResultObject is the object returned by the Workflow.
type YourWorkflowResultObject struct {
	WFResultFieldX string
	WFResultFieldY int
}

// YourWorkflowParam is the object passed to the Workflow.
type YourWorkflowParam struct {
	WorkflowParamX string
	WorkflowParamY int
}

// YourWorkflowDefinition is your custom Workflow Definition.
func HelloWorldWorkflowDefinition(ctx workflow.Context, param YourWorkflowParam) (*YourWorkflowResultObject, error) {

	// Make the results of the Workflow Execution available.
	workflowResult := &YourWorkflowResultObject{
		WFResultFieldX: "Hello, World!",
		WFResultFieldY: 42,
	}
	return workflowResult, nil
}
