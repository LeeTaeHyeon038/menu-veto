import { MAX_PEOPLE, MENUS, MIN_PEOPLE } from "@/lib/menus";

type Props = {
  onStart: (peopleCount: number) => void;
};

/** 2 ~ 5명. 6명 이상은 남는 후보가 2개 이하라 "선택"이 무의미해진다 */
const OPTIONS = Array.from(
  { length: MAX_PEOPLE - MIN_PEOPLE + 1 },
  (_, i) => MIN_PEOPLE + i,
);

export default function StartScreen({ onStart }: Props) {
  return (
    // 이 화면에는 주요 버튼이 없다(인원 버튼 자체가 선택지). 그래서 세로 가운데 정렬
    <div className="animate-rise flex flex-1 flex-col justify-center gap-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">우리 뭐 먹지?</h1>
        <p className="mt-3 text-[15px] text-muted leading-relaxed">
          먹고 싶은 걸 고르지 말고,
          <br />
          <strong className="text-brand font-semibold">
            먹기 싫은 걸 하나씩 지우세요.
          </strong>
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-[13px] font-semibold text-muted">
          몇 명이서 먹나요?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onStart(n)}
              // 모든 버튼은 알약형. 예외 없음 (DESIGN.md 3절)
              className="min-h-16 rounded-full border border-card-border bg-card text-xl font-bold shadow-card transition-all duration-200 hover:border-brand-accent active:scale-95"
            >
              {n}명
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-[13px] text-muted">
          한 사람이 하나씩 지웁니다 · 핸드폰 하나를 돌려가며 사용하세요
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-[13px] font-semibold text-muted">
          오늘의 후보 {MENUS.length}가지
        </h2>
        <ul className="flex flex-wrap gap-2">
          {MENUS.map((m) => (
            <li
              key={m.id}
              className="rounded-full border border-border px-3 py-1.5 text-[13px] text-muted"
            >
              {m.emoji} {m.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
