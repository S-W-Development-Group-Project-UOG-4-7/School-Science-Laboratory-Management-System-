-- Create LabSheetDownload table
CREATE TABLE IF NOT EXISTS "LabSheetDownload" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "practicalId" INTEGER NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabSheetDownload_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "LabSheetDownload_studentId_idx" ON "LabSheetDownload"("studentId");
CREATE INDEX IF NOT EXISTS "LabSheetDownload_practicalId_idx" ON "LabSheetDownload"("practicalId");
CREATE INDEX IF NOT EXISTS "LabSheetDownload_downloadedAt_idx" ON "LabSheetDownload"("downloadedAt");

-- Add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'LabSheetDownload_studentId_fkey'
    ) THEN
        ALTER TABLE "LabSheetDownload" 
        ADD CONSTRAINT "LabSheetDownload_studentId_fkey" 
        FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'LabSheetDownload_practicalId_fkey'
    ) THEN
        ALTER TABLE "LabSheetDownload" 
        ADD CONSTRAINT "LabSheetDownload_practicalId_fkey" 
        FOREIGN KEY ("practicalId") REFERENCES "Practical"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

