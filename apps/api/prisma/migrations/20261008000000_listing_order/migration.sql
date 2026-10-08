-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application"("createdAt");

-- CreateIndex
CREATE INDEX "Project_applicationId_createdAt_idx" ON "Project"("applicationId", "createdAt");
