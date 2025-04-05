package vm

import "net/http"

type DeleteVMRequest struct {
	VmId  int
	Force bool
}

func DeleteVM(w http.ResponseWriter, r *http.Request) {

}
