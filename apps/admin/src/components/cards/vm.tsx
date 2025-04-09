import type { Services } from "database";
import Link from "next/link";

type vmCardProp = {
    vm: Services
}

export function VmCard({ vm }: vmCardProp) {

    return (
        <div className="card card-border bg-base-300 w-64 h-64" key={vm.id}>
            <div className="card-body items-center text-center">
                <h2 className="card-title">{vm.hostname}</h2>
                <p>{vm.current_sku_name}</p>
                <div className="card-actions justify-end">
                    <Link href={`/dashboard/vm/${vm.id}`} className="btn btn-primary">manage</Link>
                </div>
            </div>
        </div>
    )
}