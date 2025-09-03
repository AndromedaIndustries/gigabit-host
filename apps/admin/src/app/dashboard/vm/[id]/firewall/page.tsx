import { Proxmox } from "proxmox-api";
import { proxmoxClient } from "@/utils/proxmox/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import { FirewallConfig } from "@/components/layouts/firewall/config";
import Link from "next/link";

export default async function VmFirewallManagementPage({
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

    const proxmoxApi = await proxmoxClient();

    const currentFirewallList = await proxmoxApi.nodes.$(vm_proxmox_node).qemu.$(vm_proxmox_id).firewall.rules.$get()
    let firewallRuleList: Proxmox.nodesQemuFirewallRulesGetRule[] = []

    for (let rule of currentFirewallList) {
        var position = rule.pos.toString();

        var firewallRule = await proxmoxApi.nodes.$(vm_proxmox_node).qemu.$(vm_proxmox_id).firewall.rules.$(position).$get()

        firewallRuleList = firewallRuleList.concat(firewallRule)
    }

    return (
        <div className="w-full pt-20 px-10 pb-24">
            <div className="flex flex-row-reverse space-x-5 gap-5">
                <Link href={`/dashboard/vm/${vm.id}`} className="btn btn-info btn-sm">
                    Return to VM Management
                </Link>
                <Link href={`/dashboard/vm/${vm.id}/firewall/new`} className="btn btn-accent btn-sm">
                    New Rule
                </Link>
            </div>
            <div className="bg-base-200 mt-2 px-2 py-2 rounded-xl">
                <div className="text-2xl py-3 ">Firewall Confuration for {vm?.hostname}</div>
                <FirewallConfig vm_id={id} firewallRules={firewallRuleList} proxmox_node={vm_proxmox_node} proxmox_vm_id={vm_proxmox_id} key={0} />
            </div>
            <div className="mt-5">
                <div>Firewall Information</div>
                <div className="grid grid-cols-3 text-sm gap-2">
                    <div className="card bg-base-200 shadow-sm card-body">
                        Rules are processed from position 0 first, <br />
                        rules at and closer to position 0 <br />
                        will override all subsequent firewall rules
                    </div>
                    <div className="card bg-base-200 shadow-sm card-body">
                        if you would like to block all other traffic, <br />
                        add a block rule at the last postion.
                    </div>
                </div>
            </div>
        </div>
    )
}