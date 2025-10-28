-- CreateEnum
CREATE TYPE "StatusFlags" AS ENUM ('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'MAINTAINED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CollabModes" AS ENUM ('SOLO', 'GROUP');

-- CreateEnum
CREATE TYPE "AffiliationTypes" AS ENUM ('INDEPENDENT', 'UNIVERSITY', 'ORGANIZATION', 'CLUB');

-- CreateEnum
CREATE TYPE "SourceCodeAvailibility" AS ENUM ('OPEN_SOURCE', 'CLOSED_SOURCE', 'UNDER_NDA');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "longDesc" TEXT,
    "statusFlag" "StatusFlags" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "collabMode" "CollabModes" NOT NULL,
    "affiliation" TEXT NOT NULL,
    "affiliationType" "AffiliationTypes" NOT NULL,
    "sourceCodeAvailibility" "SourceCodeAvailibility" NOT NULL,
    "techStacks" TEXT NOT NULL,
    "projectUrl" TEXT,
    "liveUrl" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
