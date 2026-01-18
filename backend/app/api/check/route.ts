import { NextRequest } from 'next/server';
import { UpdateService } from '@/src/services/update.service';
import { successResponse, handleError, ValidationError } from '@/src/lib/response';

// GET /api/check - Check for updates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const appKey = searchParams.get('appKey');
    const appVersion = searchParams.get('appVersion');
    const rendererVersion = searchParams.get('rendererVersion');
    const platform = searchParams.get('platform');
    const arch = searchParams.get('arch');

    if (!appKey) {
      throw new ValidationError('appKey is required');
    }
    if (!appVersion) {
      throw new ValidationError('appVersion is required');
    }
    if (!rendererVersion) {
      throw new ValidationError('rendererVersion is required');
    }
    if (!platform) {
      throw new ValidationError('platform is required');
    }
    if (!arch) {
      throw new ValidationError('arch is required');
    }

    const result = await UpdateService.checkUpdate({
      appKey,
      appVersion,
      rendererVersion,
      platform,
      arch,
    });

    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}
