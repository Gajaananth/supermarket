import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ example: 25, description: 'Signed change to physical on-hand stock' })
  @IsInt()
  @Min(-1000000)
  @Max(1000000)
  quantityDelta!: number;

  @ApiProperty({ minLength: 3, maxLength: 500 })
  @IsString()
  @MaxLength(500)
  reason!: string;
}

export class UpdateReorderLevelDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  @Max(1000000)
  reorderLevel!: number;
}

export class UpdateStoreCatalogDto {
  @ApiProperty({ required: false, example: 1299.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999)
  customPrice?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000000)
  reorderLevel?: number;
}

export class StoreCatalogQueryDto {
  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  query?: string;
}
