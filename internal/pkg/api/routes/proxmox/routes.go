package proxmox

import (
	"github.com/andromedaindustries/gigabit-host/internal/pkg/api/routes/proxmox/vm"
	"github.com/gorilla/mux"
)

func AddProxmoxRoutes(router *mux.Router) {
	vm.AddVMRoutes(router)
}
