import { NextRequest } from 'next/server';
import { FileService } from '@/src/services/file.service';
import { successResponse, handleError } from '@/src/lib/response';

interface Params {
  params: Promise<{ fileId: string }>;
}

// GET /api/files/[fileId]/download-url - Get download URL for a file
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { fileId } = await params;
    const result = await FileService.generateDownloadUrl(BigInt(fileId));

    return successResponse({
      url: result.url,
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (error) {
    return handleError(error);
  }
}
