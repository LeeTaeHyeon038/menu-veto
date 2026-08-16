"use client";

import { useEffect, useRef, useState } from "react";
import MenuCard from "@/components/MenuCard";
import type { Menu } from "@/lib/menus";
import { pickRandom } from "@/lib/pick";

type Props = {
  remaining: Menu[];
  /**
   * 룰렛이 멈춘 뒤 호출된다.
   * spentMs는 연출에 쓴 시간 — 결정 시간(KPI ①)에서 빼기 위해 함께 넘긴다.
   */
  onDecide: (chosen: Menu, spentMs: number) => void;
};

/** 룰렛이 카드 사이를 몇 바퀴 돌지 */
const LAPS = 3;

/**
 * i번째 칸에 머무는 시간. 뒤로 갈수록 느려져야 "멈췄다"는 느낌이 난다.
 * 등속으로 돌다 뚝 끊기면 그냥 깜빡인 것처럼 보인다.
 */
function stepDelay(i: number, total: number): number {
  const progress = total > 1 ? i / (total - 1) : 1;
  return 55 + 260 * progress ** 3;
}

export default function ReadyScreen({ remaining, onDecide }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 화면을 벗어날 때 예약된 타이머가 남으면 안 된다
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleDecide() {
    if (spinning) return;

    const chosen = pickRandom(remaining);

    // 움직임을 불편해하는 사용자에게는 연출을 건너뛴다
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      onDecide(chosen, 0);
      return;
    }

    const winnerIndex = remaining.findIndex((m) => m.id === chosen.id);
    // 0번 칸에서 출발해 LAPS바퀴를 돈 뒤 당첨 칸에서 멈추도록 걸음 수를 맞춘다
    const totalSteps = LAPS * remaining.length + winnerIndex;
    const startedAt = Date.now();

    setSpinning(true);

    const step = (i: number) => {
      setHighlightIndex(i % remaining.length);

      if (i >= totalSteps) {
        // 당첨 칸에 멈춘 상태를 잠깐 보여준 뒤 결과 화면으로 넘어간다
        timerRef.current = setTimeout(() => {
          onDecide(chosen, Date.now() - startedAt);
        }, 700);
        return;
      }

      timerRef.current = setTimeout(
        () => step(i + 1),
        stepDelay(i, totalSteps),
      );
    };

    step(0);
  }

  return (
    <div className="animate-rise flex flex-1 flex-col gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold leading-snug">
          모두가 먹을 수 있는
          <br />
          메뉴만 남았습니다
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          {spinning
            ? "이 중에서 하나를 뽑는 중…"
            : `아무도 싫다고 하지 않은 ${remaining.length}가지입니다`}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {remaining.map((menu, i) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            highlighted={highlightIndex === i}
          />
        ))}
      </div>

      {/* 후보가 3개든 6개든 버튼이 늘 같은 자리에 오도록 바닥에 붙인다 */}
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <button
          type="button"
          onClick={handleDecide}
          disabled={spinning}
          className="min-h-16 rounded-full bg-brand-accent text-lg font-bold text-brand-fg transition-all duration-200 enabled:active:scale-95 enabled:active:bg-brand-strong disabled:opacity-70"
        >
          {spinning ? "고르는 중…" : "최종 결정하기"}
        </button>

        {/* 왜 직접 못 고르는지 설명이 없으면 "왜 안 눌리지?"가 반복된다 */}
        <p className="text-center text-[13px] text-muted leading-relaxed">
          남은 메뉴 중에서 무작위로 정합니다.
          <br />
          고르는 순간부터는 다시 협상하지 않기 위한 규칙이에요.
        </p>
      </div>
    </div>
  );
}
