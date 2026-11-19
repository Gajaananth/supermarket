import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AdjustStockDto,
  StoreCatalogQueryDto,
  UpdateReorderLevelDto,
  UpdateStoreCatalogDto,
} from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('Warehouse Stock')
@ApiBearerAuth('JWT-auth')
@Controller('warehouse/stock')
@Roles(Role.SUPER_ADMIN)
export class WarehouseInventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list() {
    return this.inventory.listWarehouseStock();
  }

  @Get('low-stock')
  lowStock() {
    return this.inventory.listWarehouseLowStock();
  }

  @Post(':productId/adjust')
  adjust(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.inventory.adjustWarehouseStock(productId, dto, user);
  }

  @Patch(':productId/reorder-level')
  setReorderLevel(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateReorderLevelDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.inventory.setWarehouseReorderLevel(productId, dto, user);
  }
}

@ApiTags('Store Catalogue & Stock')
@Controller('stores/:storeId')
export class StoreInventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Public()
  @Get('catalog')
  catalog(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Query() query: StoreCatalogQueryDto,
  ) {
    return this.inventory.listStoreCatalog(storeId, query);
  }

  @Get('stock')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  stock(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.inventory.listStoreStock(storeId, user);
  }

  @Post('catalog/:productId')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  updateCatalog(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateStoreCatalogDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.inventory.upsertStoreCatalog(storeId, productId, dto, user);
  }

  @Post('stock/:productId/adjust')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  adjustStock(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.inventory.adjustStoreStock(storeId, productId, dto, user);
  }

  @Get('alerts')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  alerts(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.inventory.listStoreAlerts(storeId, user);
  }

  @Patch('alerts/:alertId/acknowledge')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  acknowledge(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Param('alertId', ParseUUIDPipe) alertId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.inventory.acknowledgeStoreAlert(storeId, alertId, user);
  }
}
