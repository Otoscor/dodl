"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "@/lib/animation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QUESTIONS, TAG_LABEL } from "./data";
import { recommend } from "./recommend";
import { InteractionSheet } from "./InteractionSheet";
import { getPreset, InteractionType, STORAGE_KEY, STAGGER_KEY } from "./interactions";

function readStoredInteraction(): InteractionType {
  if (typeof window === "undefined") return "instant";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "slide" || v === "fade" || v === "pop" || v === "instant") return v;
  return "instant";
}

function readStoredStagger(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STAGGER_KEY) === "1";
}

export default function ScannerPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0~2: 질문, 3: 결과
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1); // 1: 다음, -1: 이전/리셋

  const [interaction, setInteraction] = useState<InteractionType>("instant");
  const [stagger, setStagger] = useState(false); // false: 한 번에, true: 시간차
  const [sheetOpen, setSheetOpen] = useState(false);

  // localStorage에서 초기값 복원 (마운트 후 1회)
  useEffect(() => {
    setInteraction(readStoredInteraction());
    setStagger(readStoredStagger());
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
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-14 px-6">
          {!isResult ? (
            <button
              onClick={handleBack}
              aria-label="뒤로"
              className="w-8 h-8 -ml-2 flex items-center justify-center text-[#888] hover:text-black transition-colors"
            >
              <span className="material-icons-outlined text-[22px]">arrow_back</span>
            </button>
          ) : (
            <span className="w-8 h-8" />
          )}
          <span className="text-[12px] tracking-[0.1em] uppercase text-[#aaa] font-mono">
            {isResult ? "RESULT" : `0${step + 1} / 0${QUESTIONS.length}`}
          </span>
        </div>
      </header>

      <div className="px-6 pb-24 overflow-x-hidden">
        {/* 캡션 + 타이틀 — 정적 (애니메이션 미적용) */}
        <div className="pt-4">
          <CaptionRow
            label={isResult ? "단백질 스캐너 결과" : "단백질 스캐너"}
            presetLabel={preset.label}
            onOpen={() => setSheetOpen(true)}
          />
          <h1 className="text-[22px] leading-snug tracking-[-0.01em] text-black mb-8">
            {isResult
              ? "내 선택에 딱 맞는 단백질 쉐이크 3"
              : `0${step + 1}. ${question.title}`}
          </h1>
        </div>

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
                    className={`w-full text-left px-5 py-4 rounded-[10px] border text-[15px] leading-snug transition-colors ${
                      isSelected
                        ? "border-black bg-[#ebebeb] text-black"
                        : "border-[#e0e0e0] bg-[#f5f5f5] text-[#333] hover:bg-[#ebebeb]"
                    }`}
                  >
                    {option.label}
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div key="result" {...containerMotion} className="flex flex-col gap-4">
              {results.map(({ product, reasons }, i) => (
                <motion.article
                  key={product.id}
                  {...itemMotion}
                  className="rounded-[10px] border border-[#e0e0e0] bg-white p-5"
                >
                  <Badge variant={i === 0 ? "red" : "default"}>{`No.${i + 1}`}</Badge>
                  <h2 className="mt-3 text-[17px] leading-snug text-black">
                    {product.name}
                  </h2>
                  <p className="mt-1 font-mono text-[13px] text-[#888] tracking-[0.02em]">
                    {product.subtitle}
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#888]">
                    {product.blurb}
                  </p>
                  {reasons.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {reasons.map((tag) => (
                        <span
                          key={tag}
                          className="text-[12px] text-[#888] bg-[#f5f5f5] rounded-[6px] px-2 py-0.5"
                        >
                          {TAG_LABEL[tag]}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.article>
              ))}

              <motion.div {...itemMotion} className="mt-4">
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
      />
    </div>
  );
}

function CaptionRow({
  label,
  presetLabel,
  onOpen,
}: {
  label: string;
  presetLabel: string;
  onOpen: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-[12px] tracking-[0.1em] uppercase text-[#aaa]">{label}</p>
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
