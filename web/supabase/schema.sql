-- KPI 기록 테이블과 집계 뷰
--
-- Supabase 대시보드 > SQL Editor 에 이 파일 내용을 붙여넣고 실행한다.
-- 여러 번 실행해도 안전하도록 "없을 때만 만든다" / "바꿔치기" 형태로 썼다.
--
-- 컬럼 구성은 web/src/lib/kpi.ts 의 KpiEvent 타입과 1:1로 맞춘다.
-- 한쪽을 바꾸면 다른 쪽도 같이 바꿔야 한다.
--
-- ⚠️ 이 DB는 서비스를 굴리는 데이터가 아니다. 앱은 DB 없이도 완전히 동작한다.
--    여기 쌓이는 것은 "가설을 검증할 근거"뿐이다 (PROJECT_OVERVIEW.md 9절).

-- ---------------------------------------------------------------------------
-- 1. 이벤트 테이블
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id bigint generated always as identity primary key,

  -- 한 번의 메뉴 결정 = 한 세션. 브라우저가 만드는 무작위 값이다.
  -- 개인을 식별하지 않는다. 로그인이 없으므로 누구인지 알 방법 자체가 없다.
  session_id text not null,

  -- kpi.ts의 KpiEvent["type"]과 같아야 한다.
  -- 공개 키로 아무 값이나 넣는 것을 막기 위해 목록을 제한한다.
  type text not null check (
    type in (
      'session_start',
      'veto',
      'result_shown',
      'accepted',
      'rejected',
      'restart'
    )
  ),

  -- 이벤트 종류마다 채워지는 칸이 다르다. 안 쓰는 칸은 null로 둔다.
  people_count smallint,  -- session_start
  turn smallint,          -- veto (몇 번째 사람이었나)
  menu_id text,           -- veto / result_shown / accepted / rejected
  attempt smallint,       -- result_shown / accepted / rejected (1 = 첫 결과)
  elapsed_ms integer,     -- result_shown / accepted

  created_at timestamptz not null default now()
);

-- KPI는 전부 "세션 단위로 묶어서" 계산하므로 미리 준비해 둔다.
create index if not exists events_session_idx on public.events (session_id);
create index if not exists events_created_idx on public.events (created_at desc);

-- ---------------------------------------------------------------------------
-- 2. 권한 (GRANT) — 첫 번째 자물쇠
--
-- GRANT와 RLS는 층이 다르다. 둘 다 잠가야 한다.
--   GRANT : "이 역할이 이 *테이블*에 접근할 수 있나" — 건물 출입증
--   RLS   : "이 역할이 어떤 *행*을 다룰 수 있나"    — 방마다 걸린 자물쇠
--
-- 프로젝트를 만들 때 "Automatically expose new tables"를 켰든 껐든
-- 결과가 같아지도록, 여기서 명시적으로 회수한 뒤 필요한 것만 준다.
--
-- anon = 브라우저에서 공개 키로 접속하는 역할. 우리 앱이 이걸로 동작한다.
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

-- 일단 전부 회수한다. 기본값으로 select가 붙어 있었다면 여기서 떨어진다
revoke all on public.events from anon, authenticated;

-- 남기는 것은 insert 하나뿐. 읽기·수정·삭제 권한 자체를 주지 않는다
grant insert on public.events to anon, authenticated;

-- 집계 뷰에는 아무 권한도 주지 않는다. 대시보드에서만 본다

-- ---------------------------------------------------------------------------
-- 3. RLS(행 수준 보안) — 두 번째 자물쇠
--
-- ⚠️ 이전 프로젝트(공지 뷰어)와 방향이 정반대다.
--    저쪽: 공지는 공개 정보 → "누구나 읽기", 쓰기 금지
--    여기: 사용 기록     → "누구나 쓰기", 읽기 금지
--
-- 브라우저에 공개 키가 노출되므로, 읽기를 열어두면 남의 사용 기록을
-- 아무나 긁어갈 수 있다. 그래서 select 정책을 아예 만들지 않는다.
-- 기록을 보는 것은 Supabase 대시보드(관리자 권한)에서만 한다.
-- ---------------------------------------------------------------------------

alter table public.events enable row level security;

drop policy if exists "누구나 기록을 남길 수 있다" on public.events;
create policy "누구나 기록을 남길 수 있다"
  on public.events
  for insert
  to anon, authenticated
  with check (true);

-- select / update / delete 정책은 일부러 만들지 않는다.
-- 정책이 없으면 RLS가 전부 막는다.

-- ---------------------------------------------------------------------------
-- 4. 집계 뷰
--
-- security_invoker = on 을 붙인다. 이게 없으면 뷰가 만든 사람 권한으로 돌아서
-- 공개 키로도 뷰를 통해 원본 데이터를 읽을 수 있게 된다. RLS를 우회하는 셈이다.
-- ---------------------------------------------------------------------------

-- 세션 하나를 한 줄로 요약한다. 아래 KPI 뷰의 재료.
create or replace view public.kpi_session_summary
with (security_invoker = on) as
select
  session_id,
  min(created_at)                                    as started_at,
  max(people_count) filter (where type = 'session_start') as people_count,
  count(*) filter (where type = 'veto')              as veto_count,
  count(*) filter (where type = 'rejected')          as reject_count,
  -- accepted 이벤트가 있으면 끝까지 마친 세션이다
  bool_or(type = 'accepted')                         as completed,
  max(elapsed_ms) filter (where type = 'accepted')   as decision_ms,
  max(attempt) filter (where type = 'accepted')      as accepted_attempt
from public.events
group by session_id;

-- PROJECT_OVERVIEW.md 9절의 KPI 4개.
--
-- ⚠️ 이 숫자로 "랜덤 추천보다 낫다"고 말할 수 없다.
--    비교군(제거 없이 바로 랜덤 추천)을 앱에 넣지 않았기 때문이다.
--    말할 수 있는 것은 "우리 방식의 수치는 이렇다"까지다.
create or replace view public.kpi_summary
with (security_invoker = on) as
select
  count(*)                                      as 시작한_세션,
  count(*) filter (where completed)             as 완료한_세션,

  -- ④ 최종 결정 완료율
  round(100.0 * count(*) filter (where completed)
        / nullif(count(*), 0), 1)               as 완료율_퍼센트,

  -- ① 평균 메뉴 결정 시간 (연출에 쓴 시간은 앱에서 이미 빼고 보낸다)
  round(avg(decision_ms) filter (where completed) / 1000.0, 1)
                                                as 평균_결정시간_초,

  -- ② 첫 결과 수용률 — 완료한 세션 중 첫 결과를 바로 받아들인 비율
  round(100.0 * count(*) filter (where completed and accepted_attempt = 1)
        / nullif(count(*) filter (where completed), 0), 1)
                                                as 첫결과_수용률_퍼센트,

  -- ③ 재선정률
  round(100.0 * count(*) filter (where reject_count > 0)
        / nullif(count(*), 0), 1)               as 재선정률_퍼센트
from public.kpi_session_summary;

-- KPI 4개 밖의 덤. "어떤 카테고리가 가장 많이 탈락하는가".
-- 발표에서 이야깃거리가 된다.
create or replace view public.kpi_veto_ranking
with (security_invoker = on) as
select
  menu_id,
  count(*) as 탈락_횟수
from public.events
where type = 'veto'
group by menu_id
order by count(*) desc;
