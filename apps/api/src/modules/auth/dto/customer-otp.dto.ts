import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class RequestCustomerOtpDto {
  @ApiProperty({ example: '+94772220001', description: 'Customer Sri Lankan mobile number in E.164 format' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+94[0-9]{9}$/, { message: 'Phone must be a valid Sri Lankan number starting with +94 followed by 9 digits' })
  phone!: string;
}

export class VerifyCustomerOtpDto {
  @ApiProperty({ example: '+94772220001' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+94[0-9]{9}$/)
  phone!: string;

  @ApiProperty({ example: '123456', description: '6-digit numeric OTP' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]{6}$/)
  code!: string;

  @ApiProperty({ example: 'device-uuid-1234', default: 'browser-client' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  deviceId!: string;

  @ApiProperty({ required: false, example: 'Chrome / Android 14' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  deviceInfo?: string;
}
