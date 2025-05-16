import { NextResponse } from "next/server";
import { getStripe } from "@/utils/stripe/stripe";
import { redirect } from "next/navigation";
import { prisma } from "database";
import { UpdateService } from "@/utils/database/services/update";
import createTemporalClient from "@/utils/temporal/client";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get("session_id");

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
      { error: "Please provide a valid session_id (`cs_test_...`)" },
      { status: 400 }
    );
  }

  const stripe = getStripe();

  // Retrieve the session from Stripe
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });

  const { status, subscription } = session;

  const newService = await prisma.services.findFirst({
    where: {
      initial_checkout_id: session.id,
    },
  });

  if (!newService) {
    return NextResponse.json({ error: "No service found" });
  }

  if (!subscription) {
    return NextResponse.json({ error: "No subscription found" });
  }

  if (status === "open") {
    newService.status = "pending";
    newService.status_reason = "Payment pending";
  }

  if (status === "complete") {
    newService.subscription_active = true;
    newService.status = "active";
    newService.status_reason = `Payment processed successfully - Subscription ${subscription.toString()} created`;
    newService.subscription_id = subscription.toString();
  }

  const updated_service = UpdateService(newService);
  const temporal_client = await createTemporalClient();

  const data = {
    user_id: newService.user_id,
    service_id: newService.id,
    token: supabaseSessionData.data.session.access_token,
  };

  const temporal_workflow = await temporal_client.workflow.start(
    "NewProxmoxVM",
    {
      args: [data],
      taskQueue: "proxmox",
      workflowId: `new_service_${newService.id}`,
    }
  );

  if (!temporal_workflow.workflowId) {
    return NextResponse.json({ error: "Workflow failed to start" });
  }

  if (!updated_service) {
    return NextResponse.json({ error: "Service failed to update" });
  }

  if (status === "complete") {
    redirect("/dashboard/vm");
  }

  return NextResponse.json({ error: "Unhandled session status" });
}
