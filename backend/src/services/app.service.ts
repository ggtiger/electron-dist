import prisma from '../lib/prisma';
import { CreateAppInput, AppFilter, Pagination } from '../types';
import { NotFoundError, ConflictError } from '../lib/response';

export class AppService {
  static async create(data: CreateAppInput) {
    // Check for existing app with same appKey + platform + arch combination
    const existing = await prisma.app.findFirst({
      where: {
        appKey: data.appKey,
        platform: data.platform,
        arch: data.arch,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictError(
        `App with appKey '${data.appKey}' for ${data.platform}/${data.arch} already exists`
      );
    }

    return prisma.app.create({
      data: {
        name: data.name,
        appKey: data.appKey,
        platform: data.platform,
        arch: data.arch,
        description: data.description,
        status: 'active',
      },
    });
  }

  static async findMany(filter: AppFilter, pagination: Pagination) {
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (filter.platform) {
      where.platform = filter.platform;
    }
    if (filter.arch) {
      where.arch = filter.arch;
    }
    if (filter.status) {
      where.status = filter.status;
    }

    const [items, total] = await Promise.all([
      prisma.app.findMany({
        where,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.app.count({ where }),
    ]);

    return { items, total };
  }

  static async findById(id: bigint) {
    const app = await prisma.app.findFirst({
      where: { id, deletedAt: null },
    });

    if (!app) {
      throw new NotFoundError('App', id.toString());
    }

    return app;
  }

  static async findByKey(appKey: string) {
    const app = await prisma.app.findFirst({
      where: { appKey, deletedAt: null },
    });

    if (!app) {
      throw new NotFoundError('App', appKey);
    }

    return app;
  }

  static async softDelete(id: bigint) {
    const app = await this.findById(id);

    await prisma.$transaction([
      prisma.app.update({
        where: { id: app.id },
        data: { deletedAt: new Date() },
      }),
      prisma.version.updateMany({
        where: { appId: app.id },
        data: { isActive: false },
      }),
    ]);
  }
}
