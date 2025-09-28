
import { VmMetadata } from "@/types/vmMetadata";
import { GetSku } from "@/components/services/vms/vmHelpers";
import { proxmoxClient } from "@/utils/proxmox/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import Link from "next/link";
import { UsageBar } from "@/components/services/vm/usageBar";
import { ProductAttributes } from "@/types/productAttributes";
import { VmRebootButton, VmStartButton, VmStopButton } from "@/components/services/vm/buttons";
import { logger } from "@/lib/logger";

export default async function VmManagementPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {

    const proxmoxApiClient = await proxmoxClient();
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

    const currentSku = await GetSku(vm.sku_id)

    if (currentSku == undefined) {
        throw new Error("sku not found")
    }

    if (currentSku.attributes == undefined) {
        throw new Error("sku attributes missing")
    }

    var isUp: boolean = false
    var running: boolean = false
    var uptimeDays: number = 0
    var uptimeHours: number = 0
    var uptimeMinutes: number = 0
    var uptimeSecond: number = 0
    var maxmem: number = 0
    var vmUptimeSeconds = 0
    var runningState: String = ""
    var cpuUsage: number = 0
    var memoryUsage: number = 0
    var vmMetadata: VmMetadata = {
        ipv4_address: "",
        ipv6_address: ""
    }

    var proxmoxNode
    var proxmoxVmId

    proxmoxNode = vm.proxmox_node
    if (proxmoxNode == null) {
        logger.warn("Missing Proxmox Node")
    } else {

        const proxmoxVmIdString = vm.proxmox_vm_id
        if (proxmoxVmIdString == null) {
            logger.warn("VM ID NOT Found")
        } else {
            proxmoxVmId = parseInt(proxmoxVmIdString, 10)

            const vmPowerState = await proxmoxApiClient.nodes.$(proxmoxNode).qemu.$(proxmoxVmId).status.current.$get()

            maxmem = vmPowerState.maxmem || 0

            if (maxmem == undefined) {
                maxmem = (currentSku.attributes as unknown as ProductAttributes).memory
            }

            vmUptimeSeconds = vmPowerState.uptime || 0
            runningState = vmPowerState.status
            cpuUsage = parseFloat((vmPowerState.cpu * 100).toFixed(2))
            memoryUsage = parseFloat(((vmPowerState.mem / maxmem) * 100).toFixed(2))


            if (vmUptimeSeconds == undefined) {
                isUp = false;
                running = false;
                uptimeDays = 0
                uptimeHours = 0
                uptimeMinutes = 0
                uptimeSecond = 0
            } else {
                isUp = true;
                running = true;
                [uptimeDays, uptimeHours, uptimeMinutes, uptimeSecond] = convertTime(vmUptimeSeconds);
            }
            vmMetadata = vm.metadata as VmMetadata
        }
    }


    return (
        <div className="w-full pt-20 px-10 pb-24">
            <div className="grid grid-cols-2 gap-2">
                <div className="card bg-base-200 ">
                    <div className="card-body">
                        <div className="card-title">Host Overview</div>
                        <div className="grid grid-cols-2 gap-1">
                            <div>Hostname:</div>
                            <div>{vm?.hostname}</div>
                            <div>Size:</div>
                            <div>{currentSku?.name}</div>
                            <div>Created:</div>
                            <div>{vm?.created_at.toDateString()}</div>
                            <div>CPU Usage:</div>
                            <div>
                                <UsageBar max={100} value={cpuUsage} additionalCSS="w-56" />
                            </div>
                            <div>Memory Usage:</div>
                            <div>
                                <UsageBar max={100} value={memoryUsage} additionalCSS="w-56" />
                            </div>
                            <div>Power Status:</div>
                            <div>{normalize(runningState)}</div>
                            <div>Uptime:</div>
                            {(running) ? (<div>
                                {(uptimeDays > 0) ?
                                    uptimeDays + " Days " : null}
                                {(uptimeHours > 0) ?
                                    uptimeHours + " Hours " : null}
                                {(uptimeMinutes > 0) ?
                                    uptimeMinutes + " Min " : null}
                                {(uptimeSecond > 0) ?
                                    uptimeSecond + " Seconds " : null}
                            </div>) : null}
                            <div>IPv4 Address:</div>
                            <div>{vmMetadata.ipv4_address}</div>
                            <div>IPv6 Address:</div>
                            <div>{vmMetadata.ipv6_address}</div>
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-2 gap-2 align-top">
                    <div className="card bg-base-200 place-items-center">
                        <div className="card-body">
                            <div className="card-title">VM Configuration</div>
                            <div>
                                <Link href={`/dashboard/vm/${vm.id}/firewall`} className="btn btn-primary w-36">
                                    Firewall Settings
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="card bg-base-200 place-items-center">
                        <div className="card-body">
                            <div className="card-title">VM Utilites</div>
                            <div className="grid gap-2">
                                {(runningState == "running") ?
                                    <div>
                                        <Link href={`/dashboard/vm/${id}/vnc`} className="btn btn-success w-36">
                                            VM Console
                                        </Link>
                                    </div>
                                    : null}
                            </div>
                            <div className="card-title">VM Power Control</div>
                            <div className="grid gap-2">
                                {(runningState == "stopped") ?
                                    <div>
                                        <VmStartButton
                                            vm_id={vm.id}
                                            proxmox_node={proxmoxNode}
                                            proxmox_vm_id={proxmoxVmId}
                                        />

                                    </div>
                                    : null}
                                {(runningState == "running") ?
                                    <div>
                                        <VmStopButton
                                            vm_id={vm.id}
                                            proxmox_node={proxmoxNode}
                                            proxmox_vm_id={proxmoxVmId}
                                        />
                                    </div>
                                    : null}
                                {(runningState == "running") ?
                                    <div>
                                        <VmRebootButton
                                            vm_id={vm.id}
                                            proxmox_node={proxmoxNode}
                                            proxmox_vm_id={proxmoxVmId}
                                        />
                                    </div>
                                    : null}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200">
                    <div className="card-body grid grid-cols-2">
                        <div>
                            <div className="card-title text-accent">Subscription Status</div>
                            <p> {(vm.subscription_active) ? "Active" : "Inactive"} </p>
                            {(vm.subscription_active) ? null : <p>Expires: End of current billing cycle</p>}
                        </div>

                        <div className="place-content-center">
                            {(vm.subscription_active) ? (
                                <form action={`/api/subscription/cancel?vm_id=${vm?.id}`} method="POST">
                                    <button type="submit" className="btn btn-error btn-sm">Cancel Subscription</button>
                                </form>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

function normalize(string: String) {
    var newString = string.slice(0, 1).toUpperCase() + string.slice(1, string.length)

    return newString
}

function convertTime(totalSeconds: number): [number, number, number, number] {

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return [days, hours, minutes, seconds]
}

