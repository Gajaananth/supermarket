import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpdateStoreSettingsDto {
  @ApiProperty({ required: false, minimum: 0, maximum: 99999999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  minOrderAmount?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 99999999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  freeDeliveryThreshold?: number;

  @ApiProperty({ required: false, minimum: 0.01, maximum: 99999999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  cashHoldThreshold?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 168 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  cashHoldMaxHours?: number;

  @ApiProperty({ required: false, example: '07:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  openingTime?: string;

  @ApiProperty({ required: false, example: '22:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  closingTime?: string;

  @ApiProperty({ required: false, minimum: 0.1, maximum: 500 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.1)
  @Max(500)
  serviceRadiusKm?: number;
}

export class UpdateStoreStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}

export class UpdateDeliveryZonePricingDto {
  @ApiProperty({ required: false, minimum: 0, maximum: 99999999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  baseFee?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 99999999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  minOrderForFreeDelivery?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 1440 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  estimatedDeliveryMins?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
