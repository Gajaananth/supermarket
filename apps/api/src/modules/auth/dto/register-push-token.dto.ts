import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterPushTokenDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  deviceId!: string;

  @ApiProperty({ minLength: 20, maxLength: 512 })
  @IsString()
  @MinLength(20)
  @MaxLength(512)
  @Matches(/^\S+$/)
  pushToken!: string;
}
