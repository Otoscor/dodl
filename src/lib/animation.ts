// 인터랙션 라이브러리 통합 export
// 사용처에서 이 파일 하나만 import하면 됩니다.

// GSAP — 타임라인 기반 시퀀스 애니메이션, stagger 등장, 복잡한 제어
export { gsap } from "gsap";
export { useGSAP } from "@gsap/react";

// Framer Motion — React 컴포넌트 spring 애니메이션, 제스처(tap/whileTap), 레이아웃 전환
export {
  motion,
  AnimatePresence,
  useAnimate,
  useMotionValue,
  useTransform,
  type Variants,
} from "framer-motion";

// Lenis — 모바일 스크롤 관성 (결과 화면 등 긴 스크롤 영역에 적용)
export { default as Lenis } from "lenis";
