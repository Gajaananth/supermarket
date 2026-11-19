import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'Your admin password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ example: 'admin-portal-client' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  deviceId!: string;

  @ApiProperty({ required: false, example: 'Firefox / macOS' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  deviceInfo?: string;
}

export class AdminVerify2faDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: '123456', description: '6-digit 2FA OTP code' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]{6}$/)
  code!: string;

  @ApiProperty({ example: 'admin-portal-client' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  deviceId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  deviceInfo?: string;
}
