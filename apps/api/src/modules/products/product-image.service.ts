import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, parse, resolve } from 'node:path';

export interface ProductImageUpload {
  buffer: Buffer;
}

@Injectable()
export class ProductImageService {
  constructor(private readonly config: ConfigService) {}

  async save(file: ProductImageUpload): Promise<{ url: string; path: string }> {
    const contentType = this.detectContentType(file.buffer);
    if (!contentType) {
      throw new BadRequestException('Image must contain valid PNG, JPEG, or WebP data');
    }

    const storageRoot = resolve(
      this.config.get<string>('STORAGE_LOCAL_DIR', 'E:/buyme-tools/storage'),
    );
    if (process.platform === 'win32' && parse(storageRoot).root.toLowerCase() === 'c:\\') {
      throw new ServiceUnavailableException('Product image storage cannot use the C: drive');
    }

    const extension = contentType === 'image/jpeg'
      ? 'jpg'
      : contentType === 'image/png' ? 'png' : 'webp';
    const directory = join(storageRoot, 'products');
    const filename = `${randomUUID()}.${extension}`;
    const filePath = join(directory, filename);

    await mkdir(directory, { recursive: true });
    await writeFile(filePath, file.buffer, { flag: 'wx' });
    return { url: `/uploads/products/${filename}`, path: filePath };
  }

  directory(): string {
    return join(
      resolve(this.config.get<string>('STORAGE_LOCAL_DIR', 'E:/buyme-tools/storage')),
      'products',
    );
  }

  private detectContentType(buffer: Buffer): string | undefined {
    if (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    ) return 'image/png';

    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) return 'image/jpeg';

    if (
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) return 'image/webp';
  }
}
