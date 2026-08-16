/**
 * KPI 기록 자리.
 *
 * 이 프로젝트의 목적 중 하나는 "비선호를 먼저 제거하면 결과 수용률이 높아진다"는
 * 가설을 검증하는 것이다(PROJECT_OVERVIEW.md 9절). 그래서 화면을 만들 때부터
 * "언제·무엇을 기록할지"를 여기 한 곳에 모아 둔다.
 *
 * 지금(2단계)은 브라우저 안에만 쌓아 두고, 5단계에서 sendEvent 안에서
 * Supabase로 보내기만 하면 된다. 화면 코드는 고칠 필요가 없다.
 */

export type KpiEvent =
  /** 인원을 골라 시작한 순간. 결정 시간 측정의 시작점 */
  | { type: "session_start"; peopleCount: number }
  /** 한 사람이 카테고리 하나를 지웠을 때 */
  | { type: "veto"; turn: number; menuId: string }
  /** 최종 후보가 뽑혀 결과 화면이 보인 순간 */
  | { type: "result_shown"; menuId: string; attempt: number; elapsedMs: number }
  /** 결과를 받아들임 — 여기가 결정 시간 측정의 끝점 */
  | { type: "accepted"; menuId: string; attempt: number; elapsedMs: number }
  /** 결과를 거부하고 재선정 */
  | { type: "rejected"; menuId: string; attempt: number }
  /** 처음부터 다시 */
  | { type: "restart" };

type LoggedEvent = KpiEvent & {
  /** 한 번의 메뉴 결정 = 한 세션. 나중에 DB에서 묶어 보기 위한 키 */
  sessionId: string;
  at: string;
};

const STORAGE_KEY = "menu-veto:events";

let sessionId = "";

/**
 * crypto.randomUUID는 https나 localhost에서만 쓸 수 있다.
 * 핸드폰으로 http://192.168.x.x 에 접속해 테스트할 때는 없는 함수라 그냥 터진다.
 * KPI 기록 때문에 서비스가 멈추면 안 되므로 대충이라도 겹치지 않는 값을 만든다.
 */
function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 새 세션 시작. 인원을 고르는 순간 호출한다 */
export function startSession(): string {
  sessionId = makeId();
  return sessionId;
}

export function logEvent(event: KpiEvent) {
  const logged: LoggedEvent = {
    ...event,
    sessionId,
    at: new Date().toISOString(),
  };

  // 5단계에서 여기에 Supabase 전송을 넣는다. 그전까지는 눈으로 확인할 수 있게 남긴다
  if (process.env.NODE_ENV !== "production") {
    console.debug("[KPI]", logged);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: LoggedEvent[] = raw ? JSON.parse(raw) : [];
    all.push(logged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // 시크릿 모드 등에서 저장이 막혀도 서비스는 계속 돌아가야 한다
  }
}
