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
  CreateTransferDto,
  ReceiveTransferDto,
  ResolveTransferDto,
  TransferListQueryDto,
} from './dto/transfer.dto';
import { TransfersService } from './transfers.service';

@ApiTags('Stock Transfers')
@ApiBearerAuth('JWT-auth')
@Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfers: TransfersService) {}

  @Get()
  list(
    @Query() query: TransferListQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.transfers.list(query, user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.transfers.findOne(id, user);
  }

  @Post()
  create(
    @Body() dto: CreateTransferDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.transfers.create(dto, user);
  }

  @Post(':id/dispatch')
  @Roles(Role.SUPER_ADMIN)
  dispatch(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.transfers.dispatch(id, user);
  }

  @Post(':id/receive')
  receive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReceiveTransferDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.transfers.receive(id, dto, user);
  }

  @Post(':id/resolve')
  @Roles(Role.SUPER_ADMIN)
  resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveTransferDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.transfers.resolve(id, dto, user);
  }

  @Post(':id/revert')
  @Roles(Role.SUPER_ADMIN)
  revert(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.transfers.revert(id, user);
  }

  @Post(':id/cancel')
  @Roles(Role.SUPER_ADMIN)
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.transfers.cancel(id, user);
  }
}
