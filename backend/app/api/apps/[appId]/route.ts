import { NextRequest } from 'next/server';
import { AppService } from '@/src/services/app.service';
import { successResponse, handleError } from '@/src/lib/response';

interface Params {
  params: Promise<{ appId: string }>;
}

// GET /api/apps/[appId] - Get app detail
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { appId } = await params;
    const app = await AppService.findById(BigInt(appId));

    return successResponse({
      id: app.id.toString(),
      name: app.name,
      appKey: app.appKey,
      platform: app.platform,
      arch: app.arch,
      description: app.description,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/apps/[appId] - Delete an app
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { appId } = await params;
    await AppService.softDelete(BigInt(appId));

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
}
