package api

import (
	"net/http"
	"time"

	healthcheck "github.com/andromedaindustries/gigabit-host/internal/pkg/api/routes/health-check"
	"github.com/andromedaindustries/gigabit-host/internal/pkg/api/routes/proxmox"
	"github.com/andromedaindustries/gigabit-host/internal/pkg/config/types"
	"github.com/gorilla/mux"
)

type Api struct {
	Router     *mux.Router
	HttpServer *http.Server
	Config     *types.Config
}

func (a *Api) InitalizeRouter(conf *types.Config) {
	a.Config = conf
	a.Router = mux.NewRouter()
	conf.Router = a.Router

	// Add routes
	healthcheck.AddHealthCheckRoute(a.Router)
	proxmox.AddProxmoxRoutes(a.Router)

	// Add CORS middleware
	a.Router.Use(mux.CORSMethodMiddleware(a.Router))

	// // Add Config middleware
	// a.Router.Use(configInjector.Middleware(a.Config))
}

func (a *Api) InitalizeServer(
	writeTimeout time.Duration,
	readTimeout time.Duration,
	idleTimeout time.Duration,
) *http.Server {
	a.HttpServer = &http.Server{
		Handler:      a.Router,
		Addr:         a.Config.ApiAddress,
		WriteTimeout: writeTimeout,
		ReadTimeout:  readTimeout,
		IdleTimeout:  idleTimeout,
	}

	return a.HttpServer
}

func (a *Api) ServeAPI() {
	a.HttpServer.ListenAndServe()
}

func (a *Api) ServeTLSAPI(certFile string, keyFile string) {
	panic(a.HttpServer.ListenAndServeTLS(certFile, keyFile))
}
