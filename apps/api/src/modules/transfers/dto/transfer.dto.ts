import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class TransferLineDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 20, minimum: 1 })
  @IsInt()
  @Min(1)
  requestedQuantity!: number;
}

export class CreateTransferDto {
  @ApiProperty({ format: 'uuid', description: 'Destination store' })
  @IsUUID()
  storeId!: string;

  @ApiProperty({ type: [TransferLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique((item: TransferLineDto) => item?.productId)
  @ValidateNested({ each: true })
  @Type(() => TransferLineDto)
  items!: TransferLineDto[];
}

export class ReceiveTransferLineDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 18, minimum: 0 })
  @IsInt()
  @Min(0)
  receivedQuantity!: number;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class ReceiveTransferDto {
  @ApiProperty({ type: [ReceiveTransferLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique((item: ReceiveTransferLineDto) => item?.productId)
  @ValidateNested({ each: true })
  @Type(() => ReceiveTransferLineDto)
  items!: ReceiveTransferLineDto[];
}

export class ResolveTransferLineDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ enum: ['WRITE_OFF', 'RETURN_TO_WAREHOUSE'] })
  @IsIn(['WRITE_OFF', 'RETURN_TO_WAREHOUSE'])
  resolution!: 'WRITE_OFF' | 'RETURN_TO_WAREHOUSE';
}

export class ResolveTransferDto {
  @ApiProperty({ minLength: 3, maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  resolutionNote!: string;

  @ApiProperty({ type: [ResolveTransferLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique((item: ResolveTransferLineDto) => item?.productId)
  @ValidateNested({ each: true })
  @Type(() => ResolveTransferLineDto)
  items!: ResolveTransferLineDto[];
}

export class TransferListQueryDto {
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiProperty({ required: false, enum: ['DRAFT', 'DISPATCHED', 'RECEIVED_FULL', 'RECEIVED_PARTIAL', 'RESOLVED', 'CANCELLED'] })
  @IsOptional()
  @IsIn(['DRAFT', 'DISPATCHED', 'RECEIVED_FULL', 'RECEIVED_PARTIAL', 'RESOLVED', 'CANCELLED'])
  status?: string;
}
