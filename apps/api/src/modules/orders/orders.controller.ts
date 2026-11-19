import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  AssignOrderRiderDto,
  CreateOrderDto,
  DeliverOrderDto,
  OrderListQueryDto,
  OrderNoteDto,
  OrderReasonDto,
} from './dto/order.dto';
import { CheckoutOrderDto } from './dto/cart.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders & COD')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @Roles(Role.CUSTOMER)
  create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.create(dto, user);
  }

  @Post('checkout')
  @Roles(Role.CUSTOMER)
  checkout(
    @Body() dto: CheckoutOrderDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.checkout(
      dto.storeId,
      dto.deliveryAddressId,
      dto.deliveryZoneId,
      dto.campaignCodes,
      user,
    );
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN, Role.RIDER, Role.CUSTOMER)
  list(
    @Query() query: OrderListQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.list(query, user);
  }

  @Get('eligible-riders')
  @Roles(Role.STORE_ADMIN)
  eligibleRiders(@CurrentUser() user: UserPayload) {
    return this.orders.listEligibleRiders(user);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN, Role.RIDER, Role.CUSTOMER)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.findOne(id, user);
  }

  @Post(':id/cancel')
  @Roles(Role.CUSTOMER)
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderReasonDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.cancel(id, dto, user);
  }

  @Post(':id/accept')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  accept(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderNoteDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.accept(id, dto, user);
  }

  @Post(':id/reject')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderReasonDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.reject(id, dto, user);
  }

  @Post(':id/preparing')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  startPreparing(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderNoteDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.startPreparing(id, dto, user);
  }

  @Post(':id/ready')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  markReady(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderNoteDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.markReady(id, dto, user);
  }

  @Post(':id/assign-rider')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  assignRider(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignOrderRiderDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.assignRider(id, dto, user);
  }

  @Post(':id/rider-reject')
  @Roles(Role.RIDER)
  riderReject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderReasonDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.riderReject(id, dto, user);
  }

  @Post(':id/pick-up')
  @Roles(Role.RIDER)
  pickUp(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderNoteDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.pickUp(id, dto, user);
  }

  @Post(':id/start-delivery')
  @Roles(Role.RIDER)
  startDelivery(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderNoteDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.startDelivery(id, dto, user);
  }

  @Post(':id/deliver')
  @Roles(Role.RIDER)
  deliver(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeliverOrderDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.deliver(id, dto, user);
  }

  @Post(':id/fail')
  @Roles(Role.RIDER)
  fail(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OrderReasonDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.orders.fail(id, dto, user);
  }
}
