import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
        }

        // Sanitize filename to prevent directory traversal
        const safeFilename = path.basename(filename);
        const filePath = path.join(process.cwd(), 'public', 'lab-sheets', safeFilename);

        // Debug logging
        console.log('Download request - Filename:', safeFilename);
        console.log('Download request - File path:', filePath);
        console.log('Download request - File exists:', fs.existsSync(filePath));

        if (!fs.existsSync(filePath)) {
            // List available files for debugging
            const labSheetsDir = path.join(process.cwd(), 'public', 'lab-sheets');
            let availableFiles: string[] = [];
            try {
                if (fs.existsSync(labSheetsDir)) {
                    availableFiles = fs.readdirSync(labSheetsDir);
                }
            } catch (e) {
                console.error('Error reading lab-sheets directory:', e);
            }

            return NextResponse.json(
                { 
                    error: 'File not found',
                    requestedFile: safeFilename,
                    availableFiles: availableFiles.length > 0 ? availableFiles : undefined,
                    filePath: filePath
                }, 
                { status: 404 }
            );
        }

        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${safeFilename}"`,
            },
        });
    } catch (error: any) {
        console.error('Download error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

