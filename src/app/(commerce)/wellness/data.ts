// 웰니스 센서 — 정적 데이터 (DB 무관, 페이지 전용)
// 연속혈당측정(CGM) 센서 브랜드별 상품 쇼케이스.

export interface WellnessProduct {
  id: string;
  name: string; // 줄바꿈(\n) 포함 가능
  price: number;
  notes: string[]; // "※ ..." 안내 문구
}

export interface WellnessBrand {
  id: string;
  label: string; // 탭 라벨
  products: WellnessProduct[];
}

// 상단 인트로 카피 + 일러스트
export const WELLNESS_INTRO = {
  title: "식사 후 찾아오는 일상의 변화,\n내몸의 신호일 수 있습니다.",
  description:
    "섭취한 음식에 따라 몸속 글루코스 수치는 오르내리기를 반복합니다. 눈에 보이지 않던 대사 흐름을 기록하고, 확인하는 것은 나에게 맞는 라이프스타일과 식습관의 기준을 세우는 첫걸음이 될 수 있습니다.",
  // public/wellness/intro.png 에 일러스트를 넣어주세요 (없으면 플레이스홀더 표시)
  image: "/wellness/intro.png",
};

export const WELLNESS_BRANDS: WellnessBrand[] = [
  {
    id: "dexcom-g7",
    label: "덱스콤 G7",
    products: [
      {
        id: "dexcom-g7-starter",
        name: "덱스콤 G7 스타터 패키지\n(2개입/20일, 3개입/30일)",
        price: 150000,
        notes: ["계정당 1회 한정", "라이언 피규어 증정"],
      },
      {
        id: "dexcom-g7-single",
        name: "덱스콤 G7\n(10일) / 1개",
        price: 100000,
        notes: [],
      },
    ],
  },
  {
    id: "caresens-air",
    label: "케어센스 에어",
    products: [
      {
        id: "caresens-air-starter",
        name: "케어센스 에어 스타터 패키지\n(2개입/28일)",
        price: 120000,
        notes: ["계정당 1회 한정"],
      },
      {
        id: "caresens-air-single",
        name: "케어센스 에어\n(14일) / 1개",
        price: 75000,
        notes: [],
      },
    ],
  },
];
