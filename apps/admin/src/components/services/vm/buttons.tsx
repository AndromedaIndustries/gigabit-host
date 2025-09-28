import { CommonVMParameters } from "./action/common";
import RebootVM from "./action/reboot";
import StartVM from "./action/start";
import StopVM from "./action/stop";

export async function VmRebootButton({ vm_id, proxmox_node, proxmox_vm_id }: CommonVMParameters) {

    async function rebootVm() {
        // Server Function
        'use server';

        RebootVM({
            vm_id: vm_id,
            proxmox_node,
            proxmox_vm_id
        })
    }

    return (
        <button onClick={rebootVm} className="btn btn-warning w-36">
            Reboot VM
        </button>
    )

}

export async function VmStartButton({ vm_id, proxmox_node, proxmox_vm_id }: CommonVMParameters
) {

    async function startVm() {
        // Server Function
        'use server';

        StartVM({
            vm_id: vm_id,
            proxmox_node,
            proxmox_vm_id
        })
    }

    return (
        <button onClick={startVm} className="btn btn-success w-36">
            Start VM
        </button>
    )

}

export async function VmStopButton({ vm_id, proxmox_node, proxmox_vm_id }: CommonVMParameters) {

    async function rebootVm() {
        // Server Function
        'use server';

        StopVM({
            vm_id: vm_id,
            proxmox_node,
            proxmox_vm_id
        })
    }

    return (
        <button onClick={rebootVm} className="btn btn-error w-36">
            Stop VM
        </button>
    )

}