package vm

import (
	"net/http"
)

func GetAllVMs(w http.ResponseWriter, r *http.Request) {
	// variables := mux.Vars(r)
	// hostName := variables["hostName"]

	// config, ok := configinjector.FromContext(r.Context())
	// if !ok {
	// 	http.Error(w, "config not found", http.StatusInternalServerError)
	// 	return
	// }

	// node, nodeErr := config.ProxmoxClient.Node(r.Context(), hostName)
	// if nodeErr != nil {
	// 	config.Logger.Error("Error getting node", zap.String("node", hostName), zap.Error(nodeErr))
	// 	http.Error(w, "error getting node", http.StatusInternalServerError)
	// 	return
	// }

	// vms, vmErr := node.VirtualMachines(r.Context())
	// if vmErr != nil {
	// 	config.Logger.Error("Error getting VMs", zap.String("node", hostName), zap.Error(nodeErr))
	// 	http.Error(w, "error getting VMs", http.StatusInternalServerError)
	// 	return
	// }

	// vmsJson, jsonErr := json.Marshal(vms)
	// if jsonErr != nil {
	// 	config.Logger.Error("Error marshalling VMs", zap.String("node", hostName), zap.Error(vmErr))
	// 	http.Error(w, "error marshalling VMs", http.StatusInternalServerError)
	// 	return
	// }

	// config.Logger.Info("Listing VMs from Proxmox", zap.String("from", r.RemoteAddr))
	// w.Write(vmsJson)

}

func GetVM(w http.ResponseWriter, r *http.Request) {
	// variables := mux.Vars(r)
	// hostName := variables["hostName"]
	// vmId64, vmIdErr := strconv.ParseInt(variables["vmId"], 10, 0)
	// vmId := int(vmId64)
	// if vmIdErr != nil {
	// 	http.Error(w, "error parsing vmId", http.StatusInternalServerError)
	// 	return
	// }

	// config, ok := configinjector.FromContext(r.Context())
	// if !ok {
	// 	http.Error(w, "config not found", http.StatusInternalServerError)
	// 	return
	// }

	// node, nodeErr := config.ProxmoxClient.Node(r.Context(), hostName)
	// if nodeErr != nil {
	// 	config.Logger.Error("Error getting node", zap.String("node", hostName), zap.Error(nodeErr))
	// 	http.Error(w, "error getting node", http.StatusInternalServerError)
	// 	return
	// }

	// vm, vmErr := node.VirtualMachine(r.Context(), vmId)
	// if vmErr != nil {
	// 	config.Logger.Error("Error getting VM", zap.String("node", hostName), zap.Error(nodeErr))
	// 	http.Error(w, "error getting VM", http.StatusInternalServerError)
	// 	return
	// }

	// vmJson, jsonErr := json.Marshal(vm)
	// if jsonErr != nil {
	// 	config.Logger.Error("Error marshalling VMs", zap.String("node", hostName), zap.Error(vmErr))
	// 	http.Error(w, "error marshalling VMs", http.StatusInternalServerError)
	// 	return
	// }

	// config.Logger.Info("Listing VMs from Proxmox", zap.String("node", hostName), zap.Int("VMID", vmId), zap.String("from", r.RemoteAddr))
	// w.Write(vmJson)

}

func GetTemplateVMs(w http.ResponseWriter, r *http.Request) {

	// var templateVms []proxmox.VirtualMachine

	// config, ok := configinjector.FromContext(r.Context())
	// if !ok {
	// 	http.Error(w, "config not found", http.StatusInternalServerError)
	// 	return
	// }

	// proxmoxNodes, nodesErr := config.ProxmoxClient.Nodes(r.Context())

	// if nodesErr != nil {
	// 	config.Logger.Error("Error getting nodes", zap.Error(nodesErr))
	// 	http.Error(w, "error getting nodes", http.StatusInternalServerError)
	// 	return
	// }

	// for _, node := range proxmoxNodes {
	// 	nodeName := strings.Split(node.ID, "/")[1]

	// 	node, nodeErr := config.ProxmoxClient.Node(r.Context(), nodeName)
	// 	if nodeErr != nil {
	// 		config.Logger.Error("Error getting node", zap.String("node", nodeName), zap.Error(nodeErr))
	// 		http.Error(w, "error getting node", http.StatusInternalServerError)
	// 		return
	// 	}

	// 	vms, vmErr := node.VirtualMachines(r.Context())
	// 	if vmErr != nil {
	// 		config.Logger.Error("Error getting VMs", zap.String("node", nodeName), zap.Error(vmErr))
	// 		http.Error(w, "error getting VMs", http.StatusInternalServerError)
	// 		return
	// 	}

	// 	for _, singleVm := range vms {
	// 		if singleVm.Template {
	// 			templateVms = append(templateVms, *singleVm)
	// 		}
	// 	}
	// }

	// vmsJson, jsonErr := json.Marshal(templateVms)
	// if jsonErr != nil {
	// 	config.Logger.Error("Error marshalling VMs", zap.Error(jsonErr))
	// 	http.Error(w, "error marshalling VMs", http.StatusInternalServerError)
	// 	return
	// }

	// config.Logger.Info("Listing Template VMs from Proxmox", zap.String("Requestor", r.RemoteAddr))

	// w.WriteHeader(http.StatusOK)
	// w.Write(vmsJson)

}
