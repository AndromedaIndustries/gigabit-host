package vm

import "net/http"

type CreateVMRequest struct {
	TargetHost   string
	HostName     string
	VMId         int
	TemplateVMId int
	TemplateHost string
}

func CreateVM(w http.ResponseWriter, r *http.Request) {

}
