import prisma from '../lib/prisma';
import { CheckUpdateQuery, CheckUpdateResponse } from '../types';
import { FileService } from './file.service';

export class UpdateService {
  static compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }

  static async checkUpdate(query: CheckUpdateQuery): Promise<CheckUpdateResponse> {
    // Find app by appKey, platform and arch
    const app = await prisma.app.findFirst({
      where: {
        appKey: query.appKey,
        platform: query.platform,
        arch: query.arch,
        deletedAt: null,
      },
    });

    if (!app) {
      return { updateType: 'none' };
    }

    // Get latest active version
    const latestVersion = await prisma.version.findFirst({
      where: {
        appId: app.id,
        isActive: true,
      },
      orderBy: { versionCode: 'desc' },
      include: {
        installerFile: true,
        patchFile: true,
      },
    });

    if (!latestVersion) {
      return { updateType: 'none' };
    }

    const appVersionCompare = this.compareVersions(
      query.appVersion,
      latestVersion.appVersion
    );
    const rendererVersionCompare = this.compareVersions(
      query.rendererVersion,
      latestVersion.rendererVersion
    );

    // Case 1: Client appVersion is older
    if (appVersionCompare < 0) {
      // Prefer hot update if patch available
      if (latestVersion.patchFile && latestVersion.patchFileId) {
        const downloadInfo = await FileService.generateDownloadUrl(latestVersion.patchFileId);
        return {
          updateType: 'hot',
          version: latestVersion.appVersion,
          rendererVersion: latestVersion.rendererVersion,
          url: downloadInfo.url,
          sha256: latestVersion.patchFile.sha256 || undefined,
          size: Number(latestVersion.patchFile.size || 0),
          notes: latestVersion.releaseNotes || undefined,
        };
      }

      // Fall back to installer
      if (latestVersion.installerFile && latestVersion.installerFileId) {
        const downloadInfo = await FileService.generateDownloadUrl(latestVersion.installerFileId);
        return {
          updateType: 'installer',
          version: latestVersion.appVersion,
          rendererVersion: latestVersion.rendererVersion,
          url: downloadInfo.url,
          sha256: latestVersion.installerFile.sha256 || undefined,
          size: Number(latestVersion.installerFile.size || 0),
          notes: latestVersion.releaseNotes || undefined,
        };
      }
    }

    // Case 2: Same appVersion but older rendererVersion
    if (appVersionCompare === 0 && rendererVersionCompare < 0) {
      if (latestVersion.patchFile && latestVersion.patchFileId) {
        const downloadInfo = await FileService.generateDownloadUrl(latestVersion.patchFileId);
        return {
          updateType: 'hot',
          version: latestVersion.appVersion,
          rendererVersion: latestVersion.rendererVersion,
          url: downloadInfo.url,
          sha256: latestVersion.patchFile.sha256 || undefined,
          size: Number(latestVersion.patchFile.size || 0),
          notes: latestVersion.releaseNotes || undefined,
        };
      }
    }

    // No update needed
    return { updateType: 'none' };
  }
}
