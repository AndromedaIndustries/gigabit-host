"use server";
import { prisma, Services, type Sku } from "database";
import { cookies } from "next/headers";
import { VmRow } from "./vmTable";

export async function GetSku(skuId: string): Promise<Sku | null> {

    const skuName = await prisma.sku.findUnique({
        where: {
            id: skuId
        },
    });

    return skuName;
}


// Set the view in cookies
export async function HandleViewChange(view: "card" | "table") {
    const sessionCookies = await cookies();
    sessionCookies.set("vm_view", view, { path: "/" });
};

export async function VmTable({ vms }: { vms: Services[] }) {
    return (
        <table className="table w-full">
            <thead>
                <tr>
                    <th>Hostname</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>IPv4 Address</th>
                    <th>IPv6 Address</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {vms.map((vm) => (
                    <VmRow key={vm.id} vm={vm} />
                ))}
            </tbody>
        </table>
    );
}

export async function VmCards({ vms }: { vms: Services[] }) {
    return (
        <div className="flex flex-row flex-wrap space-x-5 space-y-5">
            <VmCards vms={vms} />
        </div>
    );
}