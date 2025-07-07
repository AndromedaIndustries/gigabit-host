import { prisma, type Services } from "database";
import { NewVmCard, VmCard } from "./vmCard";
import { VmTable } from "./vmTable";
import { cookies } from "next/headers";
import { ViewSelector } from "./vmClient";
import { OpenNewVmModal } from "@/components/modals/vmModalClient";
import { AddNewVmModel } from "@/components/modals/vmModalServer";
import Link from "next/link";


async function Selector({ table }: { table?: boolean }) {

    return (
        <div className="flex justify-end-safe mb-4 space-x-4">
            {(table) ? (
                <div>
                    {/* <OpenNewVmModal /> */}
                    <Link className="btn btn-primary" href={"vm/new"}>New VM</Link>
                    <AddNewVmModel />
                </div>
            ) : null}
            <div>
                <ViewSelector />
            </div>
        </div>
    )
}


export async function VmView({ vms }: { vms: Services[] }) {
    const sessionCookies = await cookies();

    const view = sessionCookies.get("vm_view")?.value || "table"; // default to table if no cookie

    if (view === "card") {
        return (
            <div>
                <Selector />
                <div className="flex flex-row flex-wrap space-x-5 space-y-5 columns-3">
                    <NewVmCard vms={vms} />
                    {vms.map((vm) => (
                        <VmCard key={vm.id} vm={vm} />
                    ))}
                </div>
            </div>
        )
    }

    if (view === "table") {
        return (
            <div>
                <Selector table={true} />
                <div className="flex flex-row flex-wrap space-x-5 space-y-5">
                    <VmTable vms={vms} />
                </div>
            </div >
        )
    }

    // Render the VMs based on the current view
    return (
        "how did you get here?"
    );
}