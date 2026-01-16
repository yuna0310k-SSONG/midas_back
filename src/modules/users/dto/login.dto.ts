import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: '이메일 주소'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'password123',
    description: '비밀번호'
  })
  @IsString()
  @MinLength(6)
  password: string;
}
