-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'LAB_ASSISTANT', 'PRINCIPAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- CreateEnum
CREATE TYPE "MaterialRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED');

-- CreateEnum
CREATE TYPE "CorrectAnswer" AS ENUM ('A', 'B', 'C', 'D');

-- AlterTable: Add new columns to User table with defaults
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'STUDENT';
ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable: Practical
CREATE TABLE "Practical" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "subject" VARCHAR(100) NOT NULL,
    "lab" VARCHAR(100) NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Practical_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Attendance
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "practicalId" INTEGER NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MaterialRequest
CREATE TABLE "MaterialRequest" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "practicalId" INTEGER NOT NULL,
    "itemName" VARCHAR(200) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "MaterialRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Note
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "practicalId" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "fileUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ReportSubmission
CREATE TABLE "ReportSubmission" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "practicalId" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "grade" DOUBLE PRECISION,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Quiz
CREATE TABLE "Quiz" (
    "id" SERIAL NOT NULL,
    "practicalId" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "totalMarks" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable: QuizQuestion
CREATE TABLE "QuizQuestion" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "optionA" VARCHAR(200) NOT NULL,
    "optionB" VARCHAR(200) NOT NULL,
    "optionC" VARCHAR(200) NOT NULL,
    "optionD" VARCHAR(200) NOT NULL,
    "correctAnswer" "CorrectAnswer" NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable: QuizAttempt
CREATE TABLE "QuizAttempt" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "answers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attendance_studentId_idx" ON "Attendance"("studentId");

-- CreateIndex
CREATE INDEX "Attendance_practicalId_idx" ON "Attendance"("practicalId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_practicalId_key" ON "Attendance"("studentId", "practicalId");

-- CreateIndex
CREATE INDEX "MaterialRequest_studentId_idx" ON "MaterialRequest"("studentId");

-- CreateIndex
CREATE INDEX "MaterialRequest_practicalId_idx" ON "MaterialRequest"("practicalId");

-- CreateIndex
CREATE INDEX "Note_practicalId_idx" ON "Note"("practicalId");

-- CreateIndex
CREATE INDEX "ReportSubmission_studentId_idx" ON "ReportSubmission"("studentId");

-- CreateIndex
CREATE INDEX "ReportSubmission_practicalId_idx" ON "ReportSubmission"("practicalId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportSubmission_studentId_practicalId_key" ON "ReportSubmission"("studentId", "practicalId");

-- CreateIndex
CREATE INDEX "Quiz_practicalId_idx" ON "Quiz"("practicalId");

-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_idx" ON "QuizQuestion"("quizId");

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "QuizAttempt_studentId_idx" ON "QuizAttempt"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAttempt_quizId_studentId_key" ON "QuizAttempt"("quizId", "studentId");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_practicalId_fkey" FOREIGN KEY ("practicalId") REFERENCES "Practical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequest" ADD CONSTRAINT "MaterialRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequest" ADD CONSTRAINT "MaterialRequest_practicalId_fkey" FOREIGN KEY ("practicalId") REFERENCES "Practical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_practicalId_fkey" FOREIGN KEY ("practicalId") REFERENCES "Practical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSubmission" ADD CONSTRAINT "ReportSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSubmission" ADD CONSTRAINT "ReportSubmission_practicalId_fkey" FOREIGN KEY ("practicalId") REFERENCES "Practical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_practicalId_fkey" FOREIGN KEY ("practicalId") REFERENCES "Practical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;



