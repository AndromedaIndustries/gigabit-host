"use server";
import { prisma, type Sku } from "database";
import { cookies } from "next/headers";

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