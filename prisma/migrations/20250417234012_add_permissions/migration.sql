-- AlterTable
ALTER TABLE "UserAccount" ADD COLUMN     "canConfigureBot" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserRepository" ADD COLUMN     "canConfigureBot" BOOLEAN NOT NULL DEFAULT false;
