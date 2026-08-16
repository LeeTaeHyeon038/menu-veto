"use client";

import { useState } from "react";
import MenuCard from "@/components/MenuCard";
import { josa } from "@/lib/korean";
import { MENUS, type Menu } from "@/lib/menus";

type Props = {
  peopleCount: number;
  /** 지금 몇 번째 사람 차례인지 (0부터) */
  turn: number;
  vetoedIds: string[];
  /** 카드를 지운 순간 */
  onVeto: (menu: Menu) => void;
  /** 다음 사람에게 넘어갈 때 */
  onAdvance: () => void;
};

export default function VetoScreen({
  peopleCount,
  turn,
  vetoedIds,
  onVeto,
  onAdvance,
}: Props) {
  // 방금 지운 카드. 이게 있으면 "넘겨주세요" 화면이 덮인다
  const [justVetoed, setJustVetoed] = useState<Menu | null>(null);

  const isLastPerson = turn + 1 >= peopleCount;

  function handlePick(menu: Menu) {
    setJustVetoed(menu);
    onVeto(menu);
  }

  function handleNext() {
    setJustVetoed(null);
    onAdvance();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="text-center">
        {/* 지금 누구 차례인지가 이 화면에서 가장 중요한 정보다 */}
        <p className="text-[13px] font-semibold text-brand">
          {turn + 1} / {peopleCount} 번째 사람
        </p>
        {/* 급하게 읽는 화면이라 줄바꿈 자리를 직접 정한다 */}
        <h1 className="mt-2 text-2xl font-bold leading-snug">
          오늘 <span className="text-brand">절대 먹기 싫은 것</span>
          <br />
          하나만 지워주세요
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MENUS.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            out={vetoedIds.includes(menu.id)}
            justOut={justVetoed?.id === menu.id}
            disabled={justVetoed !== null}
            onClick={() => handlePick(menu)}
          />
        ))}
      </div>

      <p className="mt-auto text-center text-[13px] text-muted">
        한 사람당 하나씩만 지울 수 있습니다
      </p>

      {justVetoed && (
        <div
          role="status"
          className="animate-rise fixed inset-0 z-10 flex flex-col bg-background/95 px-5 py-8 backdrop-blur-sm"
        >
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5">
            <p className="text-5xl grayscale opacity-50">{justVetoed.emoji}</p>
            <p className="text-center text-2xl font-bold">
              {justVetoed.name}
              {josa(justVetoed.name, "이", "가")} 탈락했습니다
            </p>
            {/* 문구 안의 줄바꿈(\n)을 살리려면 whitespace-pre-line이 필요하다 */}
            <p className="whitespace-pre-line text-center text-[15px] text-muted leading-relaxed">
              {isLastPerson
                ? "모두 지웠습니다. 결과를 볼까요?"
                : `다음 사람(${turn + 2}번)에게\n핸드폰을 넘겨주세요`}
            </p>
          </div>

          {/* 주요 버튼은 항상 화면 아래 같은 자리에 (DESIGN.md 4절) */}
          <button
            type="button"
            onClick={handleNext}
            className="mx-auto min-h-16 w-full max-w-md rounded-full bg-brand-accent text-lg font-bold text-brand-fg transition-all duration-200 active:scale-95 active:bg-brand-strong"
          >
            {isLastPerson ? "남은 메뉴 보기" : "넘겼어요"}
          </button>
        </div>
      )}
    </div>
  );
}
