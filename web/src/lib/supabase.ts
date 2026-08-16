import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * KPI 기록을 "쓰기 위한" Supabase 연결.
 *
 * 이 키로 할 수 있는 일은 supabase/schema.sql의 RLS 정책이 허용한 것뿐이고,
 * 지금 허용된 것은 insert 하나뿐이다. 읽기는 정책 자체가 없어서 막혀 있다.
 *
 * NEXT_PUBLIC_ 접두사를 붙인 이유: KPI는 브라우저에서 일어나는 일을 기록하므로
 * 키가 브라우저까지 내려가야 한다. 이전 프로젝트(서버에서만 읽던 공지)와 다른 점이다.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 환경변수가 없을 때 어떻게 할 것인가 — 여기가 판단이 필요한 지점이다.
 *
 * 이전 프로젝트에서는 "환경변수가 없으면 바로 멈추게 만들 것"이 교훈이었다.
 * 데이터가 비면 "공지 0건인 멀쩡해 보이는 사이트"가 배포되기 때문이다.
 *
 * 여기서는 반대로 간다. KPI는 부수 기능이고, 기록이 안 된다고 해서
 * 메뉴를 못 정하게 만들면 안 된다. 기준은 이렇다:
 *   데이터가 비면 서비스가 거짓말을 하는 경우 → 멈춘다
 *   기록만 안 남는 경우                      → 계속 간다
 *
 * 대신 조용히 넘어가지는 않는다. 개발 중에는 콘솔에 크게 경고해서
 * "설정을 깜빡한 채로 배포"하는 사고를 막는다.
 */
function createKpiClient(): SupabaseClient | null {
  if (!url || !key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[KPI] Supabase 환경변수가 없어 기록을 보내지 않습니다. " +
          "web/.env.example을 복사해 web/.env를 만들고 값을 채우세요. " +
          "(배포는 Vercel 프로젝트 설정 > Environment Variables)",
      );
    }
    return null;
  }

  return createClient(url, key, {
    auth: {
      // 로그인이 없는 서비스다. 세션을 저장하거나 갱신할 이유가 없다
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const kpiClient = createKpiClient();
