/*
  Warnings:

  - Added the required column `description` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "description" TEXT NOT NULL;
