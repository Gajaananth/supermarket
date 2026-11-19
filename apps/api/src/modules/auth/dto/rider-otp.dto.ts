import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class RequestRiderOtpDto {
  @ApiProperty({
    example: '+94771110001',
    description: 'Rider mobile number (+94...) or registered email address',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(
    /^(?:\+94[0-9]{9}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})$/i,
    { message: 'Destination must be a Sri Lankan mobile number or valid email address' },
  )
  @MaxLength(100)
  destination!: string;
}

export class VerifyRiderOtpDto {
  @ApiProperty({
    example: '+94771110001',
    description: 'Registered Sri Lankan mobile number or email address',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(
    /^(?:\+94[0-9]{9}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})$/i,
    { message: 'Destination must be a Sri Lankan mobile number or valid email address' },
  )
  @MaxLength(100)
  destination!: string;

  @ApiProperty({ example: '123456', description: '6-digit numeric OTP' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]{6}$/)
  code!: string;

  @ApiProperty({ example: 'device-uuid-rider-01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  deviceId!: string;

  @ApiProperty({ required: false, example: 'BuyMe Rider App v1.0 (Pixel 7)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  deviceInfo?: string;
}

export class RequestRiderRegistrationOtpDto {
  @ApiProperty({ example: 'Nimal Perera' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  fullName!: string;

  @ApiProperty({ example: '+94771110001' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+94[0-9]{9}$/, {
    message: 'Phone must be a Sri Lankan mobile number in +94 format',
  })
  phone!: string;

  @ApiProperty({ required: false, example: 'nimal@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;
}

export class VerifyRiderRegistrationOtpDto extends RequestRiderRegistrationOtpDto {
  @ApiProperty({ example: '123456', description: '6-digit numeric OTP' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]{6}$/)
  code!: string;

  @ApiProperty({ example: 'device-uuid-rider-01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  deviceId!: string;

  @ApiProperty({ required: false, example: 'BuyMe Rider App v1.0' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  deviceInfo?: string;
}
