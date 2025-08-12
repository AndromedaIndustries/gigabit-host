import { proxmoxClient } from "@/utils/proxmox/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";

export default async function VmManagementPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {

    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user_id = userObject.data.user?.id;

    const { id } = await params;

    const vm = await prisma.services.findFirst({
        where: {
            user_id: user_id,
            id: id,
        },
    });

    if (!vm) {
        throw new Error("VM not found");
    }

    if (!vm.proxmox_node) {
        throw new Error("Proxmox node Not Defined")
    }

    if (!vm.proxmox_vm_id) {
        throw new Error("Proxmox vm id Not Defined")
    }

    const vm_proxmox_node = vm.proxmox_node
    const vm_proxmox_id = parseInt(vm.proxmox_vm_id, 10)

    const proxmox = await proxmoxClient();

    const currentFirewallConfig = await proxmox.nodes.$(vm_proxmox_node).qemu.$(vm_proxmox_id).firewall.rules.$get()

    console.log(currentFirewallConfig)

    return (
        <div className="w-full pt-20 px-10 pb-24">
            <h1>Firewall configuration for {vm?.hostname}</h1>
        </div>
    )
}