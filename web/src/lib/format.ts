/**
 * 걸린 시간을 "1분 23초" 형태로.
 * 결과 화면에 이걸 보여주는 것이 KPI ①(평균 메뉴 결정 시간)을
 * 사용자에게도 체감시키는 장치다 (PROJECT_OVERVIEW.md 9절).
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`;
}
