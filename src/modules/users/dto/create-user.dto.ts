import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsDateString, Matches } from 'class-validator';

export enum LoginType {
  LOCAL = 'local',
  KAKAO = 'kakao',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class CreateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  name: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  @Matches(/^01[0-9]-[0-9]{3,4}-[0-9]{4}$/, {
    message: '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)',
  })
  phone?: string;

  @IsEnum(LoginType)
  @IsOptional()
  loginType?: LoginType;

  @IsString()
  @IsOptional()
  kakaoId?: string;

  @IsEmail()
  @IsOptional()
  kakaoEmail?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
