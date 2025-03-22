package types

import (
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/gorilla/mux"
	"github.com/luthermonson/go-proxmox"
	"go.uber.org/zap"
)

type Config struct {
	// Environment
	Environment string `envconfig:"ENVIRONMENT" default:"development"`

	// App Logging
	Logger *zap.Logger

	// httpRouter
	Router *mux.Router

	// Application metrics
	ApplicationStartedAt time.Time
	ApplicationVersion   string `envconfig:"APPLICATION_VERSION" default:"0.0.0"`

	// Temporal
	TemporalAddress   string `envconfig:"TEMPORAL_ADDRESS" default:"127.0.0.1:7233"`
	TemporalUsername  string `envconfig:"TEMPORAL_USERNAME" default:""`
	TemporalPassword  string `envconfig:"TEMPORAL_PASSWORD" default:""`
	TemporalNamespace string `envconfig:"TEMPORAL_NAMESPACE" default:"default"`

	// Proxmox
	ProxmoxAddress     string `envconfig:"PROXMOX_ADDRESS" default:""`
	ProxmoxUser        string `envconfig:"PROXMOX_USER" default:""`
	ProxmoxRealm       string `envconfig:"PROXMOX_REALM" default:"pam"`
	ProxmoxAuthType    string `envconfig:"PROXMOX_AUTH_TYPE" default:"token"`
	ProxmoxTokenName   string `envconfig:"PROXMOX_TOKEN_NAME" default:""`
	ProxmoxTokenSecret string `envconfig:"PROXMOX_TOKEN_SECRET" default:""`
	ProxmoxPassword    string `envconfig:"PROXMOX_PASSWORD" default:""`

	// Api
	ApiAddress string `envconfig:"API_ADDRESS" default:"127.0.0.1:8123"`
	ApiTlsCert string `envconfig:"API_TLS_CERT" default:""`
	ApiTlsKey  string `envconfig:"API_TLS_KEY" default:""`

	// Provisioner
	ProxmoxClient *proxmox.Client

	// Authentication and Authorization
	OidcProvider          *oidc.Provider
	AuthenticOidcProvider string `envconfig:"AUTH_AUTHENTIK_OIDC_PROVIDER" default:""`
	AuthenticID           string `envconfig:"AUTH_AUTHENTIK_ID" default:""`
	AuthenticSecret       string `envconfig:"AUTH_AUTHENTIK_SECRET" default:""`
	AuthenticIssuer       string `envconfig:"AUTH_AUTHENTIK_ISSUER" default:""`
}
