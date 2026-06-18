import type { Variants } from "@/lib/animation";

export type InteractionType = "instant" | "slide" | "fade" | "pop";

export const STORAGE_KEY = "dodl_scanner_interaction";
export const STAGGER_KEY = "dodl_scanner_stagger";
export const BLOB_KEY = "dodl_scanner_blob"; // 배경 blob 애니메이션 ON/OFF
export const BLOB_SPEED_KEY = "dodl_scanner_blob_speed";

// 배경 blob 애니메이션 속도 프리셋 (float = 부유 주기, morph = 형태 변형 주기, 초)
export type BlobSpeed = "calm" | "normal" | "lively";

export interface BlobSpeedPreset {
  id: BlobSpeed;
  label: string;
  description: string;
  floatDuration: number;
  morphDuration: number;
}

export const BLOB_SPEEDS: BlobSpeedPreset[] = [
  { id: "calm", label: "CALM", description: "아주 느리게 부유", floatDuration: 48, morphDuration: 14 },
  { id: "normal", label: "NORMAL", description: "기본 속도", floatDuration: 36, morphDuration: 9 },
  { id: "lively", label: "LIVELY", description: "활기차게 움직임", floatDuration: 22, morphDuration: 5 },
];

export function getBlobSpeed(id: BlobSpeed): BlobSpeedPreset {
  return BLOB_SPEEDS.find((s) => s.id === id) ?? BLOB_SPEEDS[1];
}

// 배경 blob 외형 속성 (사용자가 슬라이더로 조절)
export const BLOB_STYLE_KEY = "dodl_scanner_blob_style";

export interface BlobStyle {
  blur: number; // 번짐 (px)
  opacity: number; // 진하기 (0~1)
  scale: number; // 크기 배율
}

export const DEFAULT_BLOB_STYLE: BlobStyle = { blur: 120, opacity: 0.7, scale: 1 };

export const BLOB_STYLE_RANGE = {
  blur: { min: 4, max: 160, step: 2 },
  opacity: { min: 0.2, max: 1, step: 0.05 },
  scale: { min: 0.7, max: 1.6, step: 0.05 },
} as const;

export interface InteractionPreset {
  id: InteractionType;
  label: string;
  description: string;
  // 스텝 전환 variant — enter/center/exit (slide는 방향 의존 함수형)
  stepVariants: Variants;
  stepTransition: object;
  // 옵션 버튼 탭 피드백 (없으면 무동작)
  optionWhileTap?: { scale: number };
  // 결과 카드 stagger 등장
  resultStagger: number;
  resultCardVariants: Variants;
  resultCardTransition: object;
}

// 변화 없음 — 모든 상태 동일, 즉시 교체
const INSTANT: InteractionPreset = {
  id: "instant",
  label: "INSTANT",
  description: "애니메이션 없음 · 비교 기준점",
  stepVariants: {
    enter: { opacity: 1 },
    center: { opacity: 1 },
    exit: { opacity: 1 },
  },
  stepTransition: { duration: 0 },
  resultStagger: 0,
  resultCardVariants: {
    hidden: { opacity: 1 },
    show: { opacity: 1 },
  },
  resultCardTransition: { duration: 0 },
};

const SLIDE: InteractionPreset = {
  id: "slide",
  label: "SLIDE",
  description: "좌우 슬라이드 전환",
  stepVariants: {
    enter: (dir: number) => ({ x: dir >= 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir >= 0 ? -40 : 40, opacity: 0 }),
  },
  stepTransition: { duration: 0.28, ease: "easeOut" },
  resultStagger: 0.07,
  resultCardVariants: {
    hidden: { x: 24, opacity: 0 },
    show: { x: 0, opacity: 1 },
  },
  resultCardTransition: { duration: 0.3, ease: "easeOut" },
};

const FADE: InteractionPreset = {
  id: "fade",
  label: "FADE",
  description: "부드러운 크로스페이드",
  stepVariants: {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  },
  stepTransition: { duration: 0.25, ease: "easeInOut" },
  resultStagger: 0.08,
  resultCardVariants: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  resultCardTransition: { duration: 0.35, ease: "easeInOut" },
};

const POP: InteractionPreset = {
  id: "pop",
  label: "POP",
  description: "scale 스프링 · 탭 피드백",
  stepVariants: {
    enter: { opacity: 0, scale: 0.96 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
  stepTransition: { type: "spring", stiffness: 380, damping: 30 },
  optionWhileTap: { scale: 0.97 },
  resultStagger: 0.09,
  resultCardVariants: {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  },
  resultCardTransition: { type: "spring", stiffness: 420, damping: 28 },
};

export const PRESETS: InteractionPreset[] = [INSTANT, SLIDE, FADE, POP];

export function getPreset(id: InteractionType): InteractionPreset {
  return PRESETS.find((p) => p.id === id) ?? INSTANT;
}
