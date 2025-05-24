package helloworld

import (
	"context"

	"go.temporal.io/sdk/activity"
)

// YourActivityParam is the object passed to the Activity.
type YourActivityParam struct {
	ActivityParamX string
	ActivityParamY int
}

type YourActivityObject struct {
	Message *string
	Number  *int
}

type YourActivityResultObject struct {
	ResultFieldX string
	ResultFieldY int
}

// YourActivityDefinition is your custom Activity Definition.
// An Activity Definition is an exportable function.
func (a *YourActivityObject) HelloWorldActivityDefinition(ctx context.Context, param YourActivityParam) (*YourActivityResultObject, error) {

	// Use the shared state in the Activity Object.
	activity.GetLogger(ctx).Info("YourActivityDefinition", "Message", *a.Message, "Number", *a.Number)

	// Make the results of the Activity Execution available.
	activityResult := &YourActivityResultObject{
		ResultFieldX: "Hello, World!",
		ResultFieldY: 42,
	}
	return activityResult, nil
}
