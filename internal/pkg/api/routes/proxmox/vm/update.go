package vm

import "net/http"

type UpdateVMRequest struct {
	VmId    int
	Cpu     int
	Memory  int
	Storage int
}

func UpdateVM(w http.ResponseWriter, r *http.Request) {

}
