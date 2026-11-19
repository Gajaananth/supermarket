import { ConfigService } from '@nestjs/config';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MapCacheService } from '../src/modules/maps/map-cache.service';
import { OsmMapProvider } from '../src/modules/maps/osm-map.provider';

describe('OSM map provider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('geocodes, reverse-geocodes, routes, and caches repeated address lookups', async () => {
    const config = new ConfigService({
      OSM_NOMINATIM_URL: 'https://nominatim.example.invalid',
      OSM_ROUTING_URL: 'https://routing.example.invalid',
      OSM_CONTACT_EMAIL: 'maps@example.invalid',
      OSM_MIN_INTERVAL_MS: 0,
      MAP_CACHE_TTL_SECONDS: 60,
      MAP_CACHE_MAX_ENTRIES: 10,
    });
    const responses = [
      [{ lat: '7.7', lon: '81.7', display_name: 'Batticaloa' }],
      { lat: '7.7', lon: '81.7', display_name: 'Batticaloa, Sri Lanka' },
      {
        code: 'Ok',
        routes: [{
          distance: 1200,
          duration: 300,
          geometry: { coordinates: [[81.7, 7.7], [81.71, 7.71]] },
        }],
      },
    ];
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(JSON.stringify(responses.shift()), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const provider = new OsmMapProvider(config, new MapCacheService(config));

    await expect(provider.geocode(' Batticaloa ')).resolves.toEqual({
      latitude: 7.7,
      longitude: 81.7,
      displayName: 'Batticaloa',
    });
    await provider.geocode('Batticaloa');
    await expect(provider.reverseGeocode(7.7, 81.7)).resolves.toMatchObject({
      displayName: 'Batticaloa, Sri Lanka',
    });
    await expect(provider.route(
      { latitude: 7.7, longitude: 81.7 },
      { latitude: 7.71, longitude: 81.71 },
    )).resolves.toMatchObject({ distanceMeters: 1200, durationSeconds: 300 });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({
      'User-Agent': 'BuyMe-API/1.0 (maps@example.invalid)',
    });
  });

  it('rejects invalid coordinates and reports provider HTTP failures', async () => {
    const config = new ConfigService({ OSM_MIN_INTERVAL_MS: 0 });
    const provider = new OsmMapProvider(config, new MapCacheService(config));
    expect(() => provider.reverseGeocode(91, 0)).toThrow(
      'Valid latitude and longitude coordinates are required',
    );

    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })));
    await expect(provider.geocode('Batticaloa')).rejects.toThrow(
      'Map provider request failed',
    );
  });
});
