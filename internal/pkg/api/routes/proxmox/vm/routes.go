package vm

import (
	"net/http"

	"github.com/gorilla/mux"
)

func AddVMRoutes(router *mux.Router) {
	router.HandleFunc("/vm/templates", GetTemplateVMs).Methods(http.MethodGet)
	router.HandleFunc("/vm/{hostName}/{vmId}", CreateVM).Methods(http.MethodPost)
	router.HandleFunc("/vm/{hostName}/{vmId}", DeleteVM).Methods(http.MethodDelete)
	router.HandleFunc("/vm/{hostName}/{vmId}", UpdateVM).Methods(http.MethodPatch)
	router.HandleFunc("/vm/{hostName}/{vmId}", GetVM).Methods(http.MethodGet)
	router.HandleFunc("/vm/{hostName}", GetAllVMs).Methods(http.MethodGet)
	router.HandleFunc("/vm/{vmid}", GetVM).Methods(http.MethodGet)
	router.HandleFunc("/vm/{vmid}", UpdateVM).Methods(http.MethodPatch)
	router.HandleFunc("/vm/{vmid}", DeleteVM).Methods(http.MethodDelete)
}
