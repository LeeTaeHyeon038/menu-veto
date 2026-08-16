import { formatDuration } from "@/lib/format";
import type { Menu } from "@/lib/menus";

type Props = {
  menu: Menu;
  elapsedMs: number;
  /** 아직 재선정 기회가 남았는지 */
  canReroll: boolean;
  /** 결과를 받아들였는지 — 받아들이면 마무리 화면으로 바뀐다 */
  accepted: boolean;
  onAccept: () => void;
  onReject: () => void;
  onRestart: () => void;
};

/**
 * 이 화면만 결과 존(--house) 위에 올라간다. 배경은 page.tsx가 칠하고
 * 여기서는 결과 존 위에서 읽히는 색만 쓴다 (DESIGN.md 1절·7절).
 */
export default function ResultScreen({
  menu,
  elapsedMs,
  canReroll,
  accepted,
  onAccept,
  onReject,
  onRestart,
}: Props) {
  // 결과 존 위의 보조 버튼: 투명 + 옅은 테두리
  const secondaryButton =
    "min-h-14 rounded-full border border-house-muted text-base font-semibold transition-all duration-200 active:scale-95";

  return (
    <div className="flex flex-1 flex-col gap-8 text-house-fg">
      <header className="flex flex-1 flex-col justify-center text-center">
        <p className="text-[13px] font-semibold text-house-muted">
          {accepted ? "결정 완료" : "오늘의 메뉴는"}
        </p>
        {/* key를 메뉴 id로 두면 재선정 때도 등장 애니메이션이 다시 돈다 */}
        <div key={menu.id} className="animate-pop mt-4">
          <p className="text-7xl">{menu.emoji}</p>
          <h1 className="mt-3 text-4xl font-bold">{menu.name}</h1>
          <p className="mt-2 text-[15px] text-house-muted">{menu.examples}</p>
        </div>

        <p className="mt-8 text-[15px] text-house-muted">
          정하는 데 걸린 시간{" "}
          <strong className="font-semibold text-house-fg">
            {formatDuration(elapsedMs)}
          </strong>
        </p>
      </header>

      {/* 주요 버튼은 항상 화면 아래 같은 자리에 (DESIGN.md 6절) */}
      {accepted ? (
        <div className="mt-auto flex flex-col gap-3">
          <p className="text-center text-lg font-semibold">맛있게 드세요! 🎉</p>
          <button type="button" onClick={onRestart} className={secondaryButton}>
            처음부터 다시
          </button>
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-3">
          {/* 결과 존에서도 주황을 채운다. "누르면 되는 것"의 색이 화면마다 같아야 한다 */}
          <button
            type="button"
            onClick={onAccept}
            className="min-h-16 rounded-full bg-brand-accent text-lg font-bold text-brand-fg transition-all duration-200 active:scale-95 active:bg-brand-strong"
          >
            좋아, 먹으러 가자
          </button>

          {/* 재선정은 딱 한 번만. 무한 거부를 허용하면 "정해준다"는 약속이 깨진다.
              거부는 정상적인 선택지이므로 글자만 빨갛게 하고 배경은 칠하지 않는다 */}
          {canReroll ? (
            <button
              type="button"
              onClick={onReject}
              className={`${secondaryButton} text-danger-on-house`}
            >
              이건 진짜 못 먹겠어 (한 번만 가능)
            </button>
          ) : (
            <p className="text-center text-[13px] leading-relaxed text-house-muted">
              재선정은 한 번만 쓸 수 있어요.
              <br />
              오늘은 여기까지 —
            </p>
          )}
        </div>
      )}
    </div>
  );
}
