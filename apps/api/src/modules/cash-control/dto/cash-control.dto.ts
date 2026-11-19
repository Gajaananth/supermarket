import { ApiProperty } from '@nestjs/swagger';
import { DepositStatus, DepositVarianceStatus } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class DepositUploadUrlDto {
  @ApiProperty({ enum: ['image/jpeg', 'image/png', 'application/pdf'] })
  @IsIn(['image/jpeg', 'image/png', 'application/pdf'])
  contentType!: string;

  @ApiProperty({ minimum: 1, maximum: 5242880 })
  @IsInt()
  @Min(1)
  @Max(5 * 1024 * 1024)
  contentLength!: number;
}

export class CreateRiderDepositDto {
  @ApiProperty({ minimum: 0.01, maximum: 99999999.99, example: 2500 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  amount!: number;

  @ApiProperty({ minLength: 4, maxLength: 100 })
  @IsString()
  @MinLength(4)
  @MaxLength(100)
  @Matches(/^[A-Za-z0-9][A-Za-z0-9._/-]{3,99}$/)
  bankRefNumber!: string;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  @Matches(/^rider-deposits\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|pdf)$/i)
  objectKey!: string;
}

export class VerifyRiderDepositDto {
  @ApiProperty({ enum: ['APPROVE', 'REJECT', 'VARIANCE'] })
  @IsIn(['APPROVE', 'REJECT', 'VARIANCE'])
  action!: 'APPROVE' | 'REJECT' | 'VARIANCE';

  @ApiProperty({ required: false, minLength: 3, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @Matches(/\S/)
  rejectionReason?: string;

  @ApiProperty({ required: false, minimum: 0, maximum: 99999999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  receivedAmount?: number;

  @ApiProperty({ required: false, minLength: 3, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @Matches(/\S/)
  varianceReason?: string;
}

export class ResolveDepositVarianceDto {
  @ApiProperty({ enum: ['ACCEPT_VARIANCE', 'REJECT_DEPOSIT'] })
  @IsIn(['ACCEPT_VARIANCE', 'REJECT_DEPOSIT'])
  action!: 'ACCEPT_VARIANCE' | 'REJECT_DEPOSIT';

  @ApiProperty({ minLength: 3, maxLength: 500 })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @Matches(/\S/)
  resolutionNote!: string;
}

export class VarianceCaseListQueryDto {
  @ApiProperty({ required: false, enum: DepositVarianceStatus })
  @IsOptional()
  @IsEnum(DepositVarianceStatus)
  status?: DepositVarianceStatus;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiProperty({ required: false, default: 50, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class ReconciliationQueryDto {
  @ApiProperty({ example: '2026-11-17', description: 'Store business date in Asia/Colombo' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;
}

export class DepositListQueryDto {
  @ApiProperty({ required: false, enum: DepositStatus })
  @IsOptional()
  @IsEnum(DepositStatus)
  status?: DepositStatus;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  riderId?: string;

  @ApiProperty({ required: false, default: 50, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
