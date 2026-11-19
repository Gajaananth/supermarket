import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Public } from '../../common/decorators/public.decorator';
import { MAP_PROVIDER, MapProvider } from './map-provider';

class GeocodeQuery {
  @ApiProperty({ description: 'Address or place name to search', maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  q!: string;
}

class MapCoordinatesQuery {
  @ApiProperty({ minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;
}

class RouteQuery {
  @ApiProperty({ minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  fromLatitude!: number;

  @ApiProperty({ minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  fromLongitude!: number;

  @ApiProperty({ minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  toLatitude!: number;

  @ApiProperty({ minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  toLongitude!: number;
}

@ApiTags('Maps')
@Controller('maps')
export class MapsController {
  constructor(@Inject(MAP_PROVIDER) private readonly mapProvider: MapProvider) {}

  @Public()
  @Get('geocode')
  @ApiOperation({ summary: 'Geocode an address using OpenStreetMap' })
  geocode(@Query() query: GeocodeQuery) {
    return this.mapProvider.geocode(query.q);
  }

  @Public()
  @Get('reverse-geocode')
  @ApiOperation({ summary: 'Reverse-geocode coordinates using OpenStreetMap' })
  reverseGeocode(@Query() query: MapCoordinatesQuery) {
    return this.mapProvider.reverseGeocode(query.latitude, query.longitude);
  }

  @Public()
  @Get('route')
  @ApiOperation({ summary: 'Find a driving route using OSRM' })
  route(@Query() query: RouteQuery) {
    return this.mapProvider.route(
      { latitude: query.fromLatitude, longitude: query.fromLongitude },
      { latitude: query.toLatitude, longitude: query.toLongitude },
    );
  }
}
