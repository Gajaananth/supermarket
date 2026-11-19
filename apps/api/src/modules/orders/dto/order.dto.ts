import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  Matches,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ format: 'uuid', description: 'Store catalog row' })
  @IsUUID()
  storeProductId!: string;

  @ApiProperty({ minimum: 1, maximum: 1000 })
  @IsInt()
  @Min(1)
  @Max(1000)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  storeId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  deliveryAddressId!: string;

  @ApiProperty({ required: false, format: 'uuid', description: 'Optional confirmation of the auto-matched delivery zone' })
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

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique((item: CreateOrderItemDto) => item?.storeProductId)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

export class OrderListQueryDto {
  @ApiProperty({ required: false, enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

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

export class OrderNoteDto {
  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class OrderReasonDto {
  @ApiProperty({ minLength: 3, maxLength: 500 })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @Matches(/\S/)
  reason!: string;
}

export class AssignOrderRiderDto {
  @ApiProperty({ format: 'uuid', description: 'Rider profile ID' })
  @IsUUID()
  riderId!: string;
}

export class DeliverOrderDto {
  @ApiProperty({ example: 2500, minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999)
  collectedAmount!: number;
}
