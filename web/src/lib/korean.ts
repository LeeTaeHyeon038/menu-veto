/**
 * "패스트푸드이 탈락했습니다" 같은 어색한 문장을 막기 위한 조사 처리.
 * 카테고리 이름이 받침으로 끝나는지에 따라 조사가 달라진다.
 */
function hasFinalConsonant(word: string): boolean {
  const last = word.at(-1);
  if (!last) return false;

  const code = last.charCodeAt(0);
  // 한글 완성형 음절이 아니면(영문·숫자 등) 받침 없는 것으로 취급한다
  if (code < 0xac00 || code > 0xd7a3) return false;

  return (code - 0xac00) % 28 !== 0;
}

/** 예: josa("한식", "이", "가") → "이" */
export function josa(word: string, withBatchim: string, withoutBatchim: string) {
  return hasFinalConsonant(word) ? withBatchim : withoutBatchim;
}
