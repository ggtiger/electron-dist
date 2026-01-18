import { createHash } from 'crypto';
import { Readable } from 'stream';

export async function calculateSha256FromBuffer(buffer: Buffer): Promise<string> {
  const hash = createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

export async function calculateSha256FromStream(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

export async function calculateSha256FromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return calculateSha256FromBuffer(Buffer.from(buffer));
}
