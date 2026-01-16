import { Injectable, Inject, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private supabase: SupabaseClient,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, birthDate, phone, loginType, role, kakaoId, kakaoEmail, profileImage, ...userData } = createUserDto;

    // 비밀번호 해시화
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // insert 데이터 구성 (컬럼이 존재하는 경우에만 포함)
    const insertData: any = {
      ...userData,
      password: hashedPassword,
      login_type: loginType ? String(loginType) : 'local',
      role: role ? String(role) : 'user',
    };

    // birth_date 컬럼이 있는 경우에만 추가
    if (birthDate) {
      insertData.birth_date = birthDate;
    }

    // phone 컬럼이 있는 경우에만 추가
    if (phone) {
      insertData.phone = phone;
    }

    // kakao 관련 필드 추가
    if (kakaoId) {
      insertData.kakao_id = kakaoId;
    }
    if (kakaoEmail) {
      insertData.kakao_email = kakaoEmail;
    }
    if (profileImage) {
      insertData.profile_image = profileImage;
    }

    const { data, error } = await this.supabase
      .from('users')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new BadRequestException(`Failed to create user: ${error.message}`);
    }

    // 비밀번호 제외하고 반환
    const { password: _, ...user } = data;
    return user;
  }

  async findByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 사용자를 찾을 수 없음
      }
      console.error('Supabase error:', error);
      throw new InternalServerErrorException(`Failed to find user: ${error.message}`);
    }

    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('User not found');
      }
      console.error('Supabase error:', error);
      throw new InternalServerErrorException(`Failed to find user: ${error.message}`);
    }

    return data;
  }

  async findByKakaoId(kakaoId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('kakao_id', kakaoId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Supabase error:', error);
      throw new InternalServerErrorException(`Failed to find user: ${error.message}`);
    }

    return data;
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async update(id: string, updateData: any) {
    const { password, birthDate, phone, profileImage, ...userData } = updateData;

    // 업데이트 데이터 구성
    const updatePayload: any = { ...userData };

    // 비밀번호가 제공된 경우 해시화
    if (password) {
      updatePayload.password = await bcrypt.hash(password, 10);
    }

    // birth_date 컬럼이 있는 경우에만 추가
    if (birthDate !== undefined) {
      updatePayload.birth_date = birthDate;
    }

    // phone 컬럼이 있는 경우에만 추가
    if (phone !== undefined) {
      updatePayload.phone = phone;
    }

    // profile_image 컬럼이 있는 경우에만 추가
    if (profileImage !== undefined) {
      updatePayload.profile_image = profileImage;
    }

    const { data, error } = await this.supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new BadRequestException(`Failed to update user: ${error.message}`);
    }

    // 비밀번호 제외하고 반환
    const { password: _, ...user } = data;
    return user;
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw new InternalServerErrorException(`Failed to delete user: ${error.message}`);
    }

    return { message: '회원 탈퇴가 완료되었습니다.' };
  }
}
