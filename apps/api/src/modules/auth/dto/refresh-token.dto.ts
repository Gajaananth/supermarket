import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Rotating refresh token string' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-f0-9]{80}$/i)
  refreshToken!: string;

  @ApiProperty({ required: false, example: 'device-uuid-1234' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceId?: string;
}
