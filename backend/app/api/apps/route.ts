import { NextRequest } from 'next/server';
import { AppService } from '@/src/services/app.service';
import {
  successResponse,
  paginatedResponse,
  handleError,
  ValidationError,
} from '@/src/lib/response';
import { PLATFORMS, ARCHS } from '@/src/types';

// POST /api/apps - Create a new app
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      throw new ValidationError('name is required');
    }
    if (!body.appKey || typeof body.appKey !== 'string') {
      throw new ValidationError('appKey is required');
    }
    if (!body.platform || !PLATFORMS.includes(body.platform)) {
      throw new ValidationError(`platform must be one of: ${PLATFORMS.join(', ')}`);
    }
    if (!body.arch || !ARCHS.includes(body.arch)) {
      throw new ValidationError(`arch must be one of: ${ARCHS.join(', ')}`);
    }

    const app = await AppService.create({
      name: body.name,
      appKey: body.appKey,
      platform: body.platform,
      arch: body.arch,
      description: body.description,
    });

    return successResponse(serializeApp(app), 201);
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/apps - List all apps
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const platform = searchParams.get('platform') || undefined;
    const arch = searchParams.get('arch') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));

    const { items, total } = await AppService.findMany(
      { platform, arch },
      { page, pageSize }
    );

    return paginatedResponse(items.map(serializeApp), total, page, pageSize);
  } catch (error) {
    return handleError(error);
  }
}

function serializeApp(app: {
  id: bigint;
  name: string;
  appKey: string;
  platform: string;
  arch: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}) {
  return {
    id: app.id.toString(),
    name: app.name,
    appKey: app.appKey,
    platform: app.platform,
    arch: app.arch,
    description: app.description,
    status: app.status,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}
