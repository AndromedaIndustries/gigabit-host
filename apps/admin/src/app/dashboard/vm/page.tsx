import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import Link from "next/link"

export default async function VMs() {
    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user_id = userObject.data.user?.id;

    const vms = await prisma.services.findMany({
        where: {
            user_id: user_id,
        },
    });
    return (
        <div className="w-full h-fit pb-24">
            <div className="flex flex-row flex-wrap space-x-5 space-y-5">
                <div className="card card-border bg-base-300 w-64 h-64">
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <Link href={"/dashboard/vm/new"} className="btn btn-outline btn-primary place-self-center">
                            Add new VM
                        </Link>
                    </div>
                </div>

                {vms.length === 0 ? null : (
                    <div>
                        {vms.map((vm) => (
                            <div className="card card-border bg-base-300 w-64 h-64" key={vm.id}>
                                <div className="card-body items-center text-center">
                                    <h2 className="card-title">{vm.hostname}</h2>
                                    <p>""</p>
                                    <div className="card-actions justify-end">
                                        <button type="button" className="btn btn-primary">manage</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}