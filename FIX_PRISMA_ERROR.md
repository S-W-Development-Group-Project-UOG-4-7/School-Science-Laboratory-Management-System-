# How to Fix Prisma Client Error

## Problem
The Prisma Client hasn't been regenerated after schema changes, causing "Unable to run script" errors in Prisma Studio.

## Solution Steps

1. **Close Prisma Studio** (if open) - This is locking the query engine file

2. **Stop your Next.js development server** (if running) - Press `Ctrl+C` in the terminal where it's running

3. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Restart your development server:**
   ```bash
   npm run dev
   ```

5. **Reopen Prisma Studio** (if needed):
   ```bash
   npx prisma studio
   ```

## What Was Fixed

- ✅ Database schema updated with:
  - `UserStatus` enum (ONLINE, OFFLINE)
  - `status` field added to User model
  - `Session` model for login/logout tracking
  - `Attendance` model kept (was being removed incorrectly)

- ✅ Login API updated to work with new schema

## If Error Persists

If you still get file lock errors:
1. Close all terminals and applications
2. Wait 10 seconds
3. Try regenerating again: `npx prisma generate`
4. If still failing, restart your computer

The database is already updated correctly, so once you regenerate the Prisma Client, everything should work!



