import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function Dashboard() {
    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user = userObject.data.user || null;

    const roles = await prisma.role.findMany()

    if (user == null) {
        redirect("/dashboard/login")
    }

    const userPermissions = await prisma.permissions.findMany({
        where: {
            userId: user.id
        }
    })

    async function submit(formData: FormData) {
        "use server";

        if (user == null) {
            return
        }

        const role_id = formData.get("role_id")

        const role = roles.find((roleFind) => roleFind.id == role_id)

        if (!role) {
            return
        }

        await prisma.permissions.create({
            data: {
                userId: user.id,
                roleId: role.id,
            }
        })

        revalidatePath("/admin")
    }


    return (
        <div className="grid grid-cols-4 gap-5 pt-20 px-10 pb-24">
            <div>
                <div>Current Roles:</div>
                <div>
                    <ol>
                        {userPermissions.map((permission, id) => {
                            return <li key={id}> {(roles.find((roleFind) => roleFind.id == permission.roleId))?.name} </li>
                        })}
                    </ol>
                </div>
            </div>
            <form action={submit}>
                <label htmlFor="os_id" className="fieldset-label">Role</label>
                <select id="role_id" name="role_id" className="select select-bordered w-full">
                    <option disabled>Select Role</option>
                    {roles.map((role, int) => {
                        return <option key={int} value={role.id}>{role.name}</option>
                    })}
                </select>

                <button className="btn btn-success">Submit</button>
            </form>
        </div >
    );
}
