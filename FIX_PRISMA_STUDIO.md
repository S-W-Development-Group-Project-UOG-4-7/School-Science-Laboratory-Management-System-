# Fix Prisma Studio "Unable to run script" Error

## Quick Fix Steps:

### 1. Close Prisma Studio
- Close the Prisma Studio window/browser tab
- Make sure no Prisma processes are running

### 2. Verify .env file exists
Make sure you have a `.env` file in the project root with:
```
DATABASE_URL="postgresql://postgres:Matheesha%409%23@localhost:5432/sciencemate?schema=public"
```

### 3. Regenerate Prisma Client
```powershell
npx prisma generate
```

### 4. Restart Prisma Studio
```powershell
npm run studio
```

## Alternative Solutions:

### If file lock error persists:

**Option A: Restart your terminal/IDE**
- Close all terminals
- Restart VS Code/Cursor
- Try again

**Option B: Delete and regenerate Prisma Client**
```powershell
# Delete generated Prisma client
Remove-Item -Recurse -Force src\generated\prisma

# Regenerate
npx prisma generate
```

**Option C: Check database connection**
```powershell
# Test database connection
npm run test-prisma
```

### If database connection fails:

1. **Verify PostgreSQL is running:**
   - Check if PostgreSQL service is running
   - Default port: 5432

2. **Verify database exists:**
   ```sql
   -- Connect to PostgreSQL and run:
   SELECT datname FROM pg_database WHERE datname = 'sciencemate';
   ```

3. **Create database if missing:**
   ```sql
   CREATE DATABASE sciencemate;
   ```

4. **Run migrations:**
   ```powershell
   npx prisma migrate dev
   ```

## Common Causes:

1. ✅ **File Lock**: Prisma Studio or another process is using the files
2. ✅ **Missing .env**: DATABASE_URL not set
3. ✅ **Outdated Client**: Prisma Client not generated or outdated
4. ✅ **Database Connection**: PostgreSQL not running or wrong credentials

## Verify Everything Works:

```powershell
# 1. Test database connection
npm run test-prisma

# 2. Generate Prisma Client
npx prisma generate

# 3. Open Prisma Studio
npm run studio
```



