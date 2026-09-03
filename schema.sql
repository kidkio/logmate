-- ==============================================================================
-- "오늘 당신의 실패를 공유하세요" (Today's Failure)
-- Supabase PostgreSQL + pgvector 스키마 파일
-- ==============================================================================

-- 1. pgvector 확장 활성화 (벡터 검색용)
create extension if not exists vector;

-- 2. 실패 글 테이블 (failures)
create table if not exists public.failures (
    id text primary key,
    device_id text not null,
    user_id uuid references auth.users(id) on delete set null,
    content text not null check (length(content) between 5 and 500),
    category text not null,
    tags text[] default '{}',
    ai_comfort_quote text,
    embedding vector(768),
    reactions jsonb default '{"comfort": 0, "relate": 0, "kick": 0, "cheer": 0}'::jsonb,
    is_seed boolean default false,
    is_blinded boolean default false,
    report_count int default 0,
    created_at timestamp with time zone default now()
);

-- 인덱스 생성
create index if not exists idx_failures_created_at on public.failures(created_at desc);
create index if not exists idx_failures_category on public.failures(category);
create index if not exists idx_failures_device_id on public.failures(device_id);

-- 3. 리액션 로그 테이블 (중복 클릭 방지 및 토글용)
create table if not exists public.reactions (
    id uuid default gen_random_uuid() primary key,
    failure_id text references public.failures(id) on delete cascade,
    device_id text not null,
    reaction_type text not null check (reaction_type in ('comfort', 'relate', 'kick', 'cheer')),
    created_at timestamp with time zone default now(),
    unique(failure_id, device_id, reaction_type)
);

-- 4. 신고 테이블
create table if not exists public.reports (
    id uuid default gen_random_uuid() primary key,
    failure_id text references public.failures(id) on delete cascade,
    device_id text not null,
    reason text,
    created_at timestamp with time zone default now(),
    unique(failure_id, device_id)
);

-- 5. Row Level Security (RLS) 설정 (익명 읽기/쓰기 허용)
alter table public.failures enable row level security;
alter table public.reactions enable row level security;
alter table public.reports enable row level security;

create policy "누구나 실패 글 조회 가능" on public.failures for select using (is_blinded = false);
create policy "누구나 실패 글 작성 가능" on public.failures for insert with check (true);
create policy "누구나 리액션 조회 가능" on public.reactions for select using (true);
create policy "누구나 리액션 등록/취소 가능" on public.reactions for all using (true);
create policy "누구나 신고 등록 가능" on public.reports for insert with check (true);
