# MIDAS 한의원 API 문서

## 기본 정보

- **Base URL**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/api`
- **CORS**: `http://localhost:3001` (프론트엔드 URL)
- **Content-Type**: `application/json`

## 인증 방식

### 토큰 관리
- **Access Token**: 메모리에 저장 (클라이언트에서 관리)
- **Refresh Token**: HTTP-only 쿠키에 자동 저장 (서버에서 관리)
- **토큰 형식**: `Bearer {accessToken}`

### 인증 헤더
```
Authorization: Bearer {accessToken}
```

---

## API 엔드포인트

### 1. 인증 (Authentication)

#### 1.1 회원가입
```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "birthDate": "1990-01-01",
  "phone": "010-1234-5678"
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "role": "user"
  }
}
```

**에러 응답:**
- `400`: 유효성 검사 실패
- `401`: 이메일 중복

**참고:**
- Refresh Token은 자동으로 HTTP-only 쿠키에 저장됨
- Access Token은 응답 body에서 받아서 메모리에 저장

---

#### 1.2 로그인
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "role": "user"
  }
}
```

**에러 응답:**
- `401`: 인증 실패 (이메일 또는 비밀번호 오류)

**참고:**
- Refresh Token은 자동으로 HTTP-only 쿠키에 저장됨
- Access Token은 응답 body에서 받아서 메모리에 저장

---

#### 1.3 토큰 갱신
```
POST /auth/refresh
```

**Request:**
- 쿠키에 `refreshToken`이 자동으로 포함됨 (HTTP-only)
- 별도의 헤더나 body 불필요

**Response (200):**
```json
{
  "accessToken": "eyJhbGc..."
}
```

**에러 응답:**
- `400`: Refresh token not found
- `401`: 리프레시 토큰이 유효하지 않음

**참고:**
- 새로운 Refresh Token이 자동으로 쿠키에 업데이트됨
- Access Token을 메모리에 업데이트

---

#### 1.4 로그아웃
```
POST /auth/logout
```

**Request:**
- 인증 불필요 (쿠키만 삭제)

**Response (200):**
```json
{
  "message": "로그아웃되었습니다."
}
```

**참고:**
- Refresh Token 쿠키가 자동으로 삭제됨
- 클라이언트에서 Access Token도 메모리에서 삭제해야 함

---

### 2. 사용자 (Users)

**모든 엔드포인트는 JWT 인증 필요**

#### 2.1 내 정보 조회
```
GET /users/me
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "홍길동",
  "birth_date": "1990-01-01",
  "phone": "010-1234-5678",
  "role": "user",
  "profile_image": null
}
```

**에러 응답:**
- `401`: 인증 실패 (토큰이 유효하지 않음)

---

#### 2.2 회원정보 수정
```
PUT /users/me
Authorization: Bearer {accessToken}
```

**Request Body (모든 필드 선택사항):**
```json
{
  "email": "newemail@example.com",
  "password": "newpassword123",
  "name": "홍길동",
  "birthDate": "1990-01-01",
  "phone": "010-9876-5432",
  "profileImage": "https://example.com/profile.jpg"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "newemail@example.com",
  "name": "홍길동",
  "birth_date": "1990-01-01",
  "phone": "010-9876-5432",
  "role": "user",
  "profile_image": "https://example.com/profile.jpg"
}
```

**에러 응답:**
- `400`: 유효성 검사 실패
- `401`: 인증 실패

**참고:**
- 수정하고 싶은 필드만 보내면 됨
- 비밀번호는 해시화되어 저장됨

---

#### 2.3 회원 탈퇴
```
DELETE /users/me
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "message": "회원 탈퇴가 완료되었습니다."
}
```

**에러 응답:**
- `401`: 인증 실패

---

## 프론트엔드 구현 가이드

### 1. API 클라이언트 설정

```typescript
// api/client.ts
const API_BASE_URL = 'http://localhost:3000';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 자동 전송
  headers: {
    'Content-Type': 'application/json',
  },
});

// Access Token 인터셉터
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // 또는 메모리 저장
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 토큰 갱신 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 토큰 갱신 시도
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        // 새로운 Access Token 저장
        localStorage.setItem('accessToken', data.accessToken);
        
        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### 2. 인증 상태 관리

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 앱 시작 시 저장된 토큰 확인
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      // 사용자 정보 조회
      fetchUserInfo(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await apiClient.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      // 토큰이 유효하지 않으면 삭제
      localStorage.removeItem('accessToken');
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  };

  const register = async (userData: RegisterData) => {
    const response = await apiClient.post('/auth/register', userData);
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  };

  const logout = async () => {
    await apiClient.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  return {
    accessToken,
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!accessToken,
  };
};
```

### 3. 라우터 설정 예시

```typescript
// App.tsx 또는 router 설정
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// 라우터 설정
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### 4. 주요 페이지 구현 예시

#### 로그인 페이지
```typescript
// pages/LoginPage.tsx
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/profile');
    } catch (error) {
      // 에러 처리
    }
  };
  
  // ...
};
```

#### 회원가입 페이지
```typescript
// pages/RegisterPage.tsx
const RegisterPage = () => {
  const { register } = useAuth();
  
  const handleSubmit = async (data: {
    email: string;
    password: string;
    name: string;
    birthDate: string;
    phone: string;
  }) => {
    try {
      await register(data);
      navigate('/profile');
    } catch (error) {
      // 에러 처리
    }
  };
  
  // ...
};
```

#### 프로필 페이지
```typescript
// pages/ProfilePage.tsx
const ProfilePage = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      <p>{user?.phone}</p>
      <p>{user?.birth_date}</p>
      <Link to="/profile/edit">수정하기</Link>
    </div>
  );
};
```

#### 프로필 수정 페이지
```typescript
// pages/EditProfilePage.tsx
const EditProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (data: UpdateUserData) => {
    try {
      await apiClient.put('/users/me', data);
      navigate('/profile');
    } catch (error) {
      // 에러 처리
    }
  };
  
  // ...
};
```

---

## 데이터 형식

### 날짜 형식
- **생년월일**: `YYYY-MM-DD` (예: `1990-01-01`)

### 전화번호 형식
- **패턴**: `01X-XXXX-XXXX` 또는 `01X-XXX-XXXX`
- **예시**: `010-1234-5678`, `010-123-4567`

### 이메일 형식
- 표준 이메일 형식

### 비밀번호
- 최소 6자 이상

---

## 에러 처리

### 공통 에러 응답 형식
```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request"
}
```

### 주요 에러 코드
- `400`: 잘못된 요청 (유효성 검사 실패)
- `401`: 인증 실패 (토큰이 유효하지 않음)
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 내부 오류

---

## 주의사항

1. **Access Token 저장**
   - 메모리 또는 localStorage에 저장
   - 민감한 정보이므로 XSS 공격에 주의

2. **Refresh Token**
   - HTTP-only 쿠키에 자동 저장/삭제
   - 클라이언트에서 직접 접근 불가

3. **CORS 설정**
   - 현재 `http://localhost:3001`로 설정됨
   - 프로덕션 환경에서는 실제 프론트엔드 URL로 변경 필요

4. **토큰 갱신**
   - Access Token 만료 시 자동으로 Refresh Token으로 갱신
   - 인터셉터에서 자동 처리 권장

5. **요청 시 쿠키 전송**
   - `withCredentials: true` 설정 필수 (Axios)
   - 또는 `credentials: 'include'` (Fetch API)

---

## Swagger 문서

모든 API는 Swagger UI에서 확인 및 테스트 가능합니다:
- URL: `http://localhost:3000/api`
- 인증: 우측 상단 "Authorize" 버튼 클릭 후 토큰 입력
