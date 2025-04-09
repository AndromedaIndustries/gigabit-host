import { prisma, type Services } from "database";

export async function UpdateService(newService: Services) {
  const { metadata, ...newServiceData } = newService;

  const updated_service = await prisma.services.update({
    where: {
      id: newService.id,
    },
    data: {
      ...newServiceData,
      metadata: JSON.stringify(metadata),
    },
  });

  if (!updated_service) {
    return false;
  }

  return true;
}
