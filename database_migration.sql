-- Users 테이블에 birth_date와 phone 컬럼 추가
-- Supabase SQL Editor에서 실행하세요
-- 
-- 실행 방법:
-- 1. Supabase Dashboard 접속
-- 2. SQL Editor 메뉴 선택
-- 3. 아래 SQL을 복사하여 실행

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- 컬럼 추가 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('birth_date', 'phone');
