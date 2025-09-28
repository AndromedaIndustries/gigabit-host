import { proxmoxClient } from "@/utils/proxmox/client";
import { CommonVMParameters } from "./common";
import { revalidatePath } from "next/cache";
import { setTimeout } from "timers/promises";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";


export default async function StopVM(params: CommonVMParameters) {

    const proxmoxApiClient = await proxmoxClient();
    const supabaseClint = await createClient();

    const user = (await supabaseClint.auth.getUser()).data.user;

    if (!user) {
        throw new Error("user not found")
    }

    const vm_id = params.vm_id
    const vm_proxmox_node = params.proxmox_node
    const vm_proxmox_id = params.proxmox_vm_id

    if (!vm_proxmox_node) {
        throw new Error("Missing Proxmox Node")
    }

    if (!vm_proxmox_id) {
        throw new Error("Missing Proxmox VM ID")
    }

    const vmPowerState = await proxmoxApiClient.nodes.$(vm_proxmox_node).qemu.$(vm_proxmox_id).status.current.$get()

    if (vmPowerState.status == "stopped") {
        return
    }

    await proxmoxApiClient.nodes.$(vm_proxmox_node).qemu.$(vm_proxmox_id).status.stop.$post({
        // Timeout in Seconds
        timeout: 15
    })

    await prisma.audit_Log.create({
        data: {
            user_id: user.id,
            action: "stopped_vm",
            description: `User stopped service with id: ${params.vm_id}`,
        },
    });


    setTimeout(1000)

    revalidatePath(`/dashboard/vm/${vm_id}`, "page");
}