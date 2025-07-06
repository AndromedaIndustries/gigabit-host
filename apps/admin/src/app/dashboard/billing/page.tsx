import { BillingHeaders, BillingItem } from "@/components/cards/billing";
import { getStripe } from "@/utils/stripe/stripe";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";


export default async function Billing() {
    const authClient = await createClient();
    const user = await authClient.auth.getUser();

    if (!user) {
        throw new Error("No user found");
    }

    const user_mapping = await prisma.third_Party_User_Mapping.findUnique({
        where: {
            id: user.data.user?.id
        }
    })

    if (!user_mapping) {
        throw new Error("No User Mapping Found")
    }

    const stripe = getStripe();

    const active_subscriptions = await stripe.subscriptions.list({
        customer: user_mapping.stripe_customer_id
    })

    return (
        <div className="pt-20 px-10 pb-24">
            <div className="text-3xl">Billing Overview</div>
            <table className="table table-xs table-pin-rows table-pin-cols mt-5">
                <BillingHeaders />

                {active_subscriptions.data.map((subscription, index) => (
                    <BillingItem key={index} subscription={subscription} />
                ))}
            </table>
        </div>
    );
}