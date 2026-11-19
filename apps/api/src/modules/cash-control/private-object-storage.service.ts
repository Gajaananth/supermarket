import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

const maximumSlipSize = 5 * 1024 * 1024;
const allowedKycTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);

@Injectable()
export class PrivateObjectStorageService implements OnModuleDestroy {
  private clientInstance?: S3Client;

  constructor(private readonly config: ConfigService) {}

  async createUploadUrl(key: string, contentType: string, contentLength: number) {
    if (!allowedTypes.has(contentType)) {
      throw new BadRequestException('Only JPEG, PNG, and PDF deposit slips are allowed');
    }
    if (!Number.isInteger(contentLength) || contentLength < 1 || contentLength > maximumSlipSize) {
      throw new BadRequestException('Deposit slip must be between 1 byte and 5 MB');
    }
    const { client, bucket } = this.storage();
    const expiresIn = this.config.get<number>('OBJECT_STORAGE_PRESIGN_TTL_SECONDS', 600);
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        ContentLength: contentLength,
      }),
      { expiresIn },
    );
    return {
      uploadUrl,
      objectKey: key,
      contentType,
      contentLength,
      requiredHeaders: { 'Content-Type': contentType },
      expiresInSeconds: expiresIn,
    };
  }

  async createDownloadUrl(key: string) {
    const { client, bucket } = this.storage();
    const expiresIn = this.config.get<number>('OBJECT_STORAGE_PRESIGN_TTL_SECONDS', 600);
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: 'attachment; filename="bank-deposit-slip"',
      }),
      { expiresIn },
    );
    return { url, expiresInSeconds: expiresIn };
  }

  async createKycUploadUrl(key: string, contentType: string, contentLength: number) {
    if (!allowedKycTypes.has(contentType)) {
      throw new BadRequestException('KYC documents must be JPEG, PNG, or WebP images');
    }
    if (!Number.isInteger(contentLength) || contentLength < 1 || contentLength > maximumSlipSize) {
      throw new BadRequestException('KYC image must be between 1 byte and 5 MB');
    }
    const { client, bucket } = this.storage();
    const expiresIn = this.config.get<number>('OBJECT_STORAGE_PRESIGN_TTL_SECONDS', 600);
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        ContentLength: contentLength,
      }),
      { expiresIn },
    );
    return {
      uploadUrl,
      objectKey: key,
      contentType,
      contentLength,
      requiredHeaders: { 'Content-Type': contentType },
      expiresInSeconds: expiresIn,
    };
  }

  async createKycDownloadUrl(key: string) {
    const { client, bucket } = this.storage();
    const expiresIn = this.config.get<number>('OBJECT_STORAGE_PRESIGN_TTL_SECONDS', 600);
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: 'attachment; filename="rider-kyc-document"',
      }),
      { expiresIn },
    );
    return { url, expiresInSeconds: expiresIn };
  }

  async promoteKycDocument(
    uploadKey: string,
    contentType: string,
    expectedEtag: string,
  ): Promise<string> {
    const { client, bucket } = this.storage();
    const parts = uploadKey.split('/');
    if (parts.length !== 4 || parts[0] !== 'rider-kyc' || parts[2] !== 'uploads') {
      throw new BadRequestException('KYC upload key is invalid');
    }
    const extension = uploadKey.split('.').pop()?.toLowerCase();
    const finalKey = `rider-kyc/${parts[1]}/documents/${randomUUID()}.${extension}`;
    try {
      await client.send(new CopyObjectCommand({
        Bucket: bucket,
        Key: finalKey,
        CopySource: `${bucket}/${uploadKey.split('/').map(encodeURIComponent).join('/')}`,
        CopySourceIfMatch: expectedEtag,
        ContentType: contentType,
        MetadataDirective: 'REPLACE',
      }));
    } catch (error) {
      if (
        error instanceof Error &&
        '$metadata' in error &&
        typeof error.$metadata === 'object' &&
        error.$metadata !== null &&
        'httpStatusCode' in error.$metadata &&
        error.$metadata.httpStatusCode === 412
      ) {
        throw new ConflictException('KYC image changed during malware scanning; upload it again');
      }
      throw error;
    }
    return finalKey;
  }

  async removeKycDocument(key: string): Promise<void> {
    const { client, bucket } = this.storage();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  async readAndValidateKycImage(
    key: string,
    expectedType: string,
  ): Promise<{ bytes: Buffer; etag: string }> {
    if (!allowedKycTypes.has(expectedType)) {
      throw new BadRequestException('KYC documents must be JPEG, PNG, or WebP images');
    }
    const { client, bucket } = this.storage();
    let metadata;
    try {
      metadata = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    } catch (error) {
      if (
        error instanceof Error &&
        '$metadata' in error &&
        typeof error.$metadata === 'object' &&
        error.$metadata !== null &&
        'httpStatusCode' in error.$metadata &&
        error.$metadata.httpStatusCode === 404
      ) {
        throw new BadRequestException('Uploaded KYC image was not found or has expired');
      }
      throw error;
    }

    if (
      !metadata.ContentLength ||
      metadata.ContentLength > maximumSlipSize ||
      metadata.ContentType !== expectedType ||
      !metadata.ETag
    ) {
      throw new BadRequestException('Uploaded KYC image metadata is invalid');
    }
    const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!object.Body) throw new BadRequestException('Uploaded KYC image is unreadable');
    const bytes = Buffer.from(await object.Body.transformToByteArray());
    if (
      bytes.length !== metadata.ContentLength ||
      this.detectContentType(bytes) !== expectedType ||
      object.ETag !== metadata.ETag
    ) {
      throw new BadRequestException('Uploaded KYC image contents do not match its type');
    }
    return { bytes, etag: metadata.ETag };
  }

  async validateDepositSlip(key: string, expectedType: string): Promise<void> {
    const { client, bucket } = this.storage();
    let metadata;
    try {
      metadata = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    } catch (error) {
      if (
        error instanceof Error &&
        ('$metadata' in error &&
          typeof error.$metadata === 'object' &&
          error.$metadata !== null &&
          'httpStatusCode' in error.$metadata &&
          error.$metadata.httpStatusCode === 404)
      ) {
        throw new BadRequestException('Uploaded deposit slip was not found or has expired');
      }
      throw error;
    }

    if (!metadata.ContentLength || metadata.ContentLength > maximumSlipSize) {
      throw new BadRequestException('Deposit slip must be between 1 byte and 5 MB');
    }
    if (metadata.ContentType !== expectedType || !allowedTypes.has(expectedType)) {
      throw new BadRequestException('Uploaded deposit slip content type does not match');
    }

    const object = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key, Range: 'bytes=0-15' }),
    );
    if (!object.Body) throw new BadRequestException('Uploaded deposit slip is unreadable');
    const prefix = Buffer.from(await object.Body.transformToByteArray());
    if (this.detectContentType(prefix) !== expectedType) {
      throw new BadRequestException('Uploaded deposit slip file contents do not match its type');
    }
  }

  onModuleDestroy() {
    this.clientInstance?.destroy();
  }

  private storage(): { client: S3Client; bucket: string } {
    const bucket = this.config.get<string>('OBJECT_STORAGE_BUCKET');
    if (!bucket) {
      throw new ServiceUnavailableException('Private object storage is not configured');
    }
    return { client: this.client(), bucket };
  }

  private client(): S3Client {
    if (this.clientInstance) return this.clientInstance;

    const endpoint = this.config.get<string>('OBJECT_STORAGE_ENDPOINT');
    const accessKeyId = this.config.get<string>('OBJECT_STORAGE_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('OBJECT_STORAGE_SECRET_ACCESS_KEY');
    if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
      throw new ServiceUnavailableException('Object storage credentials are incomplete');
    }
    if (endpoint && (!accessKeyId || !secretAccessKey)) {
      throw new ServiceUnavailableException(
        'S3-compatible endpoints require explicit access key credentials',
      );
    }

    this.clientInstance = new S3Client({
      region: this.config.get<string>('OBJECT_STORAGE_REGION', 'us-east-1'),
      ...(endpoint ? { endpoint } : {}),
      forcePathStyle: this.config.get<boolean>('OBJECT_STORAGE_FORCE_PATH_STYLE', false),
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    });
    return this.clientInstance;
  }

  private detectContentType(buffer: Buffer): string | undefined {
    if (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    ) return 'image/png';

    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }

    if (buffer.length >= 5 && buffer.toString('ascii', 0, 5) === '%PDF-') {
      return 'application/pdf';
    }

    if (
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) return 'image/webp';
  }
}
