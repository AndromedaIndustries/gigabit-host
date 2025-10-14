package ipaminterface

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"

	ipamcommon "github.com/andromeda/gigabit-host/internal/ipam/ipamCommon"
	nautobotprovider "github.com/andromeda/gigabit-host/internal/ipam/nautobotProvider"
	netboxprovider "github.com/andromeda/gigabit-host/internal/ipam/netboxProvider"
	"go.temporal.io/sdk/log"
)

// Provider identifies the backend.
type Provider string

const (
	ProviderNautoBot Provider = "nautobot"
	ProviderNetBox   Provider = "netbox"
)

func New(ctx context.Context, logger log.Logger) (ipamcommon.IPAM, error) {
	provider := Provider(strings.ToLower(os.Getenv("IPAM_PROVIDER")))
	if provider == "" {
		return nil, errors.New("IPAM_PROVIDER is required (nautobot|netbox)")
	}

	switch provider {
	case ProviderNautoBot:
		nautobot, err := nautobotprovider.NewNautobotIpamClient(ctx, logger)
		return nautobot, err
	case ProviderNetBox:
		netbox, err := netboxprovider.NewNetboxIpamClient(ctx, logger)
		return netbox, err
	default:
		return nil, fmt.Errorf("unknown provider %q - Options: (nautobot|netbox)", provider)
	}
}
