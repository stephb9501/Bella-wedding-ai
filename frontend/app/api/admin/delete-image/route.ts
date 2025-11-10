import { unlink } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'admin');

export async function DELETE(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const filename = request.nextUrl.searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename not provided' },
        { status: 400 }
      );
    }

    const filepath = join(UPLOAD_DIR, filename);

    if (!filepath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    try {
      await unlink(filepath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}