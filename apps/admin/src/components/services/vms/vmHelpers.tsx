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