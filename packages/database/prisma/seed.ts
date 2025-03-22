import { type Prisma, PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

const skus: Prisma.skusCreateInput[] = [
  {
    name: "Shared 4th Gen AMD Small",
    sku: "s4ae-small",
    type: "Shared",
    category: "VM",
    description: "A perfect VM for small or persoanl projects.",
    price: 10,
    attributes: {
      cpu_mfg: "AMD",
      cpu_type: "EPYC",
      cpu_model: "9354P",
      cpu_assignment: "shared",
      cpu_generation: 4,
      cpu_cores: 2,
      memory: 2,
      storage_size: 50,
      storage_type: "NVMe",
      catagory: "s4ae",
      size: "large",
    },
    popular: false,
    available: false,
    quantity: 25,
  },
  {
    name: "Shared 4th Gen AMD Medium",
    sku: "s4ae-medium",
    type: "Shared",
    category: "VM",
    description: "Great for hosting multiple projects or a small business.",
    price: 40,
    attributes: {
      cpu_mfg: "AMD",
      cpu_type: "EPYC",
      cpu_model: "9354P",
      cpu_assignment: "shared",
      cpu_generation: 4,
      cpu_cores: 4,
      memory: 4,
      storage_size: 100,
      storage_type: "NVMe",
      catagory: "s4ae",
      size: "large",
    },
    popular: false,
    available: false,
    quantity: 25,
  },
  {
    name: "Shared 4th Gen AMD Large",
    sku: "s4ae-large",
    type: "Shared",
    category: "VM",
    description: "Great for those who need more oomph.",
    price: 80,
    attributes: {
      cpu_mfg: "AMD",
      cpu_type: "EPYC",
      cpu_model: "9354P",
      cpu_assignment: "shared",
      cpu_generation: 4,
      cpu_cores: 8,
      memory: 8,
      storage_size: 200,
      storage_type: "NVMe",
      catagory: "s4ae",
      size: "large",
    },
    popular: false,
    available: false,
    quantity: 20,
  },
  {
    name: "Shared 4th Gen AMD Extra Large",
    sku: "s4ae-xlarge",
    type: "Shared",
    category: "VM",
    description: "For those who need the most power.",
    price: 160,
    attributes: {
      cpu_mfg: "AMD",
      cpu_type: "EPYC",
      cpu_model: "9354P",
      cpu_assignment: "shared",
      cpu_generation: 4,
      cpu_cores: 16,
      memory: 16,
      storage_size: 400,
      storage_type: "NVMe",
      catagory: "s4ae",
      size: "large",
    },
    popular: false,
    available: false,
    quantity: 15,
  },
];

export async function main() {
  // Delete all existing data
  await prisma.skus.deleteMany();

  for (const sku of skus) {
    await prisma.skus.create({ data: sku });
  }
}

main();
