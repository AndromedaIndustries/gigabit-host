import { Services, prisma } from "database";
import Stripe from "stripe";
import { GetSku } from "../services/vms/vmHelpers";

async function GetVmFromSubscriptionId(subscriptionId: string): Promise<Services | null> {

    const service = await prisma.services.findFirst({
        where: {
            subscription_id: subscriptionId
        }
    })

    return service

}

export async function BillingHeaders() {
    return (
        <thead>
            <tr>
                <th>Hostname</th>
                <th>Date Created</th>
                <th>Price</th>
                <th>Subscription Status</th>
            </tr>
        </thead>
    )
}

export async function BillingItem({ subscription }: { subscription: Stripe.Subscription }) {

    const vm = await GetVmFromSubscriptionId(subscription.id)

    if (vm == null) {
        return (null)
    }

    const sku = await GetSku(vm.current_sku_id)

    const created = new Date(subscription.created * 1000)

    return (
        <tr id="index">
            <td className="text-left">{vm.hostname}</td>
            <td className="text-left">{created.toLocaleString()}</td>
            <td className="text-left">{sku?.price} $/mo</td>
            <td className="text-left">{subscription.status}</td>
        </tr>
    );
}