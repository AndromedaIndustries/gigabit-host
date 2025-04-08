import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/stripe";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get("session_id");
  const canceled = searchParams.get("canceled");

  if (!session_id) {
    return NextResponse.json(
      { error: "Please provide a valid session_id" },
      { status: 400 }
    );
  }

  // Retrieve the session from Stripe
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });

  const { status, customer_details } = session;
  const customerEmail = customer_details?.email;

  redirect(`/dashboard/vm/new?canceled=${canceled}`);
}
