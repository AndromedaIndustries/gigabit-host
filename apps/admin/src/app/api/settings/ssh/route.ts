"use server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const userObject = await supabase.auth.getUser();
  const user_id = userObject.data.user?.id;

  if (!user_id) {
    return NextResponse.json(
      { error: "We're sorry the server fell over" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { public_key, name } = body;

    if (!public_key) {
      return NextResponse.json(
        { error: "SSH key is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const add_key = await prisma.ssh_keys.create({
      data: {
        user_id: user_id,
        name: name,
        public_key: public_key,
        avaliable: true,
      },
    });

    if (!add_key) {
      return NextResponse.json(
        { error: "Failed to add SSH key" },
        { status: 500 }
      );
    }

    revalidatePath("/dashboard/vm/new");
    return NextResponse.json(
      { message: "SSH key added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding SSH key:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = await createClient();
  const userObject = await supabase.auth.getUser();

  if (!userObject) {
    return NextResponse.redirect("/dashboard/login");
  }

  const ssh_keys = await prisma.ssh_keys.findMany({
    where: {
      user_id: userObject.data.user?.id,
    },
  });

  return NextResponse.json(ssh_keys);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const userObject = await supabase.auth.getUser();

  if (!userObject) {
    return NextResponse.redirect("/dashboard/login");
  }
  try {
    const body = await request.json();
    const { ssh_key_id } = body;

    if (!ssh_key_id) {
      return NextResponse.json(
        { error: "SSH key id is required" },
        { status: 400 }
      );
    }

    const ssh_key = await prisma.ssh_keys.findFirst({
      where: {
        id: ssh_key_id,
      }
    })

    if ((!ssh_key) || (ssh_key?.user_id != userObject.data.user?.id)) {
      return NextResponse.json(
        { error: "SSH key doesn't exist or not owned by requesting user" },
        { status: 400 }
      );
    }

    const ssh_key_delete_reply = await prisma.ssh_keys.delete({
      where: {
        user_id: userObject.data.user?.id,
        id: ssh_key_id
      }
    })

    if (!ssh_key_delete_reply) {
      return NextResponse.json(
        { error: "Failed to delete ssh key" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "SSH key deleted successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error deleting SSH key:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
