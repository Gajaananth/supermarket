import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MapCacheService {
  private readonly values = new Map<string, { expiresAt: number; value: unknown }>();
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly ttlMs: number;
  private readonly capacity: number;

  constructor(config: ConfigService) {
    this.ttlMs = config.get<number>('MAP_CACHE_TTL_SECONDS', 3600) * 1000;
    this.capacity = config.get<number>('MAP_CACHE_MAX_ENTRIES', 1000);
  }

  async getOrLoad<T>(key: string, load: () => Promise<T>): Promise<T> {
    const cached = this.values.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      this.values.delete(key);
      this.values.set(key, cached);
      return cached.value as T;
    }
    if (cached) this.values.delete(key);

    const pending = this.inFlight.get(key);
    if (pending) return pending as Promise<T>;

    const request = load().then((value) => {
      this.values.set(key, { value, expiresAt: Date.now() + this.ttlMs });
      while (this.values.size > this.capacity) {
        const oldest = this.values.keys().next().value;
        if (oldest === undefined) break;
        this.values.delete(oldest);
      }
      return value;
    }).finally(() => {
      this.inFlight.delete(key);
    });
    this.inFlight.set(key, request);
    return request;
  }
}
