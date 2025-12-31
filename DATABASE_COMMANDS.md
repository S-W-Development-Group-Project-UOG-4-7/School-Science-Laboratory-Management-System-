# Database Commands & Setup Guide

## Database Connection
- **Database**: PostgreSQL
- **Connection String**: `postgresql://postgres:Matheesha%409%23@localhost:5432/sciencemate?schema=public`
- **Prisma Client**: Generated at `src/generated/prisma`

## Common Prisma Commands

### 1. Generate Prisma Client
```bash
npx prisma generate
```
Generates the Prisma Client based on your schema.

### 2. Create Database Migration
```bash
npx prisma migrate dev --name init
```
Creates a new migration and applies it to your database.

### 3. Apply Migrations
```bash
npx prisma migrate deploy
```
Applies pending migrations to the database (production).

### 4. Reset Database
```bash
npx prisma migrate reset
```
⚠️ **Warning**: This will delete all data and recreate the database.

### 5. View Database in Prisma Studio
```bash
npm run studio
```
Opens Prisma Studio GUI to view and edit your database.

### 6. Format Prisma Schema
```bash
npx prisma format
```
Formats your `schema.prisma` file.

### 7. Validate Schema
```bash
npx prisma validate
```
Validates your Prisma schema.

## Database Schema Overview

### Models:
1. **User** - System users (students, teachers, admins)
2. **Practical** - Lab practical sessions
3. **Attendance** - Student attendance records
4. **MaterialRequest** - Lab material requests
5. **Note** - Study/lab notes
6. **ReportSubmission** - Student report submissions
7. **Quiz** - Quizzes for practicals
8. **QuizQuestion** - Quiz questions
9. **QuizAttempt** - Student quiz attempts

### Key Relationships:
- User → MaterialRequests, Attendances, ReportSubmissions, QuizAttempts
- Practical → Notes, Quizzes, ReportSubmissions, Attendances, MaterialRequests
- Quiz → QuizQuestions, QuizAttempts

## Environment Setup

Make sure you have a `.env` file (or `.env.local`) with:
```
DATABASE_URL="postgresql://postgres:Matheesha%409%23@localhost:5432/sciencemate?schema=public"
```

## Testing Database Connection

Run the test script:
```bash
npm run test-prisma
```

Or use:
```bash
node src/app/test-prisma.cjs
```

## Quick Start

1. **Ensure PostgreSQL is running**
2. **Set DATABASE_URL in .env**
3. **Generate Prisma Client**: `npx prisma generate`
4. **Run migrations**: `npx prisma migrate dev`
5. **Open Prisma Studio**: `npm run studio`

## Database Status

To check if your database is properly set up:
- Check PostgreSQL is running on port 5432
- Verify database `sciencemate` exists
- Run `npx prisma db pull` to sync schema from database
- Run `npx prisma studio` to view data





