import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/stripe";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get("session_id");

  if (!session_id) {
    return NextResponse.json(
      { error: "Please provide a valid session_id (`cs_test_...`)" },
      { status: 400 }
    );
  }

  // Retrieve the session from Stripe
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });

  const { status, customer_details } = session;

  if (status === "open") {
    redirect("/dashboard/vm");
  }

  if (status === "complete") {
    redirect("/dashboard/vm");
  }

  return NextResponse.json({ error: "Unhandled session status" });
}
