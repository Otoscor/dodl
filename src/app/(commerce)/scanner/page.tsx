"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "@/lib/animation";
import { Button } from "@/components/ui/Button";
import { QUESTIONS, RESULT_CATEGORY } from "./data";
import { formatPrice } from "@/lib/utils";
import { recommend } from "./recommend";
import { svgPath } from "blobs/v2";
import { InteractionSheet } from "./InteractionSheet";
import {
  getPreset,
  getBlobSpeed,
  InteractionType,
  BlobSpeed,
  BlobStyle,
  DEFAULT_BLOB_STYLE,
  STORAGE_KEY,
  STAGGER_KEY,
  BLOB_KEY,
  BLOB_SPEED_KEY,
  BLOB_STYLE_KEY,
} from "./interactions";

function readStoredInteraction(): InteractionType {
  if (typeof window === "undefined") return "fade";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "slide" || v === "fade" || v === "pop" || v === "instant") return v;
  return "fade";
}

function readStoredStagger(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(STAGGER_KEY);
  if (v === null) return true; // 저장값 없으면 기본값 true
  return v === "1";
}

function readStoredBlob(): boolean {
  if (typeof window === "undefined") return false;
  const v = window.localStorage.getItem(BLOB_KEY);
  if (v === null) return false; // 기본값: 꺼짐
  return v === "1";
}

function readStoredBlobSpeed(): BlobSpeed {
  if (typeof window === "undefined") return "normal";
  const v = window.localStorage.getItem(BLOB_SPEED_KEY);
  if (v === "calm" || v === "normal" || v === "lively") return v;
  return "normal";
}

function readStoredBlobStyle(): BlobStyle {
  if (typeof window === "undefined") return DEFAULT_BLOB_STYLE;
  try {
    const raw = window.localStorage.getItem(BLOB_STYLE_KEY);
    if (!raw) return DEFAULT_BLOB_STYLE;
    const p = JSON.parse(raw);
    return {
      blur: typeof p.blur === "number" ? p.blur : DEFAULT_BLOB_STYLE.blur,
      opacity: typeof p.opacity === "number" ? p.opacity : DEFAULT_BLOB_STYLE.opacity,
      scale: typeof p.scale === "number" ? p.scale : DEFAULT_BLOB_STYLE.scale,
    };
  } catch {
    return DEFAULT_BLOB_STYLE;
  }
}

export default function ScannerPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0~2: 질문, 3: 결과
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1); // 1: 다음, -1: 이전/리셋

  const [interaction, setInteraction] = useState<InteractionType>("fade");
  const [stagger, setStagger] = useState(true); // false: 한 번에, true: 시간차
  const [blobOn, setBlobOn] = useState(false); // 배경 blob 애니메이션
  const [blobSpeed, setBlobSpeed] = useState<BlobSpeed>("normal");
  const [blobStyle, setBlobStyle] = useState<BlobStyle>(DEFAULT_BLOB_STYLE);
  const [sheetOpen, setSheetOpen] = useState(false);

  const updateBlobStyle = (patch: Partial<BlobStyle>) =>
    setBlobStyle((s) => ({ ...s, ...patch }));

  // localStorage에서 초기값 복원 (마운트 후 1회)
  useEffect(() => {
    setInteraction(readStoredInteraction());
    setStagger(readStoredStagger());
    setBlobOn(readStoredBlob());
    setBlobSpeed(readStoredBlobSpeed());
    setBlobStyle(readStoredBlobStyle());
  }, []);

  // 선택 변경 시 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, interaction);
    }
  }, [interaction]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STAGGER_KEY, stagger ? "1" : "0");
    }
  }, [stagger]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BLOB_KEY, blobOn ? "1" : "0");
    }
  }, [blobOn]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BLOB_SPEED_KEY, blobSpeed);
    }
  }, [blobSpeed]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BLOB_STYLE_KEY, JSON.stringify(blobStyle));
    }
  }, [blobStyle]);

  const preset = getPreset(interaction);

  // 컨테이너/아이템 모션 — 시간차 여부로 분기
  // 한 번에: 컨테이너가 블록 단위로 전환 (stepVariants)
  // 시간차: 컨테이너가 staggerChildren, 각 아이템이 순차 등장 (resultCardVariants)
  const containerMotion = stagger
    ? {
        variants: {
          hidden: { transition: { staggerChildren: preset.resultStagger * 0.6, staggerDirection: -1 } },
          show: { transition: { staggerChildren: preset.resultStagger, delayChildren: 0.03 } },
        },
        initial: "hidden",
        animate: "show",
        exit: "hidden",
      }
    : {
        variants: preset.stepVariants,
        custom: direction,
        initial: "enter",
        animate: "center",
        exit: "exit",
        transition: preset.stepTransition,
      };

  const itemMotion = stagger
    ? { variants: preset.resultCardVariants, transition: preset.resultCardTransition }
    : {};

  const isResult = step >= QUESTIONS.length;
  const question = QUESTIONS[step];

  const results = useMemo(
    () => (isResult ? recommend(answers) : []),
    [isResult, answers]
  );

  const handleSelect = (optionIndex: number) => {
    setDirection(1);
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      router.push("/home");
    } else {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleRestart = () => {
    setDirection(-1);
    setAnswers({});
    setStep(0);
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* 배경 blob 그라데이션 (부유 + 형태 변형) */}
      <AmbientBackground enabled={blobOn} speed={blobSpeed} style={blobStyle} />

      {/* 헤더 — 글래스 효과 없이 solid (배경 그라데이션은 하단에만) */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="flex items-center h-14 px-6">
          <button
            onClick={handleBack}
            aria-label="뒤로"
            className="w-8 h-8 -ml-2 flex items-center justify-center text-[#888] hover:text-black transition-colors"
          >
            <span className="material-icons-outlined text-[22px]">arrow_back</span>
          </button>
          {isResult ? (
            <h1 className="ml-1 text-[17px] text-black">스캐너 결과</h1>
          ) : (
            <button
              onClick={handleRestart}
              className="ml-auto text-[14px] text-[#888] hover:text-black transition-colors"
            >
              다시하기
            </button>
          )}
        </div>
      </header>

      <div className="relative z-10 px-6 pt-4 pb-24 overflow-x-hidden">
        {/* 스텝 인디케이터 + 타이틀 + 캡션 — 질문 단계에서만, 정적 (애니메이션 미적용) */}
        {!isResult && (
          <div>
            <StepIndicator
              current={step}
              presetLabel={preset.label}
              onOpen={() => setSheetOpen(true)}
            />
            <h1 className="text-[22px] leading-snug tracking-[-0.01em] text-black">
              {question.title}
            </h1>
            <p className="mt-2 mb-8 text-[14px] leading-relaxed text-[#aaa]">
              {question.description}
            </p>
          </div>
        )}

        {/* 선택지 / 결과 카드 — 이 영역만 애니메이션 적용 */}
        <AnimatePresence mode="wait" custom={direction}>
          {!isResult ? (
            <motion.div key={step} {...containerMotion} className="flex flex-col gap-3">
              {question.options.map((option, i) => {
                const isSelected = answers[question.id] === i;
                return (
                  <motion.button
                    key={option.label}
                    {...itemMotion}
                    onClick={() => handleSelect(i)}
                    whileTap={preset.optionWhileTap}
                    className={`w-full text-left p-6 rounded-[14px] border text-[15px] leading-snug transition-colors ${
                      isSelected
                        ? "border-black bg-white text-black"
                        : "border-[#1A1919]/5 bg-white text-[#333]"
                    }`}
                  >
                    {option.label}
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div key="result" {...containerMotion} className="flex flex-col gap-10">
              {results.map(({ product }) => (
                <motion.article key={product.id} {...itemMotion} className="flex flex-col">
                  {/* 공백 이미지 박스 (디자인용) */}
                  <div className="w-full aspect-square rounded-[12px] bg-[#f5f5f5]" />
                  <p className="mt-4 text-center text-[13px] text-[#888]">
                    {RESULT_CATEGORY}
                  </p>
                  <h2 className="mt-1 text-center text-[16px] leading-snug text-black">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-center text-[16px] font-medium text-black">
                    {formatPrice(product.price)}
                  </p>
                </motion.article>
              ))}

              <motion.div {...itemMotion}>
                <Button variant="secondary" fullWidth onClick={handleRestart}>
                  처음으로
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 인터랙션 설정 바텀시트 */}
      <InteractionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        value={interaction}
        onChange={setInteraction}
        stagger={stagger}
        onStaggerChange={setStagger}
        blobOn={blobOn}
        onBlobChange={setBlobOn}
        blobSpeed={blobSpeed}
        onBlobSpeedChange={setBlobSpeed}
        blobStyle={blobStyle}
        onBlobStyleChange={updateBlobStyle}
      />
    </div>
  );
}

/* ---------- 배경 blob (blobs/v2 + framer-motion morph) ---------- */
// 흑백 테마의 유일한 예외 — 따뜻한 피치/크림 그라데이션 blob이 화면 하단에서
// 부유하며 형태가 변형된다. (상단은 깨끗한 흰 배경 유지)
// blobs.svgPath로 동일 구조(같은 extraPoints/size)의 패스를 시드별로 생성 → d 키프레임 morph.

const BLOB_VIEWBOX = 400;

function makeBlobPaths(seeds: number[]): string[] {
  const paths = seeds.map((seed) =>
    svgPath({ seed, extraPoints: 6, randomness: 4, size: BLOB_VIEWBOX })
  );
  return [...paths, paths[0]]; // 처음 형태로 되돌아와 매끄럽게 반복
}

const BLOB_PATHS_A = makeBlobPaths([2, 17, 38, 54]);
const BLOB_PATHS_B = makeBlobPaths([9, 23, 41, 66]);

function AmbientBackground({
  enabled,
  speed,
  style,
}: {
  enabled: boolean;
  speed: BlobSpeed;
  style: BlobStyle;
}) {
  if (!enabled) return null;
  const { floatDuration, morphDuration } = getBlobSpeed(speed);
  const { blur, opacity, scale: s } = style;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Blob A — 좌하단, 피치 */}
      <motion.div
        className="absolute -bottom-40 -left-16 h-[520px] w-[520px]"
        style={{ filter: `blur(${blur}px)`, opacity }}
        animate={{ x: [0, 30, -14, 0], y: [0, -18, 14, 0], scale: [s, s * 1.08, s * 0.96, s] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox={`0 0 ${BLOB_VIEWBOX} ${BLOB_VIEWBOX}`} className="h-full w-full">
          <defs>
            <linearGradient id="blobA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe2cc" />
              <stop offset="100%" stopColor="#ffcca6" />
            </linearGradient>
          </defs>
          <motion.path
            fill="url(#blobA)"
            d={BLOB_PATHS_A[0]}
            animate={{ d: BLOB_PATHS_A }}
            transition={{ duration: morphDuration, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* Blob B — 우하단, 크림→애프리콧 */}
      <motion.div
        className="absolute -bottom-44 -right-20 h-[520px] w-[520px]"
        style={{ filter: `blur(${blur}px)`, opacity: opacity * 0.92 }}
        animate={{ x: [0, -24, 16, 0], y: [0, 16, -16, 0], scale: [s, s * 0.94, s * 1.1, s] }}
        transition={{ duration: floatDuration * 1.18, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox={`0 0 ${BLOB_VIEWBOX} ${BLOB_VIEWBOX}`} className="h-full w-full">
          <defs>
            <linearGradient id="blobB" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff0e2" />
              <stop offset="100%" stopColor="#ffd9bd" />
            </linearGradient>
          </defs>
          <motion.path
            fill="url(#blobB)"
            d={BLOB_PATHS_B[0]}
            animate={{ d: BLOB_PATHS_B }}
            transition={{ duration: morphDuration * 1.25, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

function StepIndicator({
  current,
  presetLabel,
  onOpen,
}: {
  current: number;
  presetLabel: string;
  onOpen: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-1.5 text-[13px]">
        {QUESTIONS.map((q, i) => (
          <span key={q.id} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[#d0d0d0]">·</span>}
            <span className={i === current ? "text-black font-medium" : "text-[#bbb]"}>
              {q.step}
            </span>
          </span>
        ))}
      </div>
      <button
        onClick={onOpen}
        aria-label="인터랙션 설정"
        className="flex items-center gap-1 text-[#888] hover:text-black transition-colors"
      >
        <span className="material-icons-outlined text-[18px]">tune</span>
        <span className="text-[11px] tracking-[0.1em] uppercase font-mono">{presetLabel}</span>
      </button>
    </div>
  );
}
