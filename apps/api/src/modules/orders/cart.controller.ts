import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CartItemInputDto, CartItemQuantityDto } from './dto/cart.dto';
import { CartService } from './cart.service';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart/:storeId')
@Roles(Role.CUSTOMER)
export class CartController {
  constructor(private readonly carts: CartService) {}

  @Get()
  get(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.carts.get(storeId, user);
  }

  @Post('items')
  add(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Body() dto: CartItemInputDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.carts.add(storeId, dto, user);
  }

  @Patch('items/:storeProductId')
  setQuantity(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Param('storeProductId', ParseUUIDPipe) storeProductId: string,
    @Body() dto: CartItemQuantityDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.carts.setQuantity(storeId, storeProductId, dto, user);
  }

  @Delete('items/:storeProductId')
  remove(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Param('storeProductId', ParseUUIDPipe) storeProductId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.carts.remove(storeId, storeProductId, user);
  }
}
