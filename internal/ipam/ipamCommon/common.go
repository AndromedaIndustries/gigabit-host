package ipamcommon

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"go.temporal.io/sdk/log"
)

type IPAM interface {
	DeleteIp(ctx context.Context, logger log.Logger, ip IpId) error
	GetNextAvalableIps(ctx context.Context, logger log.Logger, vmId, fqdn string) (IpAddress, IpAddress, error)
	V4Gateway() *IpAddress
	V6Gateway() *IpAddress
}

type IpAddress struct {
	ID          IpId    `json:"id"`
	Address     string  `json:"address"`
	DnsName     *string `json:"dns_name,omitempty" validate:"regexp=^([0-9A-Za-z_-]+|\\\\*)(\\\\.[0-9A-Za-z_-]+)*\\\\.?$"`
	Description *string `json:"description,omitempty"`
}

type IpId struct {
	Int *int32
	Str *string
}

func (v *IpId) UnmarshalJSON(data []byte) error {
	var asInt int32
	if err := json.Unmarshal(data, &asInt); err == nil {
		v.Int = &asInt
		return nil
	}
	var asStr string
	if err := json.Unmarshal(data, &asStr); err == nil {
		v.Str = &asStr
		return nil
	}
	return fmt.Errorf("id must be an int32 or string")
}

func (v IpId) MarshalJSON() ([]byte, error) {
	switch {
	case v.Int != nil:
		return json.Marshal(v.Int)
	case v.Str != nil:
		return json.Marshal(v.Str)
	default:
		return nil, errors.New("id has no value")
	}
}
