import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Cookies } from '../../common/decorators/cookies.decorator';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ 
    status: 201, 
    description: '회원가입 성공',
    schema: {
      example: {
        accessToken: 'eyJhbGc...',
        user: {
          id: 'uuid',
          email: 'user@example.com',
          name: '홍길동',
          role: 'user'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '유효성 검사 실패' })
  @ApiResponse({ status: 401, description: '이메일 중복' })
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.register(registerDto);

    // 리프레시 토큰을 HTTP-only 쿠키에 저장
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/',
    });

    return {
      accessToken,
      user,
    };
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ 
    status: 200, 
    description: '로그인 성공',
    schema: {
      example: {
        accessToken: 'eyJhbGc...',
        user: {
          id: 'uuid',
          email: 'user@example.com',
          name: '홍길동',
          role: 'user'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(loginDto);

    // 리프레시 토큰을 HTTP-only 쿠키에 저장
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/',
    });

    return {
      accessToken,
      user,
    };
  }

  @ApiOperation({ summary: '토큰 갱신' })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({ 
    status: 200, 
    description: '토큰 갱신 성공',
    schema: {
      example: {
        accessToken: 'eyJhbGc...'
      }
    }
  })
  @ApiResponse({ status: 401, description: '리프레시 토큰이 유효하지 않음' })
  @Post('refresh')
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    // 새로운 리프레시 토큰으로 쿠키 업데이트
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { accessToken };
  }

  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ 
    status: 200, 
    description: '로그아웃 성공',
    schema: {
      example: {
        message: '로그아웃되었습니다.'
      }
    }
  })
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // 쿠키에서 리프레시 토큰 삭제
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { message: '로그아웃되었습니다.' };
  }
}
