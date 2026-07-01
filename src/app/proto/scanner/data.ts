// 단백질 스캐너 (Figma 프로토타입) — 정적 데이터
// Figma node 817:7472 "혜택_홈_상세" 기준. DB 의존 없음.

export interface ProtoQuestion {
  id: string;
  title: string;
  caption: string;
  options: string[];
}

// 현재 Figma에 정의된 화면(식감 선호 단계).
// 나머지 단계(질문 1·2)·결과 화면은 추가 프레임 확정 후 채운다.
export const TEXTURE_QUESTION: ProtoQuestion = {
  id: "texture",
  title: "분말 쉐이크 식감 선호는?",
  caption: "옵션을 선택해주세요.",
  options: [
    "토핑 없음 · 속편안 · 부드러움",
    "식사 대신 든든하게 먹고 싶어요.",
    "체중관리 중 가볍게 마시고 싶어요.",
    "당류, 혈당 부담이낮은 제품을 찾고 있어요.",
    "식물성, 플랜트 단백질이 좋아요.",
    "피부, 이너 관심 있어요.",
  ],
};
