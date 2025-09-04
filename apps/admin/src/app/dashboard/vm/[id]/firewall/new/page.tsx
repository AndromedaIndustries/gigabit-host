import NewRuleSubmit from "@/components/services/firewall/actions/addRule";
import { proxmoxClient } from "@/utils/proxmox/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import Link from "next/link";


export default async function NewVmFirewallRulePage({
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


    return (
        <div className="w-full pt-20 px-10 pb-24">
            <div className="grid grid-cols-2 gap-2">
                <form className="fieldset  bg-base-200 border-base-300 rounded-box border p-4">
                    <fieldset>
                        <legend className="fieldset-legend">New Firewall Rule</legend>
                        <div className="grid grid-cols-2 gap-1 place-items-center">

                            <div className="w-full">
                                <legend className="fieldset-legend">Firewall Position</legend>
                                <input type="number" id="position" name="position" className="input validator" defaultValue="0"
                                    min="0"
                                    max={(currentFirewallList.length + 1)} />
                                <p className="label">By default new rules are placed at 0</p>
                                <p className="validator-hint">Max Value {currentFirewallList.length + 1}</p>

                            </div>

                            <div className="w-full">
                                <legend className="fieldset-legend">Direction</legend>
                                <select id="type" name="type" defaultValue="Traffic Direction" className="select validator">
                                    <option disabled={true}>Traffic Direction</option>
                                    <option>IN</option>
                                    <option>OUT</option>
                                </select>
                                <p className="label">IN is inbound to host</p>
                                <p className="validator-hint">Required</p>
                            </div>

                            <div className="w-full">
                                <legend className="fieldset-legend">Rule Action</legend>
                                <select defaultValue="Rule Action" id="action" name="action" className="select validator">
                                    <option disabled={true}>Rule Action</option>
                                    <option>ACCEPT</option>
                                    <option>REJECT</option>
                                    <option>DROP</option>
                                </select>
                                <p className="label">Firewall Action</p>
                                <p className="validator-hint">Required</p>
                            </div>

                            <div className="w-full">
                                <legend className="fieldset-legend">Protocol</legend>
                                <select defaultValue="Select Protocol" id="protocol" name="protocol" className="select">
                                    <option disabled={true}>Select Protocol</option>
                                    <option>TCP</option>
                                    <option>UDP</option>
                                    <option>ICMP</option>
                                </select>
                                <p className="label mb-7">Select Protocol</p>
                            </div>

                            <div className="w-full">
                                <legend className="fieldset-legend">Source IP</legend>
                                <input type="text"
                                    id="source" name="source"
                                    className="input" placeholder="ALL" />
                                <p className="label">IPv4 or IPv6 - Not Both</p>
                            </div>

                            <div className="w-full">
                                <legend className="fieldset-legend">Source Port</legend>
                                <input type="number"
                                    id="sport" name="sport" className="input" placeholder="ALL" />
                                <p className="label">Any number between 1-65535</p>.
                            </div>

                            <div className="w-full">
                                <legend className="fieldset-legend">Destination IP</legend>
                                <input type="text"
                                    id="destination" name="destination" className="input" placeholder="ALL" />
                                <p className="label">IPv4 or IPv6 - Not Both</p>
                            </div>

                            <div className="w-full">
                                <legend className="fieldset-legend">Destination Port</legend>
                                <input type="number"
                                    id="dport" name="dport" className="input" placeholder="ALL" />
                                <p className="label">Any number between 1-65535</p>
                            </div>

                            <div className="w-full">
                                <legend className="fieldset-legend">Enabled</legend>
                                <label className="label">
                                    <input type="checkbox"
                                        defaultChecked
                                        id="enable" name="enable" className="toggle border-indigo-600 bg-indigo-500 checked:border-orange-500 checked:bg-orange-400 checked:text-orange-800" />
                                </label>
                            </div>

                            <div className="col-span-2 w-full">
                                <legend className="fieldset-legend">Comment</legend>
                                <input type="text"
                                    id="comment" name="comment" className="input w-full" placeholder="Optional Comment" />
                            </div>
                        </div>

                        <input type="text" id="vmId" name="vmId"
                            defaultValue={id} hidden />


                    </fieldset>
                    <button formAction={NewRuleSubmit} className="btn btn-accent mt-4">Submit</button>
                </form>
                <div className="card bg-base-200 h-fit">
                    <div className="card-body">
                        <Link href={`/dashboard/vm/${vm.id}/firewall`} className="btn btn-info" >
                            Back to Firewall
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    )

    //http://localhost:3001/dashboard/vm/01JZPF3KE34TKGWSYR89MGRW0M/firewall
}