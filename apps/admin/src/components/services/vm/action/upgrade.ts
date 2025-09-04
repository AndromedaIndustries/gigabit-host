"use server";
import { proxmoxClient } from "@/utils/proxmox/client";
import { CommonVMParameters } from "./common";
import { getStripe } from "@/utils/stripe/stripe";
import { prisma } from "database";
import { createClient } from "@/utils/supabase/server";


export default async function UpgradeVM(
    params: CommonVMParameters,
    new_sku: string,
    current_subscription: string
) {

    const proxmoxApiClient = await proxmoxClient();
    const stripe = await getStripe()

    const vm_id = params.vm_id
    const vm_proxmox_node = params.proxmox_node
    const vm_proxmox_id = params.proxmox_vm_id

    const supabase = await createClient();
    const user_object = await supabase.auth.getUser();
    const user = user_object.data.user

    if (user == null) {
        throw new Error("User not found")
    }

    const account_type = user.user_metadata.account_type as string

    const sku = await prisma.sku.findUnique({
        where: {
            id: new_sku
        },
    })

    const vm = await prisma.services.findUnique({
        where: {
            id: vm_id
        },
    })

    if (sku == null) {
        return new Error("Sku not found")
    }

    const subscription = await stripe.subscriptions.retrieve(
        current_subscription
    )

    const subscriptionItemId = subscription.items.data[0].id

    if (account_type == "Business") {

        const subscriptionUpdate = await stripe.subscriptionItems.update(
            subscriptionItemId,
            {
                price: sku.stripe_business_sku,
                proration_behavior: "create_prorations"
            }
        )
    }

    if (account_type == "Personal") {
        const subscriptionUpdate = await stripe.subscriptionItems.update(
            subscriptionItemId,
            {
                price: sku.stripe_personal_sku
            }
        )
    }


}