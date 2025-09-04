"use server";
import { proxmoxClient } from "@/utils/proxmox/client"
import { type CommonFirewallParameters } from "./common";
import { revalidatePath } from "next/cache";

export async function MoveRule(params: CommonFirewallParameters, new_pos: number) {

    const proxmoxApiClient = await proxmoxClient();

    const vm_id = params.vm_id
    const vm_proxmox_node = params.proxmox_node
    const vm_proxmox_id = params.proxmox_vm_id
    const rule_pos = params.rule_pos

    await proxmoxApiClient.nodes.$(vm_proxmox_node).qemu.$(vm_proxmox_id).firewall.rules.$(rule_pos).$put({
        moveto: new_pos
    })

    revalidatePath(`/dashboard/vm/${vm_id}/firewall`, "page");

}