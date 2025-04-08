import { type Prisma, PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

const skus: Prisma.SkuCreateInput[] = [
  {
    name: "Shared 4th Gen AMD Small",
    sku: "s4ae-small",
    stripe_personal_sku: "price_1RBNGBClZbs5CDDAPAKdBM81", // Test SKU
    stripe_business_sku: "price_1R7LiaClZbs5CDDAVk7OI9s1", // Test SKU
    type: "Shared",
    category: "virtual_machine",
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
    stripe_personal_sku: "price_1RBNI1ClZbs5CDDADiexFBTN", // Test SKU
    stripe_business_sku: "price_1R7Lk7ClZbs5CDDAalmS9XMe", // Test SKU
    type: "Shared",
    category: "virtual_machine",
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
    stripe_personal_sku: "price_1RBNIXClZbs5CDDAo4NUmeO0", // Test SKU
    stripe_business_sku: "price_1R7LkJClZbs5CDDAecL3u8nm", // Test SKU
    type: "Shared",
    category: "virtual_machine",
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
    stripe_personal_sku: "price_1RBNJSClZbs5CDDAKuX6xmEt", // Test SKU
    stripe_business_sku: "price_1R7LkUClZbs5CDDA9thUBOaJ", // Test SKU
    type: "Shared",
    category: "virtual_machine",
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
  await prisma.sku.deleteMany();

  for (const sku of skus) {
    await prisma.sku.create({ data: sku });
  }
}

main();
