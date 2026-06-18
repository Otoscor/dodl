// 도움돼요 표시용 결정론적 의사 카운트 — DB 컬럼 없이 사실적인 기본값을 만든다.
// 같은 리뷰 id면 항상 같은 값(0~40)을 반환. 클라이언트 토글은 여기에 ±1 한다.
export function helpfulBase(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % 41;
}
