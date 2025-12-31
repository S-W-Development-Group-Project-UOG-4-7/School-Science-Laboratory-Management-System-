# Download Lab Sheet Component - Usage Guide

## Overview
The `DownloadLabSheetButton` component fetches the lab sheet filename from the database and downloads the PDF file directly in the browser.

## Files Created

1. **`/src/app/api/download/route.ts`** - API route that handles PDF file downloads
2. **`/src/app/components/DownloadLabSheetButton.tsx`** - Reusable button component

## How It Works

1. **User clicks the button** → Component fetches practical data from database
2. **Extracts filename** → Gets the lab sheet filename from the practical record
3. **Calls download API** → Makes request to `/api/download?filename=FILENAME`
4. **Downloads file** → PDF is downloaded directly in the browser

## Usage Example

### Basic Usage
```tsx
import { DownloadLabSheetButton } from '@/components/DownloadLabSheetButton';

<DownloadLabSheetButton
  practicalId={1}
/>
```

### With Custom Props
```tsx
<DownloadLabSheetButton
  practicalId={practical.id}
  buttonText="Download Lab Sheet"
  variant="outline"
  size="sm"
  className="hover:bg-blue-50 hover:border-blue-300"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `practicalId` | `number` | Required | The ID of the practical to download lab sheet for |
| `buttonText` | `string` | `'Download Lab Sheet'` | Text to display on the button |
| `variant` | `'default' \| 'outline' \| 'ghost'` | `'outline'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Button size |
| `className` | `string` | `''` | Additional CSS classes |

## Database Schema

The component expects the practical to have a `labSheetUrl` field in the database. If this field doesn't exist, you can:

1. **Add it to your Prisma schema:**
```prisma
model Practical {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(200)
  subject   String   @db.VarChar(100)
  lab       String   @db.VarChar(100)
  labSheetUrl String? @db.VarChar(255)  // Add this field
  dateTime  DateTime
  // ... other fields
}
```

2. **Run migration:**
```bash
npx prisma migrate dev --name add_lab_sheet_url
npx prisma generate
```

3. **Update your database** with lab sheet filenames for each practical.

## API Routes

### GET `/api/download?filename=FILENAME`
Downloads a PDF file from `/public/lab-sheets/` directory.

**Parameters:**
- `filename` (required): Name of the PDF file to download

**Example:**
```
GET /api/download?filename=Grade_11_Acid_Base_Titration_Lab_Sheet.pdf
```

### GET `/api/practicals?id=PRACTICAL_ID`
Fetches a single practical by ID (now supports both single and multiple practicals).

**Parameters:**
- `id` (optional): Practical ID to fetch a single record
- `subject` (optional): Filter by subject
- `lab` (optional): Filter by lab

**Example:**
```
GET /api/practicals?id=1
```

## File Structure

```
/public/
  └── lab-sheets/
      └── Grade_11_Acid_Base_Titration_Lab_Sheet.pdf
      └── (other PDF files...)
```

## Features

- ✅ Fetches filename from database
- ✅ Automatic file download in browser
- ✅ Loading state with spinner
- ✅ Error handling with toast notifications
- ✅ File path sanitization (prevents directory traversal)
- ✅ Type-safe with TypeScript

## Notes

- The component will automatically show a loading state while fetching/downloading
- If the file is not found, a user-friendly error message is displayed
- The filename is sanitized to prevent security issues (directory traversal)
- Make sure PDF files exist in `/public/lab-sheets/` directory


