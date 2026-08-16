import type { Menu } from "@/lib/menus";

/**
 * 남은 후보 중 하나를 무작위로 고른다.
 *
 * 마지막에 사람이 직접 고르게 하지 않는 것이 이 서비스의 핵심이다.
 * 직접 고르게 하면 "이거 어때? → 난 별로" 하는 협상이 다시 시작되는데,
 * 그게 바로 이 서비스가 없애려던 상황이다 (기획안.md 3절).
 *
 * exceptId는 재선정에서 "방금 그거 말고"를 위해 쓴다.
 */
export function pickRandom(candidates: Menu[], exceptId?: string): Menu {
  const pool = candidates.filter((m) => m.id !== exceptId);
  const from = pool.length > 0 ? pool : candidates;

  return from[Math.floor(Math.random() * from.length)];
}
