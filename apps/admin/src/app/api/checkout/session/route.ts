"use server";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { prisma } from "database";
import { redirect } from "next/navigation";

import { getStripe } from "@/utils/stripe/stripe";
import { NextResponse } from "next/server";

// This action runs on the server
export async function POST(request: Request) {
  const data = await request.formData();
  const headersList = await headers();
  const origin = headersList.get("origin");
  const authClient = await createClient();
  const user = await authClient.auth.getUser();
  if (!user) {
    throw new Error("No user found");
  }

  const account_type = user.data.user?.user_metadata.account_type;
  const userID = user.data.user?.id;

  if (!user.data.user) {
    throw new Error("No user found");
  }
  const email = user.data.user.email;

  if (!userID) {
    throw new Error("No user found");
  }

  if (!email) {
    throw new Error("No email found");
  }

  const hostname = data.get("hostname") as string;
  const vm_id = data.get("vm_id") as string;
  const os_id = data.get("os_id") as string;
  const public_key_id = data.get("public_key_id") as string;
  const ssh_user = data.get("ssh_user") as string;
  let price = "";
  const vm = await prisma.sku.findUnique({
    where: {
      id: vm_id,
    },
  });

  if (!vm) {
    throw new Error("VM not found");
  }

  if (vm.quantity === 0) {
    throw new Error("VM not available");
  }

  if (account_type !== "Personal" && account_type !== "Business") {
    throw new Error("Account type not set");
  }

  if (account_type === "Personal") {
    price = vm.stripe_personal_sku;
  }

  if (account_type === "Business") {
    price = vm.stripe_business_sku;
  }

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  const nextMonthTimestamp = Math.floor(nextMonth.getTime() / 1000);

  const stripe = getStripe();

  let third_party_mapping = await prisma.third_Party_User_Mapping.findUnique({
    where: {
      id: userID
    }
  }) 

  if (!third_party_mapping) {

    const user_email = user.data.user.email

    if (!user_email){
      throw new Error("User Email not Set")
    }

    const customer = await stripe.customers.create({
      email: user_email
    })

    third_party_mapping = await prisma.third_Party_User_Mapping.create({
      data: {
        id: userID,
        stripe_customer_id: customer.id
      }
    })
  }

  const stripe_customer_id = third_party_mapping.stripe_customer_id

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: price,
          quantity: 1,
        },
      ],
      customer: stripe_customer_id,
      mode: "subscription",
      submit_type: "subscribe",
      success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/api/checkout/cancel?session_id={CHECKOUT_SESSION_ID}&canceled=true`,
      automatic_tax: { enabled: true },
      subscription_data: {
        billing_cycle_anchor: nextMonthTimestamp,
        proration_behavior: "create_prorations",
      },
    });

    if (!session.url || !session.id) {
      throw new Error("Session URL is not defined");
    }

    const template = await prisma.proxmoxTemplates.findUnique({
      where: {
        id: os_id,
      },
    });
    if (!template) {
      throw new Error("Template not found");
    }

    const newService = await prisma.services.create({
      data: {
        user_id: userID,
        service_type: "virtual_machine",
        hostname: hostname,
        template_id: os_id,
        os_name: template.name,
        os_version: template.version,
        metadata: {
          initial_sku: vm.sku,
          initial_price: vm.price.toString(),
        },
        public_key_id: public_key_id,
        username: ssh_user,
        sku_id: vm_id,
        current_sku_id: vm.id,
        initial_sku_id: vm.id,
        initial_checkout_id: session.id,
        status: "pending",
      },
    });

    if (!newService) {
      throw new Error("Service not created");
    }

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error(error);
    redirect("/error");
  }
}
