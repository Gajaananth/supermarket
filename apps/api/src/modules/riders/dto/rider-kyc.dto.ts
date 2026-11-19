import { RiderType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class KycUploadUrlDto {
  @ApiProperty({ enum: ['image/jpeg', 'image/png', 'image/webp'] })
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  contentType!: string;

  @ApiProperty({ example: 250000, description: 'File size in bytes; maximum 5 MB' })
  @IsInt()
  @Min(1)
  @Max(5 * 1024 * 1024)
  contentLength!: number;
}

export class SubmitRiderKycDto {
  @ApiProperty({ example: 'BATT-1234' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  bikeNumber!: string;

  @ApiProperty({ example: 'rider-kyc/uuid/document-uuid.jpg' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  drivingLicenceObjectKey!: string;

  @ApiProperty({ example: 'rider-kyc/uuid/document-uuid.webp' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  vehicleLicenceObjectKey!: string;
}

export class RiderKycReviewQueryDto {
  @ApiProperty({ type: Number, required: false, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page!: number;

  @ApiProperty({ type: Number, required: false, minimum: 1, maximum: 100, default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize!: number;
}

export class ApproveRiderKycDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  storeId!: string;

  @ApiProperty({ enum: RiderType })
  @IsEnum(RiderType)
  riderType!: RiderType;
}

export class RejectRiderKycDto {
  @ApiProperty({ example: 'The licence photo is not readable' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  reason!: string;
}

export class SuspendRiderDto {
  @ApiProperty({ example: 'Repeated delivery policy violations' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  reason!: string;
}
