import prisma from '../lib/prisma';
import { FileType } from '@prisma/client';
import { NotFoundError } from '../lib/response';
import { calculateSha256FromBuffer } from '../lib/hash';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || './uploads';

export interface UploadResult {
  id: bigint;
  type: FileType;
  originalName: string;
  size: number;
  sha256: string;
  storagePath: string;
}

export class FileService {
  static async upload(
    file: File,
    type: FileType
  ): Promise<UploadResult> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const sha256 = await calculateSha256FromBuffer(buffer);

    // Check for duplicate
    const existing = await prisma.file.findFirst({
      where: { sha256, type },
    });

    if (existing) {
      return {
        id: existing.id,
        type: existing.type,
        originalName: existing.originalName || file.name,
        size: Number(existing.size || 0),
        sha256: existing.sha256 || sha256,
        storagePath: existing.storagePath || '',
      };
    }

    // Generate storage path
    const subDir = type === 'installer' ? 'installers' : 'patches';
    const fileName = `${sha256}_${file.name}`;
    const storagePath = path.join(subDir, fileName);
    const fullPath = path.join(UPLOAD_DIR, storagePath);

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write file
    await fs.writeFile(fullPath, buffer);

    // Create database record
    const fileRecord = await prisma.file.create({
      data: {
        type,
        originalName: file.name,
        size: BigInt(buffer.length),
        sha256,
        storagePath,
      },
    });

    return {
      id: fileRecord.id,
      type: fileRecord.type,
      originalName: fileRecord.originalName || file.name,
      size: Number(fileRecord.size || 0),
      sha256: fileRecord.sha256 || sha256,
      storagePath: fileRecord.storagePath || '',
    };
  }

  static async findById(id: bigint) {
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundError('File', id.toString());
    }

    return file;
  }

  static async generateDownloadUrl(fileId: bigint): Promise<{ url: string; expiresAt: Date }> {
    const file = await this.findById(fileId);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    // For local storage, return direct path
    const url = `${baseUrl}/uploads/${file.storagePath}`;
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    return { url, expiresAt };
  }

  static async deleteFile(id: bigint) {
    const file = await this.findById(id);

    if (file.storagePath) {
      const fullPath = path.join(UPLOAD_DIR, file.storagePath);
      try {
        await fs.unlink(fullPath);
      } catch {
        // File may not exist, continue
      }
    }

    await prisma.file.delete({ where: { id } });
  }
}
