import { prisma, type Services } from "database";

export async function UpdateService(newService: Services) {
  let metadata = newService.metadata;
  if (!metadata) {
    metadata = {};
  }

  const { ...newServiceData } = newService;

  const updated_service = await prisma.services.update({
    where: {
      id: newService.id,
    },
    data: {
      ...newServiceData,
      metadata: metadata,
    },
  });

  if (!updated_service) {
    return false;
  }

  return true;
}
