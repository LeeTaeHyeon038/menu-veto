/**
 * 후보는 개별 음식명이 아니라 카테고리 8개다.
 * 개별 음식명(짜장면·마라탕…)으로 하면 후보가 너무 많아 "지우기"가 끝나지 않는다.
 * 이 판단 근거는 기획안.md 6절 · 18절(V1 → V2) 참고.
 */
export type Menu = {
  id: string;
  name: string;
  emoji: string;
  /** 카테고리 이름만으로는 뭐가 들어가는지 애매해서 예시를 함께 보여준다 */
  examples: string;
};

export const MENUS: Menu[] = [
  { id: "korean", name: "한식", emoji: "🍚", examples: "비빔밥 · 제육 · 백반" },
  { id: "chinese", name: "중식", emoji: "🥟", examples: "짜장면 · 탕수육 · 마라탕" },
  { id: "japanese", name: "일식", emoji: "🍣", examples: "초밥 · 돈까스 · 라멘" },
  { id: "western", name: "양식", emoji: "🍝", examples: "파스타 · 스테이크 · 피자" },
  { id: "fastfood", name: "패스트푸드", emoji: "🍔", examples: "햄버거 · 치킨 · 샌드위치" },
  { id: "bunsik", name: "분식", emoji: "🍢", examples: "떡볶이 · 김밥 · 순대" },
  { id: "light", name: "가벼운 식사", emoji: "🥗", examples: "샐러드 · 포케 · 죽" },
  { id: "soup", name: "국밥·찌개류", emoji: "🍲", examples: "국밥 · 김치찌개 · 순두부" },
];

/** 인원 상한. 6명 이상이면 남는 후보가 2개 이하라 "선택"이 무의미해진다 */
export const MIN_PEOPLE = 2;
export const MAX_PEOPLE = 5;

/** 재선정은 딱 한 번만 (기획안 V3) */
export const MAX_REROLL = 1;
