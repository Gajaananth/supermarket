import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createConnection } from 'node:net';

@Injectable()
export class ClamAvScannerService {
  constructor(private readonly config: ConfigService) {}

  async scan(bytes: Buffer): Promise<void> {
    const host = this.config.get<string>('CLAMAV_HOST');
    if (!host) {
      throw new ServiceUnavailableException('KYC malware scanner is not configured');
    }

    const port = this.config.get<number>('CLAMAV_PORT', 3310);
    await new Promise<void>((resolve, reject) => {
      const socket = createConnection({ host, port });
      let output = '';
      let settled = false;
      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        reject(error);
      };
      socket.setTimeout(10_000);
      socket.once('connect', () => {
        socket.write(Buffer.from('zINSTREAM\0', 'ascii'));
        for (let offset = 0; offset < bytes.length; offset += 64 * 1024) {
          const chunk = bytes.subarray(offset, Math.min(offset + 64 * 1024, bytes.length));
          const length = Buffer.alloc(4);
          length.writeUInt32BE(chunk.length);
          socket.write(length);
          socket.write(chunk);
        }
        const end = Buffer.alloc(4);
        socket.end(end);
      });
      socket.on('data', (chunk: Buffer) => {
        output += chunk.toString('utf8');
        if (!output.includes('\0')) return;
        settled = true;
        socket.destroy();
        if (/:\s*OK\0$/.test(output)) {
          resolve();
        } else if (/:.*FOUND\0$/.test(output)) {
          reject(new BadRequestException('KYC image failed malware scanning'));
        } else {
          reject(new ServiceUnavailableException('KYC malware scanner returned an invalid response'));
        }
      });
      socket.once('timeout', () => {
        fail(new ServiceUnavailableException('KYC malware scanner timed out'));
      });
      socket.once('error', () => {
        fail(new ServiceUnavailableException('KYC malware scanner is unavailable'));
      });
      socket.once('close', () => {
        if (!settled) {
          fail(new ServiceUnavailableException('KYC malware scanner closed without a result'));
        }
      });
    });
  }
}
