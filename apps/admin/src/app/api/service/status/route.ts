import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "database";
import { proxmoxClient } from "@/utils/proxmox/client";

export default async function POST(request: Request) {
  const proxmox = await proxmoxClient();

  const body = await request.json();
  const { serviceID } = body;

  if (!serviceID) {
    return NextResponse.json(
      { error: "service ID is required" },
      { status: 400 }
    );
  }

  const vm = await prisma.services.findFirst({
    where: {
      id: serviceID,
    },
  });
  if (!vm) {
    return NextResponse.json({ error: "VM not found" }, { status: 404 });
  }

  if (!vm.proxmox_vm_id) {
    return NextResponse.json(
      { error: "VM ID is not defined" },
      { status: 400 }
    );
  }
  if (!vm.proxmox_node) {
    return NextResponse.json({ error: "Node is not defined" }, { status: 400 });
  }

  const vmID = Number.parseInt(vm.proxmox_vm_id);
  const node = vm.proxmox_node;

  if (!vmID || !node) {
    return NextResponse.json(
      { error: "VM ID or node is not defined" },
      { status: 400 }
    );
  }
  const response = await proxmox.nodes.$(node).qemu.$(vmID).status.$get();

  console.log("Response from Proxmox:", response);

  revalidatePath(`/dashboard/vm/${vmID}`);
  revalidatePath("/dashboard/vm");

  return NextResponse.json(
    { message: "VM restarted successfully" },
    { status: 200 }
  );
}
