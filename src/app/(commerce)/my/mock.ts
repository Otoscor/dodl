// 마이 페이지 가상 데이터 + 메뉴 구성 (표시용 — 실제 시스템 아님)

export const MOCK_ASSETS = {
  grade: "그린 멤버",
  couponCount: 3,
  points: 2500,
  reviewCount: 4,
  followingCount: 2,
} as const;

export interface MyMenuItem {
  label: string;
  href?: string; // 있으면 실제 이동
  value?: string; // 우측에 표시할 보조 텍스트
  action?: "logout"; // 특수 액션(로그아웃 모달 등)
}

export interface MyMenuGroup {
  title: string;
  items: MyMenuItem[];
}

export const MY_MENU: MyMenuGroup[] = [
  {
    title: "쇼핑 활동",
    items: [
      { label: "주문 내역", href: "/orders" },
      { label: "취소·반품·교환 내역", href: "/orders" },
      { label: "내 리뷰", href: "/my/reviews", value: "4건" },
      { label: "찜한 상품", href: "/my/likes", value: "6" },
      { label: "최근 본 상품", href: "/my/recent" },
      { label: "팔로잉 브랜드", href: "/my/following", value: "2" },
    ],
  },
  {
    title: "혜택·자산",
    items: [
      { label: "쿠폰함", href: "/my/coupons", value: "3장" },
      { label: "포인트 내역", href: "/my/points", value: "2,500P" },
      { label: "가상 지갑", href: "/wallet" },
      { label: "진행 중인 이벤트", href: "/my/events" },
    ],
  },
  {
    title: "고객 서비스",
    items: [
      { label: "공지사항", href: "/my/notices" },
      { label: "자주 묻는 질문", href: "/my/faq" },
      { label: "1:1 문의", href: "/my/inquiry" },
      { label: "배송지 관리", href: "/my/addresses" },
      { label: "결제수단 관리", href: "/my/payments" },
      { label: "알림 설정", href: "/my/notifications" },
    ],
  },
  {
    title: "약관·기타",
    items: [
      { label: "로그아웃", action: "logout" },
    ],
  },
];

// ===== 화면별 가상 데이터 =====

// 내 리뷰
export interface MockWritableReview {
  id: string;
  category: string;
  productName: string;
  option: string;
  quantity: number;
  price: number;
  deliveredDate: string; // 배송완료일
}

export const MOCK_WRITABLE_REVIEWS: MockWritableReview[] = [
  { id: "wr1", category: "비타민", productName: "고함량 비타민C 1000", option: "120정", quantity: 1, price: 27000, deliveredDate: "2026-06-15" },
  { id: "wr2", category: "콜라겐", productName: "콜라겐 젤리스틱", option: "석류", quantity: 2, price: 22000, deliveredDate: "2026-06-12" },
  { id: "wr3", category: "미네랄", productName: "아연 + 셀레늄", option: "단일 상품", quantity: 1, price: 13000, deliveredDate: "2026-06-08" },
];

export interface MockReview {
  id: string;
  productName: string;
  rating: number;
  body: string;
  date: string;
  photos?: string[]; // 포토 리뷰 (있을 경우 unsplash 이미지 URL)
}

export const MOCK_REVIEWS: MockReview[] = [
  {
    id: "rv1",
    productName: "데일리 멀티비타민",
    rating: 5,
    body: "한 알로 간편하게 챙길 수 있어 좋아요. 비린내도 없고 꾸준히 먹고 있습니다.",
    date: "2026-06-10",
    photos: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1550572017-edd951b55104?w=200&h=200&fit=crop",
    ],
  },
  {
    id: "rv2",
    productName: "장건강 프로바이오틱스",
    rating: 4,
    body: "먹은 지 2주 정도 됐는데 속이 편해진 느낌이에요.",
    date: "2026-06-03",
    // 포토 없음
  },
  {
    id: "rv3",
    productName: "알티지 오메가3",
    rating: 5,
    body: "캡슐 크기가 적당하고 트림 냄새가 거의 없어서 만족합니다.",
    date: "2026-05-28",
    photos: [
      "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=200&h=200&fit=crop",
    ],
  },
  {
    id: "rv4",
    productName: "프리미엄 마그네슘",
    rating: 4,
    body: "밤에 먹으면 한결 편하게 자는 것 같아요.",
    date: "2026-05-19",
    // 포토 없음
  },
];

// 팔로잉 브랜드
export interface MockBrand {
  id: string;
  name: string;
  productCount: number;
}

export const MOCK_BRANDS: MockBrand[] = [
  { id: "br1", name: "데일리헬스", productCount: 24 },
  { id: "br2", name: "바이탈랩", productCount: 18 },
  { id: "br3", name: "퓨어뉴트리", productCount: 31 },
  { id: "br4", name: "그린바이옴", productCount: 12 },
];

// 쿠폰함
export interface MockCoupon {
  id: string;
  typeTag: string;        // 쿠폰 유형 태그 (예: "장바구니 쿠폰", "가입쿠폰", "등급 쿠폰")
  usageTag?: string;      // 중복 여부 태그 (예: "중복 사용 가능")
  discount: string;       // 대형 할인값 (예: "30,000원", "10%")
  name: string;           // 쿠폰명 (조건 접두사 포함)
  condition: string;      // 조건 한 줄 (예: "3만원 이상 구매 시, 최대 3,000원 할인")
  expiry: string;         // 만료일 (YYYY.MM.DD까지 형식)
  expired?: boolean;
}

export const MOCK_COUPONS: MockCoupon[] = [
  {
    id: "cp1",
    typeTag: "장바구니 쿠폰",
    usageTag: "중복 사용 가능",
    discount: "30,000원",
    name: "[중복 사용 가능] 신규 가입 축하 쿠폰",
    condition: "3만원 이상 구매 시, 최대 30,000원 할인",
    expiry: "2026.06.30까지",
  },
  {
    id: "cp2",
    typeTag: "가입쿠폰",
    usageTag: "중복 사용 가능",
    discount: "10%",
    name: "비타민 카테고리 할인",
    condition: "3만원 이상 구매 시, 최대 3,000원 할인",
    expiry: "2026.07.15까지",
  },
  {
    id: "cp3",
    typeTag: "등급 쿠폰",
    discount: "5,000원",
    name: "그린 멤버 전용 재구매 쿠폰",
    condition: "1만원 이상 구매 시, 5,000원 즉시 할인",
    expiry: "2026.07.31까지",
  },
  {
    id: "cp4",
    typeTag: "이벤트 쿠폰",
    usageTag: "중복 사용 가능",
    discount: "15%",
    name: "[기간 한정] 여름 건강관리 기획전 쿠폰",
    condition: "5만원 이상 구매 시, 최대 10,000원 할인",
    expiry: "2026.06.30까지",
  },
  {
    id: "cp5",
    typeTag: "장바구니 쿠폰",
    discount: "2,000원",
    name: "5월 봄맞이 감사 쿠폰",
    condition: "1만원 이상 구매 시, 2,000원 할인",
    expiry: "2026.05.31까지",
    expired: true,
  },
];

// 포인트 요약
export const MOCK_POINT_SUMMARY = {
  balance: 2500,          // 보유 포인트
  pendingAmount: 810,     // 이번 달 적립 예정 (결제완료 주문 기반)
  expiringAmount: 600,    // 소멸 예정 포인트
  expiringDate: "2026-06-30", // 소멸 예정일
  earnRate: 2,            // 구매 금액 대비 적립률 (%)
};

// 포인트 내역
export interface MockPoint {
  id: string;
  type: "적립" | "사용";
  description: string;
  amount: number;
  balanceAfter: number; // 적용 후 잔액
  date: string;
}

export const MOCK_POINTS: MockPoint[] = [
  { id: "pt1", type: "적립", description: "구매 적립 (데일리 멀티비타민)", amount: 540, balanceAfter: 2500, date: "2026-06-10" },
  { id: "pt2", type: "적립", description: "리뷰 작성 적립", amount: 100, balanceAfter: 1960, date: "2026-06-10" },
  { id: "pt3", type: "사용", description: "주문 결제 사용", amount: 1000, balanceAfter: 1860, date: "2026-06-05" },
  { id: "pt4", type: "적립", description: "출석 체크 적립", amount: 50, balanceAfter: 2860, date: "2026-06-01" },
  { id: "pt5", type: "적립", description: "구매 적립 (알티지 오메가3)", amount: 1050, balanceAfter: 2810, date: "2026-05-28" },
];

// 진행 중인 이벤트
export interface MockEvent {
  id: string;
  title: string;
  period: string;
  description: string;
}

export const MOCK_EVENTS: MockEvent[] = [
  { id: "ev1", title: "여름 건강관리 기획전", period: "2026.06.01 ~ 06.30", description: "인기 비타민·프로바이오틱스 최대 30% 할인" },
  { id: "ev2", title: "첫 구매 적립금 2배", period: "상시", description: "신규 회원 첫 주문 시 적립금 2배 지급" },
  { id: "ev3", title: "리뷰 작성 이벤트", period: "2026.06.01 ~ 07.31", description: "포토 리뷰 작성 시 100P 추가 적립" },
];

// 공지사항
export interface MockNotice {
  id: string;
  title: string;
  date: string;
  body: string;
}

export const MOCK_NOTICES: MockNotice[] = [
  { id: "nt1", title: "[안내] 여름철 배송 지연 가능 안내", date: "2026-06-12", body: "기상 상황에 따라 일부 지역의 배송이 1~2일 지연될 수 있습니다. 양해 부탁드립니다." },
  { id: "nt2", title: "개인정보 처리방침 개정 안내", date: "2026-06-01", body: "2026년 6월 1일자로 개인정보 처리방침이 일부 개정되었습니다. 자세한 내용은 약관 페이지를 참고해주세요." },
  { id: "nt3", title: "가상 지갑 적립 정책 변경", date: "2026-05-20", body: "신규 가입 시 지급되는 가상 지갑 금액 및 적립 정책이 변경되었습니다." },
];

// 자주 묻는 질문
export interface MockFaq {
  id: string;
  question: string;
  answer: string;
}

export const MOCK_FAQS: MockFaq[] = [
  { id: "fq1", question: "주문을 취소하고 싶어요.", answer: "주문 내역 > 주문 상세에서 '결제완료' 또는 '배송준비' 상태일 때 취소할 수 있습니다. 환불은 가상 지갑으로 즉시 처리됩니다." },
  { id: "fq2", question: "반품·교환은 어떻게 하나요?", answer: "'배송완료' 상태의 주문에서 반품 또는 교환을 신청할 수 있습니다. 사유 선택 후 접수됩니다." },
  { id: "fq3", question: "배송비는 얼마인가요?", answer: "기본 배송비는 3,000원이며, 상품 금액 합계가 30,000원 이상이면 무료 배송입니다." },
  { id: "fq4", question: "가상 지갑은 무엇인가요?", answer: "본 프로토타입은 실제 결제 대신 가상 지갑으로 결제합니다. 첫 접속 시 100,000원이 지급됩니다." },
  { id: "fq5", question: "포인트는 어디에 쓰나요?", answer: "포인트는 적립·사용 내역으로 확인할 수 있으며, 데모 환경에서는 표시용으로 제공됩니다." },
];

// 1:1 문의 — 과거 문의 목록
export interface MockInquiry {
  id: string;
  category: string;
  title: string;
  body: string;          // 문의 내용
  status: "답변완료" | "접수";
  date: string;
  answer?: {             // 답변 (없으면 미답변)
    body: string;
    date: string;
  };
}

export const MOCK_INQUIRIES: MockInquiry[] = [
  {
    id: "iq1",
    category: "배송",
    title: "배송이 언제 시작되나요?",
    body: "주문한 지 3일이 지났는데 아직 배송 준비 중이에요. 언제쯤 출고될까요?",
    status: "답변완료",
    date: "2026-06-08",
    answer: {
      body: "안녕하세요, dodl 고객센터입니다.\n주문하신 상품은 재고 확인 후 영업일 기준 1~2일 내 출고됩니다. 현재 주문 건은 2026-06-10 출고 예정이며, 출고 후 문자로 송장번호를 안내드릴 예정입니다.\n감사합니다.",
      date: "2026-06-09",
    },
  },
  {
    id: "iq2",
    category: "상품",
    title: "유통기한이 궁금합니다",
    body: "데일리 멀티비타민 상품의 유통기한이 어떻게 되나요? 선물용으로 구매하려고 합니다.",
    status: "답변완료",
    date: "2026-05-30",
    answer: {
      body: "안녕하세요, dodl 고객센터입니다.\n현재 출고되는 데일리 멀티비타민의 유통기한은 제조일로부터 24개월이며, 출고 시점 기준 최소 18개월 이상 남은 제품을 발송해 드리고 있습니다. 선물용으로도 충분히 여유가 있을 것 같습니다.\n추가 문의 사항이 있으시면 언제든지 남겨주세요. 감사합니다.",
      date: "2026-05-31",
    },
  },
  {
    id: "iq3",
    category: "취소/반품/교환",
    title: "반품 신청했는데 환불이 안 됩니다",
    body: "반품 신청한 지 5일이 지났는데 아직 가상 지갑에 환불이 안 되어 있습니다. 확인 부탁드립니다.",
    status: "접수",
    date: "2026-06-13",
  },
];

export const INQUIRY_CATEGORIES = ["상품", "배송", "취소/반품/교환", "결제", "기타"] as const;

// 문의 유형별 세부 유형 (작성 폼 드롭다운)
export const INQUIRY_DETAIL_TYPES: Record<string, string[]> = {
  "상품": ["성분·원료 문의", "섭취 방법", "재입고 문의", "상품 정보 오류"],
  "배송": ["배송 지연", "배송지 변경", "송장번호 문의", "오배송·파손"],
  "취소/반품/교환": ["취소 요청", "반품 요청", "교환 요청", "환불 지연"],
  "결제": ["결제 오류", "결제수단 변경", "영수증·현금영수증", "포인트·쿠폰 적용"],
  "기타": ["회원 정보", "이벤트·쿠폰", "앱 오류", "기타 문의"],
};

// 배송지 관리
export interface MockAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

export const MOCK_ADDRESSES: MockAddress[] = [
  { id: "ad1", name: "홍길동", phone: "010-1234-5678", address: "서울시 강남구 테헤란로 123, 4층 401호", isDefault: true },
  { id: "ad2", name: "홍길동 (회사)", phone: "010-1234-5678", address: "서울시 중구 을지로 50, 12층" },
];

// 결제수단 관리
export interface MockPayment {
  id: string;
  type: "카드" | "계좌";
  label: string;
  isDefault?: boolean;
}

export const MOCK_PAYMENTS: MockPayment[] = [
  { id: "pm1", type: "카드", label: "신한카드 1234", isDefault: true },
  { id: "pm2", type: "계좌", label: "국민은행 ****56" },
];

// 알림 설정
export interface MockNotificationSetting {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

export const MOCK_NOTIFICATION_SETTINGS: MockNotificationSetting[] = [
  { id: "order", label: "주문·배송 알림", description: "주문 상태 변경, 배송 출발/완료 알림", defaultOn: true },
  { id: "benefit", label: "혜택·이벤트 알림", description: "쿠폰, 적립금, 기획전 소식", defaultOn: true },
  { id: "review", label: "리뷰 요청 알림", description: "배송 완료 후 리뷰 작성 요청", defaultOn: false },
  { id: "night", label: "야간 알림 (21시~08시)", description: "야간 시간대 푸시 수신", defaultOn: false },
];

// 우편번호 찾기 — 주소 검색 결과 (목 데이터)
export interface MockPostalResult {
  zipcode: string;
  road: string; // 도로명주소
  jibun: string; // 지번주소
}

export const MOCK_POSTAL_RESULTS: MockPostalResult[] = [
  { zipcode: "06236", road: "서울 강남구 테헤란로 152", jibun: "역삼동 737" },
  { zipcode: "06164", road: "서울 강남구 테헤란로 521", jibun: "삼성동 159" },
  { zipcode: "13529", road: "경기 성남시 분당구 판교역로 235", jibun: "삼평동 681" },
  { zipcode: "04524", road: "서울 중구 세종대로 110", jibun: "태평로1가 31" },
  { zipcode: "03187", road: "서울 종로구 세종대로 175", jibun: "세종로 81" },
  { zipcode: "07335", road: "서울 영등포구 여의대로 108", jibun: "여의도동 36" },
  { zipcode: "48058", road: "부산 해운대구 센텀중앙로 79", jibun: "우동 1495" },
  { zipcode: "21554", road: "인천 남동구 정각로 29", jibun: "구월동 1138" },
];

// 선물하기 — 받는 분(친구) 목록 (목 데이터)
export interface MockFriend {
  id: string;
  name: string;
  phone: string;
  relation?: string;
}

export const MOCK_FRIENDS: MockFriend[] = [
  { id: "fr1", name: "김민수", phone: "010-2222-3924", relation: "친구" },
  { id: "fr2", name: "이서연", phone: "010-3456-7812", relation: "직장 동료" },
  { id: "fr3", name: "박지훈", phone: "010-8765-4321", relation: "가족" },
  { id: "fr4", name: "최유진", phone: "010-5555-1020", relation: "친구" },
];
