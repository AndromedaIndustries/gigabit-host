import type { Services } from "database";
import Link from "next/link";

type vmCardProp = {
    vm: Services
}

export function VmCard({ vm }: vmCardProp) {

    // get the FQDN of the VM
    const fqdn = vm.hostname

    // split the domain from the hostname using a url object
    const url = new URL(`http://${fqdn}`);
    const domain = url.hostname;

    return (
        <div className="card card-border bg-base-300 w-64 h-64" key={vm.id}>
            <div id={vm.sku_id} className="card-body items-center text-center">
                <h2 className="card-title">{domain}</h2>
                <div className="card-actions justify-end">
                    <Link href={`/dashboard/vm/${vm.id}`} className="btn btn-primary">manage</Link>
                </div>
            </div>
        </div>
    )
}