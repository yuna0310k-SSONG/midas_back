import { IsEmail, IsString, MinLength, IsOptional, IsDateString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: '이메일 주소 (선택사항)',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    example: 'newpassword123',
    description: '비밀번호 (최소 6자, 선택사항)',
    minLength: 6,
    required: false
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ 
    example: '홍길동',
    description: '이름 (선택사항)',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    example: '1990-01-01',
    description: '생년월일 (YYYY-MM-DD 형식, 선택사항)',
    required: false
  })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({ 
    example: '010-1234-5678',
    description: '전화번호 (010-1234-5678 형식, 선택사항)',
    required: false
  })
  @IsString()
  @IsOptional()
  @Matches(/^01[0-9]-[0-9]{3,4}-[0-9]{4}$/, {
    message: '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)',
  })
  phone?: string;

  @ApiProperty({ 
    example: 'https://example.com/profile.jpg',
    description: '프로필 이미지 URL (선택사항)',
    required: false
  })
  @IsString()
  @IsOptional()
  profileImage?: string;
}
