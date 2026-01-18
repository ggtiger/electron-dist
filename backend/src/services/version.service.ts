import prisma from '../lib/prisma';
import { CreateVersionInput, Pagination } from '../types';
import { NotFoundError } from '../lib/response';

export class VersionService {
  static async create(appId: bigint, data: CreateVersionInput) {
    // Get the max versionCode for this app
    let versionCode = data.versionCode;
    if (!versionCode) {
      const maxVersion = await prisma.version.findFirst({
        where: { appId },
        orderBy: { versionCode: 'desc' },
        select: { versionCode: true },
      });
      versionCode = maxVersion ? Number(maxVersion.versionCode) + 1 : 1;
    }

    return prisma.version.create({
      data: {
        appId,
        appVersion: data.appVersion,
        rendererVersion: data.rendererVersion,
        versionCode: BigInt(versionCode),
        description: data.description,
        releaseNotes: data.releaseNotes,
        installerFileId: data.installerFileId ? BigInt(data.installerFileId) : null,
        patchFileId: data.patchFileId ? BigInt(data.patchFileId) : null,
        isActive: true,
      },
      include: {
        installerFile: true,
        patchFile: true,
      },
    });
  }

  static async findByApp(appId: bigint, pagination: Pagination) {
    const where = { appId, isActive: true };

    const [items, total] = await Promise.all([
      prisma.version.findMany({
        where,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        orderBy: { versionCode: 'desc' },
        include: {
          installerFile: true,
          patchFile: true,
        },
      }),
      prisma.version.count({ where }),
    ]);

    return { items, total };
  }

  static async findById(appId: bigint, versionId: bigint) {
    const version = await prisma.version.findFirst({
      where: { id: versionId, appId },
      include: {
        app: true,
        installerFile: true,
        patchFile: true,
      },
    });

    if (!version) {
      throw new NotFoundError('Version', versionId.toString());
    }

    return version;
  }

  static async delete(appId: bigint, versionId: bigint) {
    await this.findById(appId, versionId);

    await prisma.version.update({
      where: { id: versionId },
      data: { isActive: false },
    });
  }

  static async getLatestVersion(appId: bigint) {
    return prisma.version.findFirst({
      where: { appId, isActive: true },
      orderBy: { versionCode: 'desc' },
      include: {
        installerFile: true,
        patchFile: true,
      },
    });
  }
}
