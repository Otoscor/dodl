// 웰니스 센서 — 정적 데이터 (DB 무관, 페이지 전용)
// 연속혈당측정(CGM) 센서 브랜드별 상품 쇼케이스.

export interface WellnessSpec {
  label: string;
  value: string;
}

export interface WellnessProduct {
  id: string;
  name: string; // 줄바꿈(\n) 포함 가능
  price: number;
  notes: string[]; // "※ ..." 안내 문구
  // 상세 페이지 전용
  image: string; // 상품 이미지 경로 (없으면 플레이스홀더)
  description: string; // 상품 소개
  specs: WellnessSpec[]; // 상품정보 스펙 표
  shipping: string; // 배송 안내
  usageGuide: string; // 사용 방법
  caution: string; // 주의사항
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
        image: "",
        description:
          "덱스콤 G7은 손가락 채혈 없이 실시간으로 혈당을 모니터링할 수 있는 연속혈당측정기(CGM)입니다. 스타터 패키지로 CGM 경험을 합리적으로 시작해보세요.",
        specs: [
          { label: "구성", value: "센서 2개 (2개입/20일) 또는 센서 3개 (3개입/30일)" },
          { label: "착용 기간", value: "센서 1개당 최대 10일" },
          { label: "측정 주기", value: "5분마다 자동 측정" },
          { label: "방수", value: "IPX8 (수심 2.4m, 24시간)" },
          { label: "크기", value: "가로 35mm × 세로 34mm × 두께 9.5mm" },
          { label: "호환 기기", value: "iPhone, Android 스마트폰 (Bluetooth 연동)" },
          { label: "제조사", value: "Dexcom, Inc. (미국)" },
          { label: "의료기기", value: "식품의약품안전처 허가 의료기기" },
        ],
        shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송) · 냉장 배송",
        usageGuide:
          "팔 뒤쪽(상완)에 센서 어플리케이터를 밀착 후 버튼을 눌러 부착합니다. 덱스콤 G7 앱을 설치한 스마트폰과 블루투스로 페어링하면 약 30분 준비 시간 후 실시간 혈당값을 확인할 수 있습니다.",
        caution:
          "의료기기입니다. 정확한 진단·치료를 위해서는 반드시 의사와 상담하세요. 혈당 경보는 참고값이며, 저혈당·고혈당 증상이 나타날 경우 즉시 전통적인 혈당 측정을 병행하세요.",
      },
      {
        id: "dexcom-g7-single",
        name: "덱스콤 G7\n(10일) / 1개",
        price: 100000,
        notes: [],
        image: "",
        description:
          "덱스콤 G7 센서 1개 단품입니다. 10일간 손가락 채혈 없이 실시간 혈당을 확인할 수 있습니다.",
        specs: [
          { label: "구성", value: "센서 1개" },
          { label: "착용 기간", value: "최대 10일" },
          { label: "측정 주기", value: "5분마다 자동 측정" },
          { label: "방수", value: "IPX8 (수심 2.4m, 24시간)" },
          { label: "크기", value: "가로 35mm × 세로 34mm × 두께 9.5mm" },
          { label: "호환 기기", value: "iPhone, Android 스마트폰 (Bluetooth 연동)" },
          { label: "제조사", value: "Dexcom, Inc. (미국)" },
          { label: "의료기기", value: "식품의약품안전처 허가 의료기기" },
        ],
        shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송) · 냉장 배송",
        usageGuide:
          "팔 뒤쪽(상완)에 센서 어플리케이터를 밀착 후 버튼을 눌러 부착합니다. 덱스콤 G7 앱을 설치한 스마트폰과 블루투스로 페어링하면 약 30분 준비 시간 후 실시간 혈당값을 확인할 수 있습니다.",
        caution:
          "의료기기입니다. 정확한 진단·치료를 위해서는 반드시 의사와 상담하세요. 혈당 경보는 참고값이며, 저혈당·고혈당 증상이 나타날 경우 즉시 전통적인 혈당 측정을 병행하세요.",
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
        image: "",
        description:
          "케어센스 에어는 국내 기술로 개발된 연속혈당측정기입니다. 스타터 패키지로 14일×2개 센서가 포함되어 있어 한 달간 혈당 패턴을 파악하기에 최적입니다.",
        specs: [
          { label: "구성", value: "센서 2개 (14일×2 = 28일)" },
          { label: "착용 기간", value: "센서 1개당 최대 14일" },
          { label: "측정 주기", value: "1분마다 자동 측정" },
          { label: "방수", value: "IP27 (생활방수)" },
          { label: "크기", value: "가로 38mm × 세로 38mm × 두께 8mm" },
          { label: "호환 기기", value: "iPhone, Android 스마트폰 (NFC/Bluetooth 연동)" },
          { label: "제조사", value: "(주)아이센스 (대한민국)" },
          { label: "의료기기", value: "식품의약품안전처 허가 의료기기" },
        ],
        shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송) · 냉장 배송",
        usageGuide:
          "팔 뒤쪽(상완) 또는 복부에 어플리케이터로 센서를 부착합니다. 케어센스 에어 앱과 NFC 또는 블루투스로 연동하면 실시간 혈당을 스마트폰에서 확인할 수 있습니다.",
        caution:
          "의료기기입니다. 일반적인 혈당 측정기가 아니므로 의사의 지도 하에 사용하세요. 피부 트러블이 있는 경우 착용을 중단하고 전문가와 상담하세요.",
      },
      {
        id: "caresens-air-single",
        name: "케어센스 에어\n(14일) / 1개",
        price: 75000,
        notes: [],
        image: "",
        description:
          "케어센스 에어 센서 1개 단품입니다. 14일간 실시간으로 혈당 변화를 모니터링할 수 있습니다.",
        specs: [
          { label: "구성", value: "센서 1개" },
          { label: "착용 기간", value: "최대 14일" },
          { label: "측정 주기", value: "1분마다 자동 측정" },
          { label: "방수", value: "IP27 (생활방수)" },
          { label: "크기", value: "가로 38mm × 세로 38mm × 두께 8mm" },
          { label: "호환 기기", value: "iPhone, Android 스마트폰 (NFC/Bluetooth 연동)" },
          { label: "제조사", value: "(주)아이센스 (대한민국)" },
          { label: "의료기기", value: "식품의약품안전처 허가 의료기기" },
        ],
        shipping: "오후 2시 이전 주문 시 당일 발송 · 배송비 3,000원 (30,000원 이상 무료배송) · 냉장 배송",
        usageGuide:
          "팔 뒤쪽(상완) 또는 복부에 어플리케이터로 센서를 부착합니다. 케어센스 에어 앱과 NFC 또는 블루투스로 연동하면 실시간 혈당을 스마트폰에서 확인할 수 있습니다.",
        caution:
          "의료기기입니다. 일반적인 혈당 측정기가 아니므로 의사의 지도 하에 사용하세요. 피부 트러블이 있는 경우 착용을 중단하고 전문가와 상담하세요.",
      },
    ],
  },
];

// id로 상품 찾기 헬퍼
export function findWellnessProduct(productId: string): WellnessProduct | null {
  for (const brand of WELLNESS_BRANDS) {
    const product = brand.products.find((p) => p.id === productId);
    if (product) return product;
  }
  return null;
}
