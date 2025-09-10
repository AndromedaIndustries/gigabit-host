import { ServicesTable } from '@/components/admin/services/table';
import { createClient } from '@/utils/supabase/server';
import { prisma } from 'database';
import { redirect } from 'next/navigation';


export default async function Page() {
    const supabase = await createClient();

    const userResponse = await supabase.auth.getUser();

    const user = userResponse.data.user;

    if (user === null) {
        redirect("/login")
    }

    const services = await prisma.services.findMany({
        where: {
            service_active: true
        }
    });

    return (
        <div className="w-full pt-20 px-10 pb-24 ">
            <ServicesTable services={services} />
        </div >
    )
}