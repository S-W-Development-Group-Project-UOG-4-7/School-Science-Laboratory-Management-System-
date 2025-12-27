# Creating Database Tables for Student Dashboard

## Database Schema Overview

The complete schema includes all tables needed for the Student Dashboard features:

### Core Tables:

1. **User** - System users with roles (STUDENT, TEACHER, LAB_ASSISTANT, PRINCIPAL, ADMIN)
2. **Practical** - Lab practical sessions
3. **Note** - Study/lab notes (READ operation)
4. **ReportSubmission** - Student reports (CREATE, READ operations)
5. **Quiz** - Available quizzes (READ operation)
6. **QuizQuestion** - Quiz questions (READ operation)
7. **QuizAttempt** - Quiz attempts and scores (CREATE, READ operations)

### Supporting Tables:

8. **Attendance** - Student attendance tracking
9. **MaterialRequest** - Lab material requests

## Setup Instructions

### Option 1: Force Reset (Development - Loses All Data)

If you're in development and don't mind losing existing data:

```powershell
npx prisma db push --force-reset
npx prisma generate
```

### Option 2: Safe Migration (Preserves Data)

If you have existing data you want to keep:

1. **First, update existing User records:**
   ```sql
   -- Connect to PostgreSQL and run:
   ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" VARCHAR(20) DEFAULT 'STUDENT';
   ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
   ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
   ```

2. **Then apply the migration:**
   ```powershell
   npx prisma migrate dev --name init_student_dashboard
   ```

3. **Generate Prisma Client:**
   ```powershell
   npx prisma generate
   ```

### Option 3: Manual SQL Migration

If you prefer to run the SQL directly:

1. **Connect to your PostgreSQL database:**
   ```powershell
   psql -U postgres -d sciencemate
   ```

2. **Run the migration SQL file:**
   ```sql
   \i prisma/migrations/0001_init_student_dashboard/migration.sql
   ```

3. **Mark migration as applied:**
   ```powershell
   npx prisma migrate resolve --applied 0001_init_student_dashboard
   ```

4. **Generate Prisma Client:**
   ```powershell
   npx prisma generate
   ```

## Verify Tables Created

After running the migration, verify all tables exist:

```powershell
# Open Prisma Studio
npm run studio
```

Or check via SQL:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## Expected Tables:

- Attendance
- MaterialRequest
- Note
- Practical
- Quiz
- QuizAttempt
- QuizQuestion
- ReportSubmission
- User

## Table Relationships:

```
User
├── MaterialRequest (one-to-many)
├── Attendance (one-to-many)
├── ReportSubmission (one-to-many)
└── QuizAttempt (one-to-many)

Practical
├── Attendance (one-to-many)
├── MaterialRequest (one-to-many)
├── Note (one-to-many)
├── ReportSubmission (one-to-many)
└── Quiz (one-to-many)

Quiz
├── QuizQuestion (one-to-many)
└── QuizAttempt (one-to-many)
```

## Next Steps:

1. ✅ Create tables (run migration)
2. ✅ Generate Prisma Client
3. Seed sample data (optional)
4. Test the Student Dashboard features



