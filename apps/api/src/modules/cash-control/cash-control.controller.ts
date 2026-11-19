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
  CreateRiderDepositDto,
  DepositListQueryDto,
  DepositUploadUrlDto,
  ReconciliationQueryDto,
  ResolveDepositVarianceDto,
  VerifyRiderDepositDto,
  VarianceCaseListQueryDto,
} from './dto/cash-control.dto';
import { CashControlService } from './cash-control.service';

@ApiTags('Rider Cash Control')
@ApiBearerAuth('JWT-auth')
@Controller('cash-control')
export class CashControlController {
  constructor(private readonly cashControl: CashControlService) {}

  @Get('me')
  @Roles(Role.RIDER)
  getMyCash(@CurrentUser() user: UserPayload) {
    return this.cashControl.getMyCash(user);
  }

  @Post('deposits/upload-url')
  @Roles(Role.RIDER)
  createUploadUrl(
    @Body() dto: DepositUploadUrlDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.cashControl.createUploadUrl(dto, user);
  }

  @Post('deposits')
  @Roles(Role.RIDER)
  submit(
    @Body() dto: CreateRiderDepositDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.cashControl.submit(dto, user);
  }

  @Get('deposits')
  @Roles(Role.RIDER, Role.STORE_ADMIN, Role.SUPER_ADMIN)
  list(
    @Query() query: DepositListQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.cashControl.list(query, user);
  }

  @Get('deposits/verification-queue')
  @Roles(Role.STORE_ADMIN, Role.SUPER_ADMIN)
  verificationQueue(
    @Query() query: DepositListQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.cashControl.listVerificationQueue(query, user);
  }

  @Get('deposits/variance-cases')
  @Roles(Role.RIDER, Role.STORE_ADMIN, Role.SUPER_ADMIN)
  varianceCases(
    @Query() query: VarianceCaseListQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.cashControl.listVarianceCases(query, user);
  }

  @Get('stores/:storeId/reconciliation')
  @Roles(Role.STORE_ADMIN, Role.SUPER_ADMIN)
  storeReconciliation(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Query() query: ReconciliationQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.cashControl.getStoreReconciliation(storeId, query, user);
  }

  @Get('deposits/:id/slip-url')
  @Roles(Role.RIDER, Role.STORE_ADMIN, Role.SUPER_ADMIN)
  createDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.cashControl.createDownloadUrl(id, user);
  }

  @Post('deposits/:id/verify')
  @Roles(Role.STORE_ADMIN, Role.SUPER_ADMIN)
  verify(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyRiderDepositDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.cashControl.verify(id, dto, user);
  }

  @Post('deposits/:id/variance/resolve')
  @Roles(Role.SUPER_ADMIN)
  resolveVariance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveDepositVarianceDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.cashControl.resolveVariance(id, dto, user);
  }
}
