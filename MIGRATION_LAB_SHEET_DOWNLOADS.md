# Lab Sheet Downloads Tracking - Migration Guide

## Overview
This update adds database tracking for lab sheet downloads. When students download lab sheets, the system now records:
- Which student downloaded the file
- Which practical the lab sheet belongs to
- The filename that was downloaded
- The timestamp of the download

## Database Migration

### Step 1: Generate Prisma Migration
Run the following command to create a migration for the new `LabSheetDownload` model:

```bash
npx prisma migrate dev --name add_lab_sheet_downloads
```

### Step 2: Generate Prisma Client
After the migration, regenerate the Prisma client:

```bash
npx prisma generate
```

## What Changed

### 1. Database Schema
- Added `LabSheetDownload` model to track downloads
- Added relations to `User` and `Practical` models

### 2. API Changes
- **`/api/download`**: Now accepts optional `studentId` and `practicalId` parameters to record downloads
- **`/api/lab-sheet-downloads`**: New endpoint to view download history
  - `GET /api/lab-sheet-downloads?studentId=1` - Get downloads for a specific student
  - `GET /api/lab-sheet-downloads?practicalId=1` - Get downloads for a specific practical
  - `GET /api/lab-sheet-downloads?studentId=1&practicalId=1` - Get downloads for a specific student and practical

### 3. Component Changes
- **`DownloadLabSheetButton`**: Now accepts optional `studentId` prop
- **`PracticalsPage`**: Now passes `userId` to `DownloadLabSheetButton` for tracking

## Usage

### Viewing Download History

#### For a specific student:
```typescript
const response = await fetch('/api/lab-sheet-downloads?studentId=1');
const data = await response.json();
// Returns all downloads by student with ID 1
```

#### For a specific practical:
```typescript
const response = await fetch('/api/lab-sheet-downloads?practicalId=1');
const data = await response.json();
// Returns all downloads for practical with ID 1
```

#### For a specific student and practical:
```typescript
const response = await fetch('/api/lab-sheet-downloads?studentId=1&practicalId=1');
const data = await response.json();
// Returns downloads by student 1 for practical 1
```

## Database Model

```prisma
model LabSheetDownload {
  id          Int      @id @default(autoincrement())
  studentId   Int
  practicalId Int
  filename    String   @db.VarChar(255)
  downloadedAt DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  student  User      @relation(fields: [studentId], references: [id], onDelete: Cascade)
  practical Practical @relation(fields: [practicalId], references: [id], onDelete: Cascade)

  @@index([studentId])
  @@index([practicalId])
  @@index([downloadedAt])
}
```

## Benefits

1. **Tracking**: Teachers and administrators can see which students have downloaded which lab sheets
2. **Analytics**: Track popular practicals and lab sheets
3. **Accountability**: Know when students accessed materials
4. **Audit Trail**: Complete history of all lab sheet downloads

## Notes

- Downloads are only recorded when `studentId` is provided
- If the database recording fails, the download still proceeds (non-blocking)
- All downloads are timestamped with `downloadedAt` field
- The system tracks the exact filename that was downloaded

