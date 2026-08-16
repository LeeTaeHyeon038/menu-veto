/**
 * KPI 기록 자리.
 *
 * 이 프로젝트의 목적 중 하나는 "비선호를 먼저 제거하면 결과 수용률이 높아진다"는
 * 가설을 검증하는 것이다(PROJECT_OVERVIEW.md 9절). 그래서 화면을 만들 때부터
 * "언제·무엇을 기록할지"를 여기 한 곳에 모아 둔다.
 *
 * 기록은 두 곳으로 간다.
 *   1. localStorage — 개발 중에 눈으로 확인하기 위한 것
 *   2. Supabase events 테이블 — 실제 집계용 (5단계에서 추가)
 *
 * 화면 코드는 이 파일이 무엇을 하는지 몰라도 된다. 실제로 5단계에서
 * Supabase를 붙이면서 화면 코드는 한 줄도 고치지 않았다.
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

import { kpiClient } from "@/lib/supabase";

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

/**
 * 이벤트를 Supabase의 events 테이블 모양으로 바꾼다.
 * 컬럼 구성은 supabase/schema.sql과 1:1로 맞춘다. 한쪽을 바꾸면 다른 쪽도 바꿔야 한다.
 */
function toRow(event: KpiEvent) {
  return {
    session_id: sessionId,
    type: event.type,
    people_count: "peopleCount" in event ? event.peopleCount : null,
    turn: "turn" in event ? event.turn : null,
    menu_id: "menuId" in event ? event.menuId : null,
    attempt: "attempt" in event ? event.attempt : null,
    elapsed_ms: "elapsedMs" in event ? event.elapsedMs : null,
  };
}

export function logEvent(event: KpiEvent) {
  const logged: LoggedEvent = {
    ...event,
    sessionId,
    at: new Date().toISOString(),
  };

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

  // 전송은 기다리지 않는다. 사용자가 다음 화면으로 넘어가는 것을 막으면 안 된다.
  // 실패해도 서비스는 그대로 굴러가야 하므로 에러를 밖으로 던지지 않는다
  kpiClient
    ?.from("events")
    .insert(toRow(event))
    .then(({ error }) => {
      if (error && process.env.NODE_ENV !== "production") {
        console.warn("[KPI] 전송 실패:", error.message);
      }
    });
}
