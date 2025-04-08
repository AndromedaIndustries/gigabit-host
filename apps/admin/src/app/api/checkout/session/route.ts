"use server";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { prisma } from "database";
import { redirect } from "next/navigation";

import { stripe } from "@/utils/stripe/stripe";
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

  const email = data.get("email") as string;
  const hostname = data.get("hostname") as string;
  const vm_id = data.get("size") as string;
  const os = data.get("os") as string;
  let price = "";
  const vm = await prisma.sku.findUnique({
    where: {
      id: vm_id,
    },
  });

  if (!vm) {
    throw new Error("VM not found");
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

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: price,
          quantity: 1,
        },
      ],
      customer_email: email,
      mode: "subscription",
      success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/api/checkout/cancel?session_id={CHECKOUT_SESSION_ID}&canceled=true`,
      automatic_tax: { enabled: true },
    });

    if (!session.url) {
      throw new Error("Session URL is not defined");
    }

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error(error);
    redirect("/error");
  }
}
