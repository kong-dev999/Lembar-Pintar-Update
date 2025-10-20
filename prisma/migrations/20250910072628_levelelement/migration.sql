/*
  Warnings:

  - The values [STANDARD] on the enum `SubscriptionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `price` on the `Element` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Font` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `License` table. All the data in the column will be lost.
  - You are about to drop the column `premium` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Template` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PremiumLevel" AS ENUM ('FREE', 'PRO', 'PREMIUM');

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionType_new" AS ENUM ('FREE', 'PRO', 'PREMIUM');
ALTER TABLE "CustomerPayment" ALTER COLUMN "subscriptionType" DROP DEFAULT;
ALTER TABLE "CustomerPayment" ALTER COLUMN "subscriptionType" TYPE "SubscriptionType_new" USING ("subscriptionType"::text::"SubscriptionType_new");
ALTER TYPE "SubscriptionType" RENAME TO "SubscriptionType_old";
ALTER TYPE "SubscriptionType_new" RENAME TO "SubscriptionType";
DROP TYPE "SubscriptionType_old";
ALTER TABLE "CustomerPayment" ALTER COLUMN "subscriptionType" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "Element" DROP COLUMN "price",
ADD COLUMN     "premiumLevel" "PremiumLevel" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "Font" DROP COLUMN "price",
ADD COLUMN     "premiumLevel" "PremiumLevel" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "License" DROP COLUMN "price",
ADD COLUMN     "premiumLevel" "PremiumLevel" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "premiumLevel" "PremiumLevel" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "premium",
DROP COLUMN "price",
ADD COLUMN     "premiumLevel" "PremiumLevel" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "premiumLevel" "PremiumLevel" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "TemplatePreview" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "size" TEXT NOT NULL,

    CONSTRAINT "TemplatePreview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TemplatePreview" ADD CONSTRAINT "TemplatePreview_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePreview" ADD CONSTRAINT "TemplatePreview_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
