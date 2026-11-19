import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MapCacheService } from './map-cache.service';
import { MapLocation, MapProvider, MapRoute } from './map-provider';

interface NominatimEntry {
  lat: string;
  lon: string;
  display_name: string;
}

interface OsrmRouteResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: { coordinates: Array<[number, number]> };
  }>;
}

@Injectable()
export class OsmMapProvider implements MapProvider {
  private readonly logger = new Logger(OsmMapProvider.name);
  private lastRequestAt = 0;
  private rateLimitTail: Promise<void> = Promise.resolve();
  private readonly nominatimUrl: string;
  private readonly routingUrl: string;
  private readonly userAgent: string;
  private readonly minimumIntervalMs: number;

  constructor(
    config: ConfigService,
    private readonly cache: MapCacheService,
  ) {
    this.nominatimUrl = config.get<string>(
      'OSM_NOMINATIM_URL',
      'https://nominatim.openstreetmap.org',
    ).replace(/\/+$/, '');
    this.routingUrl = config.get<string>(
      'OSM_ROUTING_URL',
      'https://router.project-osrm.org',
    ).replace(/\/+$/, '');
    const contact = config.get<string>('OSM_CONTACT_EMAIL');
    this.userAgent = contact
      ? `BuyMe-API/1.0 (${contact})`
      : 'BuyMe-API/1.0';
    this.minimumIntervalMs = config.get<number>('OSM_MIN_INTERVAL_MS', 1000);
  }

  geocode(query: string): Promise<MapLocation> {
    const normalized = query.trim().replace(/\s+/g, ' ');
    if (!normalized || normalized.length > 200) {
      throw new NotFoundException('A valid address query is required');
    }
    return this.cache.getOrLoad(`geocode:${normalized.toLocaleLowerCase()}`, async () => {
      await this.waitForNominatimSlot();
      const url = new URL(`${this.nominatimUrl}/search`);
      url.search = new URLSearchParams({
        q: normalized,
        format: 'jsonv2',
        limit: '1',
      }).toString();
      const entries = await this.requestJson<NominatimEntry[]>(url);
      const match = entries[0];
      if (
        !match ||
        typeof match.display_name !== 'string' ||
        !isCoordinate(Number(match.lat), Number(match.lon))
      ) {
        throw new NotFoundException('Address could not be found');
      }
      return {
        latitude: Number(match.lat),
        longitude: Number(match.lon),
        displayName: match.display_name,
      };
    });
  }

  reverseGeocode(latitude: number, longitude: number): Promise<MapLocation> {
    this.assertCoordinates(latitude, longitude);
    const key = `reverse:${latitude.toFixed(6)}:${longitude.toFixed(6)}`;
    return this.cache.getOrLoad(key, async () => {
      await this.waitForNominatimSlot();
      const url = new URL(`${this.nominatimUrl}/reverse`);
      url.search = new URLSearchParams({
        lat: String(latitude),
        lon: String(longitude),
        format: 'jsonv2',
      }).toString();
      const result = await this.requestJson<Partial<NominatimEntry>>(url);
      if (
        typeof result.display_name !== 'string' ||
        !isCoordinate(Number(result.lat ?? latitude), Number(result.lon ?? longitude))
      ) {
        throw new NotFoundException('Address could not be found');
      }
      return {
        latitude: Number(result.lat ?? latitude),
        longitude: Number(result.lon ?? longitude),
        displayName: result.display_name,
      };
    });
  }

  route(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number },
  ): Promise<MapRoute> {
    this.assertCoordinates(from.latitude, from.longitude);
    this.assertCoordinates(to.latitude, to.longitude);
    const key = `route:${from.latitude.toFixed(6)}:${from.longitude.toFixed(6)}:${
      to.latitude.toFixed(6)
    }:${to.longitude.toFixed(6)}`;
    return this.cache.getOrLoad(key, async () => {
      const coordinates = [
        `${from.longitude},${from.latitude}`,
        `${to.longitude},${to.latitude}`,
      ].join(';');
      const url = new URL(`${this.routingUrl}/route/v1/driving/${coordinates}`);
      url.search = new URLSearchParams({
        overview: 'full',
        geometries: 'geojson',
      }).toString();
      const result = await this.requestJson<OsrmRouteResponse>(url);
      const route = result.routes?.[0];
      if (
        result.code !== 'Ok' ||
        !route ||
        !Number.isFinite(route.distance) ||
        !Number.isFinite(route.duration) ||
        !Array.isArray(route.geometry?.coordinates) ||
        route.geometry.coordinates.length < 2 ||
        !route.geometry.coordinates.every(
          (coordinate) =>
            Array.isArray(coordinate) &&
            coordinate.length >= 2 &&
            isCoordinate(Number(coordinate[1]), Number(coordinate[0])),
        )
      ) {
        throw new NotFoundException('No driving route is available');
      }
      return {
        distanceMeters: route.distance,
        durationSeconds: route.duration,
        coordinates: route.geometry.coordinates,
      };
    });
  }

  private async requestJson<T>(url: URL): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      this.logger.warn(`Map provider request failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      throw new ServiceUnavailableException('Map provider is unavailable');
    }
    if (!response.ok) {
      this.logger.warn(`Map provider returned HTTP ${response.status}`);
      throw new ServiceUnavailableException('Map provider request failed');
    }
    try {
      return await response.json() as T;
    } catch {
      throw new ServiceUnavailableException('Map provider returned an invalid response');
    }
  }

  private async waitForNominatimSlot() {
    let release!: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    const previous = this.rateLimitTail;
    this.rateLimitTail = previous.then(() => next);
    await previous;
    try {
      const waitMs = this.minimumIntervalMs - (Date.now() - this.lastRequestAt);
      if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
      this.lastRequestAt = Date.now();
    } finally {
      release();
    }
  }

  private assertCoordinates(latitude: number, longitude: number) {
    if (!isCoordinate(latitude, longitude)) {
      throw new NotFoundException('Valid latitude and longitude coordinates are required');
    }
  }
}

function isCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}
