/*
  Warnings:

  - You are about to drop the column `dueDayOfMonth` on the `RecurringPlan` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `RecurringPlan` table. All the data in the column will be lost.
  - Added the required column `anchorDate` to the `RecurringPlan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlanFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "RecurringPlan" DROP COLUMN "dueDayOfMonth",
DROP COLUMN "startDate",
ADD COLUMN     "anchorDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "frequency" "PlanFrequency" NOT NULL DEFAULT 'MONTHLY';
