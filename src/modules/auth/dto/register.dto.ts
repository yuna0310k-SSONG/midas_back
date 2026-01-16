import { IsEmail, IsString, MinLength, IsDateString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: '이메일 주소'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'password123',
    description: '비밀번호 (최소 6자)',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    example: '홍길동',
    description: '이름'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: '1990-01-01',
    description: '생년월일 (YYYY-MM-DD 형식)'
  })
  @IsDateString()
  birthDate: string; // YYYY-MM-DD 형식

  @ApiProperty({ 
    example: '010-1234-5678',
    description: '전화번호 (010-1234-5678 형식)'
  })
  @IsString()
  @Matches(/^01[0-9]-[0-9]{3,4}-[0-9]{4}$/, {
    message: '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)',
  })
  phone: string; // 010-1234-5678 형식
}
