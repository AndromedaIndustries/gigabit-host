import type { Services, Sku } from "database";
import Link from "next/link";
import { prisma } from "database";

type vmCardProp = {
    vm: Services
}

async function getSku(skuId: string): Promise<Sku | null> {

    const skuName = await prisma.sku.findUnique({
        where: {
            id: skuId
        },
    });

    return skuName;
}

export async function VmCard({ vm }: vmCardProp) {

    // get the FQDN of the VM
    const fqdn = vm.hostname

    // split the domain from the hostname using a url object
    const url = new URL(`http://${fqdn}`);
    const domain = url.hostname;

    // get the sku from the database using the sku_id from the vm object
    const sku = await getSku(vm.current_sku_id);

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
                <div className="flex flex-row items-center justify-center space-y-1 w-full">
                    <div className="flex-1/2">
                        <div className="badge badge-success badge-sm">{vm.subscription_active ? "Active" : "Inactive"}</div>
                    </div>
                    <div className="flex-1/2">
                        {vm.status === "a" ? (
                            <div className="badge badge-success badge-sm">Online</div>
                        ) : (
                            <div className="badge badge-error badge-sm">Error</div>
                        )}
                    </div>
                </div>
                <div>
                    IPv4: Not Implemented Yet
                </div>
                <div>
                    IPv6: Not Implemented Yet
                </div>
                <div className="card-actions w-full justify-center mt-auto">
                    <Link href={`/dashboard/vm/${vm.id}`} className="btn btn-primary">manage</Link>
                </div>
            </div>
        </div >
    )
}