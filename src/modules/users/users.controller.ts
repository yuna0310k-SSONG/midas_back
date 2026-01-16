import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('사용자')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: '내 정보 조회' })
  @ApiResponse({ 
    status: 200, 
    description: '사용자 정보 조회 성공',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        name: '홍길동',
        birth_date: '1990-01-01',
        phone: '010-1234-5678',
        role: 'user',
        profile_image: null
      }
    }
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Get('me')
  async getProfile(@GetUser() user: any) {
    const userData = await this.usersService.findById(user.userId || user.id);
    const { password: _, ...userWithoutPassword } = userData;
    return userWithoutPassword;
  }

  @ApiOperation({ summary: '회원정보 수정' })
  @ApiResponse({ 
    status: 200, 
    description: '회원정보 수정 성공',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        name: '홍길동',
        birth_date: '1990-01-01',
        phone: '010-1234-5678',
        role: 'user',
        profile_image: null
      }
    }
  })
  @ApiResponse({ status: 400, description: '유효성 검사 실패' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Put('me')
  async updateProfile(
    @GetUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(
      user.userId || user.id,
      updateUserDto,
    );
    return updatedUser;
  }

  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ 
    status: 200, 
    description: '회원 탈퇴 성공',
    schema: {
      example: {
        message: '회원 탈퇴가 완료되었습니다.'
      }
    }
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Delete('me')
  async deleteProfile(@GetUser() user: any) {
    return await this.usersService.delete(user.userId || user.id);
  }
}
