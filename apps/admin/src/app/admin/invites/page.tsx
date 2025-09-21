import { InvitesTable } from '@/components/admin/invites/table';
import { prisma } from 'database';


export default async function Page() {

    const userInviteRequests = await prisma.inviteRequest.findMany()

    return (
        <div className="w-full pt-20 px-10 pb-24 ">
            <InvitesTable invites={userInviteRequests} />
        </div>
    )
}

