import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsNumber, Max, Min } from 'class-validator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { StoresService } from './stores.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  UpdateDeliveryZonePricingDto,
  UpdateStoreSettingsDto,
  UpdateStoreStatusDto,
} from './dto/store-settings.dto';

export class FindNearestStoreDto {
  @ApiProperty({ example: 7.7110, description: 'Latitude coordinate' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ example: 81.6930, description: 'Longitude coordinate' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;
}

@ApiTags('Stores & Zones')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all active Batticaloa stores with delivery zones' })
  @ApiResponse({ status: 200, description: 'Store list' })
  async findAll() {
    const stores = await this.storesService.findAll();
    return { count: stores.length, stores };
  }

  @Get('admin')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all stores, including inactive stores, for Super Admin management' })
  async findAllForAdmin() {
    const stores = await this.storesService.findAllForAdmin();
    return { count: stores.length, stores };
  }

  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreStatusDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.storesService.updateStatus(id, dto, user);
  }

  @Get(':id/settings')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  getSettings(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.storesService.getSettings(id, user);
  }

  @Patch(':id/settings')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  updateSettings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreSettingsDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.storesService.updateSettings(id, dto, user);
  }

  @Patch(':id/zones/:zoneId/pricing')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  updateZonePricing(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('zoneId', ParseUUIDPipe) zoneId: string,
    @Body() dto: UpdateDeliveryZonePricingDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.storesService.updateZonePricing(id, zoneId, dto, user);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get single store details by UUID' })
  @ApiResponse({ status: 200, description: 'Store details' })
  async findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Public()
  @Post('find-nearest')
  @ApiOperation({ summary: 'Find nearest open store for GPS coordinates' })
  @ApiResponse({ status: 200, description: 'Nearest store' })
  async findNearest(@Body() body: FindNearestStoreDto) {
    return this.storesService.findNearest(body.latitude, body.longitude);
  }
}
