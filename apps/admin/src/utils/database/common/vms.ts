import { Services, prisma } from "database";


export async function GetCustomerActiveVMs(user_id: string): Promise<Services[]> {

    return await prisma.services.findMany({
        where: {
            user_id: user_id,
            OR: [
                { service_active: true },
                { subscription_active: true },
            ],
        },
    })

}