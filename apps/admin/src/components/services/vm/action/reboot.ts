import { proxmoxClient } from "@/utils/proxmox/client";
import { CommonVMParameters } from "./common";
import { revalidatePath } from "next/cache";
import { setTimeout } from "timers/promises";


export default async function RebootVM(params: CommonVMParameters) {

    const proxmoxApiClient = await proxmoxClient();

    const vm_id = params.vm_id
    const vm_proxmox_node = params.proxmox_node
    const vm_proxmox_id = params.proxmox_vm_id

    const vmPowerState = await proxmoxApiClient.nodes.$(vm_proxmox_node).qemu.$(vm_proxmox_id).status.current.$get()

    if (vmPowerState.status == "stopped") {
        return
    }

    proxmoxApiClient.nodes.$(vm_proxmox_node).qemu.$(vm_proxmox_id).status.reboot.$post({
        // Timeout in Seconds
        timeout: 5
    })

    setTimeout(1000)

    revalidatePath(`/dashboard/vm/${vm_id}`, "page");
}