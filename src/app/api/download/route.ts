import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const filename = searchParams.get('filename');
        const studentId = searchParams.get('studentId');
        const practicalId = searchParams.get('practicalId');

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

        // Record download in database if studentId and practicalId are provided
        if (studentId && practicalId) {
            try {
                const parsedStudentId = parseInt(studentId);
                const parsedPracticalId = parseInt(practicalId);
                
                if (!isNaN(parsedStudentId) && !isNaN(parsedPracticalId)) {
                    await prisma.labSheetDownload.create({
                        data: {
                            studentId: parsedStudentId,
                            practicalId: parsedPracticalId,
                            filename: safeFilename,
                        },
                    });
                    console.log(`Download recorded: Student ${parsedStudentId} downloaded ${safeFilename} for practical ${parsedPracticalId}`);
                }
            } catch (dbError: any) {
                // Log error but don't fail the download if database recording fails
                console.error('Error recording download in database:', dbError);
            }
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

