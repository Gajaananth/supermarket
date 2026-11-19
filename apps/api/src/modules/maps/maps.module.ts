import { Module } from '@nestjs/common';
import { MapCacheService } from './map-cache.service';
import { MAP_PROVIDER } from './map-provider';
import { MapsController } from './maps.controller';
import { OsmMapProvider } from './osm-map.provider';

@Module({
  controllers: [MapsController],
  providers: [
    MapCacheService,
    OsmMapProvider,
    { provide: MAP_PROVIDER, useExisting: OsmMapProvider },
  ],
  exports: [MAP_PROVIDER],
})
export class MapsModule {}
