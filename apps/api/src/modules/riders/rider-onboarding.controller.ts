import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApproveRiderKycDto,
  KycUploadUrlDto,
  RejectRiderKycDto,
  RiderKycReviewQueryDto,
  SubmitRiderKycDto,
  SuspendRiderDto,
} from './dto/rider-kyc.dto';
import { RiderOnboardingService } from './rider-onboarding.service';

@ApiTags('Rider Registration & KYC')
@Controller('riders')
export class RiderOnboardingController {
  constructor(private readonly riders: RiderOnboardingService) {}

  @Get('me/kyc')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.RIDER)
  @ApiOperation({ summary: 'Get the authenticated rider KYC status' })
  getMyStatus(@CurrentUser() user: UserPayload) {
    return this.riders.getMyStatus(user);
  }

  @Post('me/shift/start')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.RIDER)
  @ApiOperation({ summary: 'Start a shift for an approved rider with no cash restriction' })
  startShift(@CurrentUser() user: UserPayload) {
    return this.riders.startShift(user);
  }

  @Post('me/shift/stop')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.RIDER)
  @ApiOperation({ summary: 'Stop a shift when no active delivery is assigned' })
  stopShift(@CurrentUser() user: UserPayload) {
    return this.riders.stopShift(user);
  }

  @Post('me/kyc/upload-url')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.RIDER)
  @ApiOperation({ summary: 'Create a short-lived private URL for a KYC image upload' })
  @ApiResponse({ status: 201, description: 'Signed private upload URL and required headers' })
  @ApiResponse({ status: 400, description: 'Unsupported type or image exceeds 5 MB' })
  createUploadUrl(
    @Body() dto: KycUploadUrlDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.riders.createUploadUrl(dto, user);
  }

  @Post('me/kyc/submit')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.RIDER)
  @ApiOperation({ summary: 'Submit or resubmit bike details and scanned licence images' })
  @ApiResponse({ status: 201, description: 'KYC submitted for super-admin review' })
  @ApiResponse({ status: 400, description: 'Invalid, missing, or malware-infected image' })
  @ApiResponse({ status: 503, description: 'Private storage or malware scanner unavailable' })
  submitKyc(
    @Body() dto: SubmitRiderKycDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.riders.submitKyc(dto, user);
  }

  @Get('review-queue')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List riders awaiting KYC review' })
  reviewQueue(@Query() query: RiderKycReviewQueryDto) {
    return this.riders.reviewQueue(query);
  }

  @Get('review-queue/:riderId')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'View rider KYC details without exposing private object keys' })
  reviewDetails(@Param('riderId', ParseUUIDPipe) riderId: string) {
    return this.riders.reviewDetails(riderId);
  }

  @Get(':riderId/kyc/:documentType/url')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a short-lived private URL to review one KYC image' })
  documentUrl(
    @Param('riderId', ParseUUIDPipe) riderId: string,
    @Param('documentType') documentType: string,
  ) {
    return this.riders.documentUrl(riderId, documentType);
  }

  @Post(':riderId/approve')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve KYC, assign a store, and select rider type' })
  approve(
    @Param('riderId', ParseUUIDPipe) riderId: string,
    @Body() dto: ApproveRiderKycDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.riders.approve(riderId, dto, user);
  }

  @Post(':riderId/reject')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reject submitted KYC with a reason for resubmission' })
  reject(
    @Param('riderId', ParseUUIDPipe) riderId: string,
    @Body() dto: RejectRiderKycDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.riders.reject(riderId, dto, user);
  }

  @Post(':riderId/suspend')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Suspend an approved rider and revoke active sessions' })
  suspend(
    @Param('riderId', ParseUUIDPipe) riderId: string,
    @Body() dto: SuspendRiderDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.riders.suspend(riderId, dto, user);
  }
}
