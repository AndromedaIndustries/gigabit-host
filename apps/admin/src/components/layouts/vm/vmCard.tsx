import { prisma, type Services } from "database";
import type { ServiceMetadata } from "@/types/services";
import Link from "next/link";
import { GetSku } from "./vmHelpers";


type vmCardProp = {
    vm: Services
}

export async function NewVmCard({ vms }: { vms: Services[] }) {
    let totalCosts = 0;
    let totalVms = 0;

    // Calculate total costs for all VMs
    for (const vm of vms) {
        totalVms++;
        const sku = await prisma.sku.findUnique({
            where: {
                id: vm.current_sku_id
            },
        });
        if (sku) {
            totalCosts += sku.price;
        }
    }

    return (
        <div className="card card-border bg-base-300 w-64 h-64">
            <div className="card-body items-center text-center">
                <div className="card-title text-2xl">Total Costs</div>
                <div className="text-lg">
                    {totalCosts.toFixed(2)} <span className="text-sm">$/mo</span>
                </div>
                <div className="card-title text-2xl">Total VMs</div>
                <div className="text-lg">
                    {totalVms}
                </div>
                <Link href={"/dashboard/vm/new"} className="btn btn-outline btn-primary mt-auto">
                    Add new VM
                </Link>
            </div>
        </div>
    )
}

export async function VmCard({ vm }: vmCardProp) {

    // get the FQDN of the VM
    const fqdn = vm.hostname

    // split the domain from the hostname using a url object
    const url = new URL(`http://${fqdn}`);
    const domain = url.hostname;

    // get the sku from the database using the sku_id from the vm object
    const sku = await GetSku(vm.current_sku_id);
    const metadata: ServiceMetadata =
        typeof vm.metadata === 'object' && vm.metadata !== null && !Array.isArray(vm.metadata)
            ? (vm.metadata as ServiceMetadata)
            : {}

    const ipv4Address = metadata?.ipv4_address || "IP Pending";
    const ipv6Address = metadata?.ipv6_address || "IP Pending";

    return (
        <div className="card card-border bg-base-300 w-64 h-64" key={vm.id}>
            <div data-sku-id={vm.sku_id} className="card-body items-center text-center">
                <div className="card-title overflow-ellipsis">{domain.slice(0, 25)}</div>
                <div className="flex flex-row items-center justify-center space-y-1 w-full">
                    <div className="flex-1/2">
                        <div className="text-lg">{sku?.price} <span className="text-sm">$/mo</span></div>
                    </div>
                    <div className="flex-1/2">
                        <div className="text-md">{sku?.sku}</div>
                    </div>
                </div>
                <div className="flex flex-row items-center justify-center w-full">
                    <div className="flex-1/2">
                        {vm.subscription_active ? (
                            <div className="badge badge-success badge-sm">Active</div>
                        ) : (
                            <div className="badge badge-error badge-sm">Ina ctive</div>
                        )}
                    </div>
                    <div className="flex-1/2">
                        {vm.status === "configured" ? (
                            <div className="badge badge-success badge-sm">Online</div>
                        ) : (
                            <div className="badge badge-error badge-sm">Error</div>
                        )}
                    </div>
                </div>
                <div>
                    IPv4: {ipv4Address}
                </div>
                <div>
                    IPv6: {ipv6Address}
                </div>
                <div className="card-actions w-full justify-center mt-auto">
                    <Link href={`/dashboard/vm/${vm.id}`} className="btn btn-primary">manage</Link>
                </div>
            </div>
        </div >
    )
}