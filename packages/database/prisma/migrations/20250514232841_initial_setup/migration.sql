-- CreateTable
CREATE TABLE "Permission" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ssh_keys" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "public_key" TEXT NOT NULL,
    "avaliable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "Ssh_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),
    "metadata" JSON NOT NULL DEFAULT '{}',
    "service_ids" VARCHAR(255)[],
    "user_ids" UUID[],

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProxmoxNode" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "vm_ids" VARCHAR(255)[],

    CONSTRAINT "ProxmoxNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProxmoxTemplates" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "version" VARCHAR(255) NOT NULL,
    "proxmox_node" VARCHAR(255) NOT NULL,
    "proxmox_vm_id" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),
    "metadata" JSON NOT NULL DEFAULT '{}',

    CONSTRAINT "ProxmoxTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sku" (
    "id" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(255) NOT NULL,
    "stripe_personal_sku" VARCHAR(255) NOT NULL,
    "stripe_business_sku" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sku_type" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "price" REAL NOT NULL,
    "attributes" JSON NOT NULL DEFAULT '{}',
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Sku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Services" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" UUID NOT NULL,
    "service_type" VARCHAR(255) NOT NULL,
    "hostname" VARCHAR(255) NOT NULL,
    "template_id" VARCHAR(255) NOT NULL,
    "os_name" VARCHAR(255) NOT NULL,
    "os_version" VARCHAR(255) NOT NULL,
    "public_key_id" TEXT NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "metadata" JSON NOT NULL DEFAULT '{}',
    "sku_id" VARCHAR(255) NOT NULL,
    "current_sku_id" VARCHAR(255) NOT NULL,
    "initial_sku_id" VARCHAR(255) NOT NULL,
    "subscription_active" BOOLEAN NOT NULL DEFAULT false,
    "subscription_id" VARCHAR(255),
    "initial_checkout_id" VARCHAR(255),
    "status" VARCHAR(255) NOT NULL,
    "status_reason" TEXT,
    "payment_ids" VARCHAR(255)[],
    "payment_status" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),
    "accountId" VARCHAR(255),
    "proxmox_node" VARCHAR(255),
    "proxmox_vm_id" VARCHAR(255),

    CONSTRAINT "Services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Sku_sku_key" ON "Sku"("sku");
