import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CartItemInputDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  storeProductId!: string;

  @ApiProperty({ minimum: 1, maximum: 1000 })
  @IsInt()
  @Min(1)
  @Max(1000)
  quantity!: number;
}

export class CartItemQuantityDto {
  @ApiProperty({ minimum: 1, maximum: 1000 })
  @IsInt()
  @Min(1)
  @Max(1000)
  quantity!: number;
}

export class CheckoutOrderDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  storeId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  deliveryAddressId!: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  deliveryZoneId?: string;

  @ApiProperty({ required: false, type: [String], maxItems: 10, description: 'Stackable campaign codes' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(/^[A-Za-z0-9][A-Za-z0-9_-]{2,39}$/, { each: true })
  campaignCodes?: string[];
}
