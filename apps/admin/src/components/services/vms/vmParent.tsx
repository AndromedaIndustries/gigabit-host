import { prisma, type Services } from "database";
import { VmTable } from "./vmTable";
import { cookies } from "next/headers";
import { OpenNewVmModal } from "@/components/modals/vmModalClient";
import { AddNewVmModel } from "@/components/modals/vmModalServer";
import Link from "next/link";


async function Selector({ table }: { table?: boolean }) {

    return (
        <div className="flex justify-end-safe mb-4 space-x-4">
            <div>
                {/* <OpenNewVmModal /> */}
                <Link className="btn btn-accent" href={"vm/new"}>New VM</Link>
                <AddNewVmModel />
            </div>
        </div>
    )
}


export async function VmView({ vms }: { vms: Services[] }) {

    return (
        <div>
            <Selector table={true} />
            <div className="flex flex-row flex-wrap space-x-5 space-y-5">
                <VmTable vms={vms} />
            </div>
        </div >
    )

}