import { NextResponse } from "next/server";
import { getStripe } from "@/utils/stripe/stripe";
import { redirect } from "next/navigation";
import { prisma } from "database";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get("session_id");
  const canceled = searchParams.get("canceled");

  const authClient = await createClient();
  const supabaseSessionData = await authClient.auth.getSession();
  if (supabaseSessionData.error) {
    return NextResponse.json({ error: supabaseSessionData.error });
  }
  if (!supabaseSessionData.data.session) {
    return NextResponse.json({ error: "No session found" });
  }

  if (!session_id) {
    return NextResponse.json(
      { error: "Please provide a valid session_id" },
      { status: 400 }
    );
  }

  const stripe = getStripe();

  // Retrieve the session from Stripe
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });

  const { status } = session;

  if (!status) {
    return NextResponse.json({ error: "No status found" });
  }

  const service = await prisma.services.findFirst({
    where: {
      initial_checkout_id: session_id,
    },
  });

  if (service) {
    const vm_id = service?.id;

    await prisma.services.update({
      where: {
        id: service.id,
      },
      data: {
        subscription_active: false
      }
    });

    await prisma.audit_Log.create({
      data: {
        user_id: supabaseSessionData.data.session.user.id,
        action: "checkout_session_canceled",
        description: `User cancled new service to be provisioned: serviceId: ${vm_id}`,
      },
    });

  }


  redirect(`/dashboard/vm/new?canceled=${canceled}`);
}
