package middleware

import (
	"context"
	"net/http"

	"github.com/andromedaindustries/gigabit-host/internal/pkg/config/types"
)

type contextKey string

const configKey = contextKey("config")

// Middleware injects the provided config into the request context.
func Middleware(cfg *types.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), configKey, cfg)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// FromContext retrieves the config from the context.
func FromContext(ctx context.Context) (*types.Config, bool) {
	cfg, ok := ctx.Value(configKey).(*types.Config)
	return cfg, ok
}
