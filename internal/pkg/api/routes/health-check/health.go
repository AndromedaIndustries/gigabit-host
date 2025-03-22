package healthcheck

import (
	"net/http"

	"github.com/gorilla/mux"
)

func AddHealthCheckRoute(router *mux.Router) {
	router.HandleFunc("/health", HealthCheckHandler).Methods("GET")
}

func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	// config, ok := configinjector.FromContext(r.Context())
	// if !ok {
	// 	http.Error(w, "config not found", http.StatusInternalServerError)
	// 	return
	// }

	// config.Logger.Info("Health check request received", zap.String("from", r.RemoteAddr))

	// w.Write([]byte("OK from: " + config.ApiAddress))
}
