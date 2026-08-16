"use client";

import { useRef, useState } from "react";
import ReadyScreen from "@/components/ReadyScreen";
import ResultScreen from "@/components/ResultScreen";
import StartScreen from "@/components/StartScreen";
import VetoScreen from "@/components/VetoScreen";
import { logEvent, startSession } from "@/lib/kpi";
import { MAX_REROLL, MENUS, type Menu } from "@/lib/menus";
import { pickRandom } from "@/lib/pick";

type Phase = "start" | "veto" | "ready" | "result";

export default function Page() {
  const [phase, setPhase] = useState<Phase>("start");
  const [peopleCount, setPeopleCount] = useState(0);
  const [turn, setTurn] = useState(0);
  const [vetoedIds, setVetoedIds] = useState<string[]>([]);
  const [picked, setPicked] = useState<Menu | null>(null);
  /** 몇 번째 결과인지. 1 = 첫 결과, 2 = 재선정 결과 */
  const [attempt, setAttempt] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // 결정 시간(KPI ①)의 시작점. 화면을 다시 그려도 유지돼야 하므로 ref에 둔다
  const startedAtRef = useRef(0);
  /**
   * 룰렛 연출처럼 사용자가 고민한 게 아니라 그냥 흘려보낸 시간.
   * 이걸 빼지 않으면 연출을 화려하게 만들수록 KPI ①이 나빠 보인다
   */
  const overheadMsRef = useRef(0);

  const remaining = MENUS.filter((m) => !vetoedIds.includes(m.id));

  /** 시작 이후 실제로 "정하는 데" 쓴 시간 */
  function decisionElapsedMs() {
    return Date.now() - startedAtRef.current - overheadMsRef.current;
  }

  function handleStart(count: number) {
    startSession();
    startedAtRef.current = Date.now();
    overheadMsRef.current = 0;
    logEvent({ type: "session_start", peopleCount: count });

    setPeopleCount(count);
    setTurn(0);
    setVetoedIds([]);
    setPicked(null);
    setAttempt(0);
    setAccepted(false);
    setElapsedMs(0);
    setPhase("veto");
  }

  function handleVeto(menu: Menu) {
    setVetoedIds((prev) => [...prev, menu.id]);
    logEvent({ type: "veto", turn: turn + 1, menuId: menu.id });
  }

  function handleAdvance() {
    if (turn + 1 >= peopleCount) {
      setPhase("ready");
      return;
    }
    setTurn((prev) => prev + 1);
  }

  function handleDecide(chosen: Menu, spentMs: number) {
    overheadMsRef.current += spentMs;
    const elapsed = decisionElapsedMs();

    setPicked(chosen);
    setAttempt(1);
    setElapsedMs(elapsed);
    setPhase("result");
    logEvent({
      type: "result_shown",
      menuId: chosen.id,
      attempt: 1,
      elapsedMs: elapsed,
    });
  }

  function handleAccept() {
    if (!picked) return;

    const elapsed = decisionElapsedMs();
    setElapsedMs(elapsed);
    setAccepted(true);
    logEvent({
      type: "accepted",
      menuId: picked.id,
      attempt,
      elapsedMs: elapsed,
    });
  }

  function handleReject() {
    if (!picked) return;

    logEvent({ type: "rejected", menuId: picked.id, attempt });

    const next = pickRandom(remaining, picked.id);
    const nextAttempt = attempt + 1;
    const elapsed = decisionElapsedMs();

    setPicked(next);
    setAttempt(nextAttempt);
    setElapsedMs(elapsed);
    logEvent({
      type: "result_shown",
      menuId: next.id,
      attempt: nextAttempt,
      elapsedMs: elapsed,
    });
  }

  function handleRestart() {
    logEvent({ type: "restart" });
    setPhase("start");
  }

  return (
    // 결과 화면만 결과 존 위에 올린다. 존은 콘텐츠 폭(448px)이 아니라
    // 화면 전체를 덮어야 한다. 가운데만 색이 다르면 "구간"이 아니라 "박스"로 보인다
    <div
      className={`flex flex-1 flex-col transition-colors duration-300 ${
        phase === "result" ? "bg-house" : ""
      }`}
    >
      {/*
       * justify-center를 주지 않는다. 각 화면이 주요 버튼을 mt-auto로 바닥에 붙여
       * 후보 수와 무관하게 버튼이 늘 같은 자리에 오게 하기 위해서다 (DESIGN.md 6절)
       */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8">
        {phase === "start" && <StartScreen onStart={handleStart} />}

        {phase === "veto" && (
          <VetoScreen
            peopleCount={peopleCount}
            turn={turn}
            vetoedIds={vetoedIds}
            onVeto={handleVeto}
            onAdvance={handleAdvance}
          />
        )}

        {phase === "ready" && (
          <ReadyScreen remaining={remaining} onDecide={handleDecide} />
        )}

        {phase === "result" && picked && (
          <ResultScreen
            menu={picked}
            elapsedMs={elapsedMs}
            canReroll={attempt <= MAX_REROLL}
            accepted={accepted}
            onAccept={handleAccept}
            onReject={handleReject}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}
