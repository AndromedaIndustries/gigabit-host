import { NextResponse } from "next/server";
import { getStripe } from "@/utils/stripe/stripe";
import { redirect } from "next/navigation";
import { Sku, prisma } from "database";
import { UpdateService } from "@/utils/database/services/update";
import createTemporalClient from "@/utils/temporal/client";
import { createClient } from "@/utils/supabase/server";
import { Invite_Type, userMetadata } from "@/types/userMetadata";
import { faSkull } from "@fortawesome/free-solid-svg-icons";

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

  const userMetadata = supabaseSessionData.data.session.user.user_metadata as userMetadata

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

  await prisma.billing_Log.create({
    data: {
      user_id: supabaseSessionData.data.session.user.id,
      payment_id: session.id,
      service_id: newService.id,
      status: status === "complete" ? "success" : "pending",
      subscription_id: subscription ? subscription.toString() : null,
    },
  });


  if (status === "open") {
    newService.status = "pending";
    newService.service_active = false;
    newService.status_reason = "Payment pending";
  }

  if (status === "complete") {
    newService.subscription_active = true;
    newService.status = "active";
    newService.service_active = false;
    newService.status_reason = `Payment processed successfully - Subscription ${subscription.toString()} created`;
    newService.subscription_id = subscription.toString();
  }

  const updated_service = UpdateService(newService);
  const temporal_client = await createTemporalClient();

  const data = {
    user_id: newService.user_id,
    service_id: newService.id,
  };

  await prisma.audit_Log.create({
    data: {
      user_id: newService.user_id,
      action: "new_service",
      description: `New service created with ID ${newService.id} and status ${newService.status}`,
    },
  });

  if (!temporal_client) {
    return NextResponse.json({ error: "Failed to create client" });
  }

  const temporal_workflow = await temporal_client.workflow.start(
    "New VM Workflow",
    {
      args: [data],
      taskQueue: "proxmox",
      workflowId: `new_service_${newService.id}`,
    }
  );


  const sku = await prisma.sku.findUnique({
    where: {
      sku: newService.current_sku_id
    },
  })

  if (sku) {
    const currentInventory = sku.quantity
    const expectedInventory = currentInventory - 1

    const updatedSku = await prisma.sku.update({
      where: {
        sku: newService.current_sku_id,
      },
      data: {
        quantity: expectedInventory
      },
    })

    if (userMetadata.invite_type == Invite_Type.User) {
      const invite_mapping = await prisma.invitedUserMapping.findUnique({
        where: {
          invitedUserId: supabaseSessionData.data.session.user.id,
        }
      })

      if (invite_mapping && !invite_mapping.creditApplied) {
        const invitingUser = invite_mapping.invitingUserId

        const invitingUserMapping = await prisma.third_Party_User_Mapping.findUnique({
          where: {
            id: invitingUser
          }
        })

        if (invitingUserMapping && sku.inviteCreditEligible) {
          const invitingCredit = sku.inviteCreditAmmount * -100

          await stripe.customers.createBalanceTransaction(
            invitingUserMapping.stripe_customer_id,
            {
              amount: invitingCredit,
              currency: 'usd',
            }
          );

          // 
          await prisma.invitedUserMapping.update({
            where: {
              invitedUserId: invite_mapping.invitedUserId
            },
            data: {
              creditApplied: true,
              creditAmmount: sku.inviteCreditAmmount
            }
          })
        }
      }
    }
  }

  await prisma.audit_Log.create({
    data: {
      user_id: supabaseSessionData.data.session.user.id,
      action: "checkout_session_completed",
      description: `User completed new service checkout: ${newService.id}`,
    },
  });

  if (!temporal_workflow.workflowId) {
    return NextResponse.json({ error: "Create Service Workflow failed to start" });
  }

  if (!updated_service) {
    return NextResponse.json({ error: "Service failed to update" });
  }

  if (status === "complete") {
    redirect("/dashboard/vm");
  }

  return NextResponse.json({ error: "Unhandled session status" });
}
