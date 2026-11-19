import { ApiProperty } from '@nestjs/swagger';
import { CampaignType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
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

export class CreateCampaignDto {
  @ApiProperty({ minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/\S/)
  name!: string;

  @ApiProperty({ required: false, format: 'uuid', description: 'Omit to make campaign available to all stores' })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiProperty({ required: false, example: 'SAVE10' })
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @IsString()
  @Matches(/^[A-Z0-9][A-Z0-9_-]{2,39}$/)
  code?: string;

  @ApiProperty({ enum: CampaignType })
  @IsEnum(CampaignType)
  type!: CampaignType;

  @ApiProperty({ minimum: 0, maximum: 99999999.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  value!: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 99999999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  minSubtotal?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 99999999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  maxDiscount?: number;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  startsAt!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  endsAt!: string;
}

export class UpdateCampaignDto {
  @ApiProperty({ required: false, minLength: 3, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/\S/)
  name?: string;

  @ApiProperty({ required: false, minimum: 0, maximum: 99999999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  value?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 99999999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  minSubtotal?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 99999999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  maxDiscount?: number;

  @ApiProperty({ required: false, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiProperty({ required: false, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CampaignListQueryDto {
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, default: 50, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
