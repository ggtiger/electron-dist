import { NextRequest } from 'next/server';
import { AppService } from '@/src/services/app.service';
import { VersionService } from '@/src/services/version.service';
import { successResponse, handleError } from '@/src/lib/response';

interface Params {
  params: Promise<{ appId: string; versionId: string }>;
}

// GET /api/apps/[appId]/versions/[versionId] - Get version detail
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { appId, versionId } = await params;

    // Validate app exists
    await AppService.findById(BigInt(appId));

    const version = await VersionService.findById(BigInt(appId), BigInt(versionId));

    return successResponse({
      id: version.id.toString(),
      appId: version.appId.toString(),
      appVersion: version.appVersion,
      rendererVersion: version.rendererVersion,
      versionCode: version.versionCode.toString(),
      description: version.description,
      releaseNotes: version.releaseNotes,
      installerFileId: version.installerFileId?.toString() || null,
      patchFileId: version.patchFileId?.toString() || null,
      isActive: version.isActive,
      createdAt: version.createdAt.toISOString(),
      updatedAt: version.updatedAt.toISOString(),
      app: {
        id: version.app.id.toString(),
        name: version.app.name,
        appKey: version.app.appKey,
      },
      installerFile: version.installerFile
        ? {
            id: version.installerFile.id.toString(),
            sha256: version.installerFile.sha256,
            size: version.installerFile.size?.toString(),
            originalName: version.installerFile.originalName,
          }
        : null,
      patchFile: version.patchFile
        ? {
            id: version.patchFile.id.toString(),
            sha256: version.patchFile.sha256,
            size: version.patchFile.size?.toString(),
            originalName: version.patchFile.originalName,
          }
        : null,
    });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/apps/[appId]/versions/[versionId] - Delete a version
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { appId, versionId } = await params;

    // Validate app exists
    await AppService.findById(BigInt(appId));

    await VersionService.delete(BigInt(appId), BigInt(versionId));

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
}
