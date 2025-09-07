import { UpdatePasswordForm } from '@/components/services/password/reset';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';


export default async function Page() {
    const supabase = await createClient();

    const userResponse = await supabase.auth.getUser();

    const user = userResponse.data.user;

    if (user === null) {
        redirect("/dashboard/login")
    }

    return (
        <div className="flex items-center justify-center h-screen bg-base-100">
            <UpdatePasswordForm />
        </div>
    )
}