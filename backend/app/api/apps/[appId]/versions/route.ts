import { NextRequest } from 'next/server';
import { AppService } from '@/src/services/app.service';
import { VersionService } from '@/src/services/version.service';
import {
  successResponse,
  paginatedResponse,
  handleError,
  ValidationError,
} from '@/src/lib/response';

interface Params {
  params: Promise<{ appId: string }>;
}

// POST /api/apps/[appId]/versions - Create a new version
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { appId } = await params;
    const body = await request.json();

    // Validate app exists
    await AppService.findById(BigInt(appId));

    // Validate required fields
    if (!body.appVersion || typeof body.appVersion !== 'string') {
      throw new ValidationError('appVersion is required');
    }
    if (!body.rendererVersion || typeof body.rendererVersion !== 'string') {
      throw new ValidationError('rendererVersion is required');
    }

    const version = await VersionService.create(BigInt(appId), {
      appVersion: body.appVersion,
      rendererVersion: body.rendererVersion,
      versionCode: body.versionCode ? parseInt(body.versionCode, 10) : undefined,
      description: body.description,
      releaseNotes: body.releaseNotes,
      installerFileId: body.installerFileId,
      patchFileId: body.patchFileId,
    });

    return successResponse(serializeVersion(version), 201);
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/apps/[appId]/versions - List versions for an app
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { appId } = await params;
    const { searchParams } = new URL(request.url);

    // Validate app exists
    await AppService.findById(BigInt(appId));

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));

    const { items, total } = await VersionService.findByApp(BigInt(appId), { page, pageSize });

    return paginatedResponse(items.map(serializeVersion), total, page, pageSize);
  } catch (error) {
    return handleError(error);
  }
}

function serializeVersion(version: {
  id: bigint;
  appId: bigint;
  appVersion: string;
  rendererVersion: string;
  versionCode: bigint;
  description: string | null;
  releaseNotes: string | null;
  installerFileId: bigint | null;
  patchFileId: bigint | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  installerFile?: { id: bigint; sha256: string | null; size: bigint | null; originalName: string | null } | null;
  patchFile?: { id: bigint; sha256: string | null; size: bigint | null; originalName: string | null } | null;
}) {
  return {
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
  };
}
