import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customName = formData.get('filename') as string | null;
    const folder = (formData.get('folder') as string | null) || 'teams';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tệp ảnh tải lên.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Định dạng tệp không hợp lệ. Vui lòng chọn ảnh PNG, JPG, JPEG, WebP hoặc SVG.',
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Dung lượng ảnh vượt quá giới hạn cho phép (tối đa 5MB).' },
        { status: 400 }
      );
    }

    // Determine target directory inside public
    const targetDir = path.join(process.cwd(), 'public', 'images', folder);
    await fs.mkdir(targetDir, { recursive: true });

    // Determine file extension
    let ext = path.extname(file.name).toLowerCase();
    if (!ext) {
      if (file.type === 'image/png') ext = '.png';
      else if (file.type === 'image/jpeg') ext = '.jpg';
      else if (file.type === 'image/webp') ext = '.webp';
      else if (file.type === 'image/svg+xml') ext = '.svg';
      else ext = '.png';
    }

    // Determine safe filename
    let finalFileName: string;
    if (customName && customName.trim()) {
      const cleanCustom = customName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      finalFileName = `${cleanCustom}${ext}`;
    } else {
      const originalClean = path
        .basename(file.name, ext)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-');
      finalFileName = `${originalClean || 'avatar'}-${Date.now()}${ext}`;
    }

    const filePath = path.join(targetDir, finalFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/images/${folder}/${finalFileName}?t=${Date.now()}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: finalFileName,
    });
  } catch (err: unknown) {
    console.error('Error uploading avatar:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Lỗi máy chủ khi lưu tệp ảnh.',
      },
      { status: 500 }
    );
  }
}
