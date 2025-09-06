"use server";
import { proxmoxClient } from "@/utils/proxmox/client"
import { type CommonFirewallParameters } from "./common";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";

export default async function ToggleRule(params: CommonFirewallParameters, enabled: number) {


    const proxmoxApiClient = await proxmoxClient();
    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user_id = userObject.data.user?.id;

    if (!user_id) {
        throw new Error("User not found");
    }

    const vm_id = params.vm_id
    const vm_proxmox_node = params.proxmox_node
    const vm_proxmox_id = params.proxmox_vm_id
    const rule_pos = params.rule_pos

    await proxmoxApiClient.nodes.$(vm_proxmox_node).qemu.$(vm_proxmox_id).firewall.rules.$(rule_pos).$put({
        enable: enabled
    })

    await prisma.audit_Log.create({
        data: {
            user_id: user_id,
            action: "toggeled_firewall_rule",
            description: `User toggled firewall rule at pos ${params.rule_pos} for service: ${vm_id}`,
        },
    });

    revalidatePath(`/dashboard/vm/${vm_id}/firewall`, "page");

}