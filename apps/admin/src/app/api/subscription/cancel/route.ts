import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/stripe";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import { revalidatePath } from "next/cache";
import { UpdateService } from "@/utils/database/services/update";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const vm_id = searchParams.get("vm_id");

  if (!vm_id) {
    return NextResponse.json(
      { error: "Please provide a valid vm_id" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const userObject = await supabase.auth.getUser();
  const user_id = userObject.data.user?.id;
  const vm = await prisma.services.findFirst({
    where: {
      user_id: user_id,
      id: vm_id,
    },
  });

  if (!vm) {
    return NextResponse.json({ error: "No VM found" });
  }

  const id = vm.subscription_id;

  const subscription = await stripe.subscriptions.update(`${id}`, {
    cancel_at_period_end: true,
  });

  if (!subscription) {
    return NextResponse.json({ error: "No subscription found" });
  }

  vm.subscription_active = false;
  vm.status = "canceled";
  vm.status_reason = "Subscription canceled by user";
  vm.subscription_id = null;

  const updated_service = UpdateService(vm);

  if (!updated_service) {
    return NextResponse.json({ error: "Service failed to update" });
  }

  revalidatePath(`/dashboard/vm/${vm.id}`);
  redirect(`/dashboard/vm/${vm.id}`);
}
