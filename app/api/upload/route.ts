import { NextRequest, NextResponse } from 'next/server';
import { parseFile } from '@/lib/server/file-parser';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
  maxDuration: 300, // 5 minutes for large file processing
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (500MB limit)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 400 }
      );
    }

    // Convert to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse the file
    const parsedFile = parseFile(buffer, file.name);

    // Return parsed data
    return NextResponse.json({
      success: true,
      file: {
        originalName: file.name,
        size: file.size,
        data: parsedFile.data,
        columnOrder: parsedFile.columnOrder,
        rowCount: parsedFile.rowCount,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
