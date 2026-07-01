// 선물하기(발신자) 프로토타입 정적 데이터 (DB 의존 없음 — 격리).
// 사용자 캡처(Frame 156) 그대로 — 와이어프레임. 실물배송형 정책은 주석으로 유지.

// ── 샘플 데이터 (캡처 기준) ──
export const PRODUCT = {
  name: "비아 아이스커피 5개입",
  price: 6900,
  category: "온라인 스토어",
  desc: "부드러운 아이스 커피를 만드는 감칠맛과 카라멜 향이 특징인 아이스 커피 5개입입니다.",
};

// 실물배송형 배송비(발신자 부담, 1차 가정) → 결제 금액 = 상품 + 배송비 = 9,900원.
export const SHIPPING = 3000;
export const TOTAL = PRODUCT.price + SHIPPING;

// 주문/취소 데이터 (캡처).
export const ORDER = {
  no: "CO3236070F189030867231",
  orderedAt: "2026.07.01 오후 10:56",
  canceledAt: "2026.07.01 오후 10:57",
};

export const CANCEL_REASONS = [
  "상품이 마음에 들지 않음",
  "옵션 변경 또는 상품 추가 후 재주문 예정",
  "배송 예정일보다 배송이 지연됨",
  "기타 (구매의사 없음)",
];

// 연락처 접근 권한 (iOS): 없음 / 제한된 접근 / 전체 접근.
export type ContactAccess = "none" | "limited" | "full";

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

// 제한된 접근 피커에 뜨는 기기 연락처(연락처1~9).
export const DEVICE_CONTACTS = Array.from({ length: 9 }, (_, i) => `연락처${i + 1}`);

// 전체 접근 시 앱이 가져오는 연락처(연락처 01~04). 전화번호는 캡처 플레이스홀더.
export const API_CONTACTS: Contact[] = [
  { id: "a1", name: "연락처 01", phone: "000-0000-0000" },
  { id: "a2", name: "연락처 02", phone: "000-0000-0000" },
  { id: "a3", name: "연락처 03", phone: "000-0000-0000" },
  { id: "a4", name: "연락처 04", phone: "000-0000-0000" },
];

// 카드 테마 (캡처: 감사·축하·사랑·응원·부탁) — 와이어프레임이라 색 없이 라벨만.
export interface CardTheme {
  id: string;
  label: string;
}

export const CARD_THEMES: CardTheme[] = [
  { id: "thanks", label: "감사" },
  { id: "congrats", label: "축하" },
  { id: "love", label: "사랑" },
  { id: "cheer", label: "응원" },
  { id: "please", label: "부탁" },
];

export const MESSAGE_MAX = 150;

// 발신 플로우 누적 상태 (화면 간 공유).
export interface GiftState {
  cardThemeId: string;
  message: string;
  multiSend: boolean;
  receiverName?: string;
  receiverPhone?: string;
  contactSource?: "주소록" | "직접입력";
}

// ── 단계 정의 + 주석 ──
export type StepId = "S01" | "S02" | "S03" | "S04";

export interface Annotation {
  policy?: string[];
  case?: string[];
  data?: string[];
}

export interface StepMeta {
  id: StepId;
  num: number;
  title: string;
  state: string;
  annotation: Annotation;
}

export const STEPS: StepMeta[] = [
  {
    id: "S01",
    num: 1,
    title: "상품 상세",
    state: "—",
    annotation: {
      case: ['"구매하기" 탭 → 구매 / 선물하기 선택 시트'],
      policy: ["실물배송형만 대상 (교환권/e쿠폰형 제외)"],
      data: ["productId", "price", "quantity"],
    },
  },
  {
    id: "S02",
    num: 2,
    title: "선물하기 · 카드/메시지/받는분",
    state: "—",
    annotation: {
      policy: [
        "입력한 이름 그대로 수신자 메시지에 표시됨",
        "결제 완료 후 카카오 알림톡으로 발송",
        "수신자 배송지는 발신자에게 비공개 (수신자 직접 입력)",
      ],
      case: [
        "메시지 최대 150자 · 미입력 허용",
        "여러 명에게 선물하기 토글",
        "받는 분: ① 이름·전화 직접 입력 ② 연락처 찾기(외부 API)",
        "연락처 접근 권한 게이트 — 전체 접근일 때만 가져오기 가능",
        "제한된 접근: 선택해도 실패(맨 처음 상품으로 리셋)",
        "없음: 설정으로 유도하는 모달",
      ],
      data: ["cardThemeId", "message", "receiverName", "receiverPhone", "multiSend", "contactAccess"],
    },
  },
  {
    id: "S03",
    num: 3,
    title: "결제",
    state: "PAID",
    annotation: {
      policy: [
        "발신자 전액 결제, 수신자에게 금액 비공개",
        "배송지 미확정 결제 → 배송비 발신자 부담(1차 가정)",
        "수신자 주소를 발신자가 볼 수 없음 (개인정보 보호)",
      ],
      case: [
        "결제 금액 = 상품 6,900 + 배송비 3,000 = 9,900원",
        "결제수단: 스타벅스 카드 잔액 부족 → 계좌 간편결제로 대체",
        "계좌 간편결제 비밀번호(4자리) 입력",
      ],
      data: ["orderId", "paymentMethod = 계좌 간편결제", "shippingFee", "giftStatus = PAID"],
    },
  },
  {
    id: "S04",
    num: 4,
    title: "주문 완료",
    state: "PAID",
    annotation: {
      policy: ["받는 분이 배송지를 입력해야 배송 시작 (수신자 직접 입력)"],
      case: [
        "적립: 배송 완료로부터 9일차에 구매자(발신자)에게",
        "상세정보 확인 → 주문 취소(상품→사유→정보 확인→신청)",
        "취소 시 전액 환불(환불 대기), 발신자에게 '미수령'으로만 안내",
      ],
      data: ["orderId", "cancelReason", "refundStatus", "giftStatus: PAID → (배송 대기)"],
    },
  },
];
