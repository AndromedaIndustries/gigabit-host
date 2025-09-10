
import { UsersTable } from '@/components/admin/users/table';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';


export default async function Page() {
    const supabase = await createClient();

    const userResponse = await supabase.auth.getUser();

    const user = userResponse.data.user;

    if (user === null) {
        redirect("/login")
    }

    const supabaseAdmin = await createAdminClient()

    const users = await supabaseAdmin.auth.admin.listUsers()

    return (
        <div className="w-full pt-20 px-10 pb-24 ">
            <UsersTable users={users.data.users} />
        </div>
    )
}