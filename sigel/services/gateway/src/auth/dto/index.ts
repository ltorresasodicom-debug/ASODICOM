import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'ciudadano@ec.gob.ec' }) @IsEmail() email: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nombre?: string;
}

export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() mfaToken?: string;
}

export class RefreshDto {
  @ApiProperty() @IsString() refreshToken: string;
}

export class MfaConfirmDto {
  @ApiProperty({ example: '123456' }) @IsString() token: string;
}
