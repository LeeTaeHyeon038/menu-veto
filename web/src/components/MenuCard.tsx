import type { Menu } from "@/lib/menus";

type Props = {
  menu: Menu;
  /** 이미 지워진 카드인지 */
  out?: boolean;
  /** 방금 지워진 카드인지 — 한 번만 애니메이션을 준다 */
  justOut?: boolean;
  /** 룰렛이 지금 이 카드를 지나가는 중인지 */
  highlighted?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

export default function MenuCard({
  menu,
  out,
  justOut,
  highlighted,
  onClick,
  disabled,
}: Props) {
  // 원래 누를 수 있는 카드인데 잠시 막아 둔 경우에만 흐리게 한다.
  // 처음부터 보여주기용인 카드(최종 선택 화면)까지 흐려지면 안 된다
  const dimmed = disabled && onClick !== undefined && !out;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || out || onClick === undefined}
      aria-label={out ? `${menu.name} (탈락)` : menu.name}
      className={[
        // 카드는 12px 모서리. 버튼(알약형)과 성격을 구분한다 (DESIGN.md 3절).
        // 최소 96px — 남의 폰을 급하게 누르는 상황이라 타깃을 크게 잡는다
        "flex min-h-24 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-4",
        "transition-all duration-200",
        justOut ? "animate-knock-out" : "",
        out
          ? // 탈락한 카드는 가라앉아야 하므로 그림자를 주지 않는다
            "bg-card-out border-card-out-border text-card-out-fg"
          : "bg-card border-card-border text-foreground shadow-card",
        onClick && !out ? "active:scale-95" : "",
        // 룰렛이 지나가는 카드는 확실히 튀어야 한다. 테두리만으로는 눈에 안 들어온다
        highlighted
          ? "border-brand-accent ring-4 ring-brand-accent scale-105 shadow-lift z-10 opacity-100"
          : "",
        dimmed && !highlighted ? "opacity-60" : "",
      ].join(" ")}
    >
      <span className={out ? "text-3xl grayscale opacity-40" : "text-3xl"}>
        {menu.emoji}
      </span>
      <span
        className={
          out ? "text-base font-semibold line-through" : "text-base font-semibold"
        }
      >
        {menu.name}
      </span>
      <span className="text-[11px] text-muted leading-tight text-center">
        {out ? "탈락" : menu.examples}
      </span>
    </button>
  );
}
