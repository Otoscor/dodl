"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "@/lib/animation";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useToast } from "@/components/ui/Toast";
import {
  QUESTIONS,
  METRICS,
  GRADE_STATUS,
  ATTR_FILTERS,
  SORT_OPTIONS,
  type Grade,
  type AttrFilter,
  type SortKey,
} from "./data";
import { formatPrice } from "@/lib/utils";
import { recommend } from "./recommend";

// 지표 등급 원형 배지 — 흑백 톤 (A 진함 → C 옅음)
const GRADE_BOX: Record<Grade, string> = {
  A: "bg-black text-white",
  B: "bg-[#e0e0e0] text-black",
  C: "bg-[#f5f5f5] text-[#888]",
  D: "bg-[#f5f5f5] text-[#bbb] border border-[#eee]",
  E: "bg-white text-[#bbb] border border-[#e0e0e0]",
};
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

  // 결과 화면 필터/정렬
  const { showToast } = useToast();
  const [selectedAttrs, setSelectedAttrs] = useState<AttrFilter[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("추천순");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  const toggleAttr = (a: AttrFilter) =>
    setSelectedAttrs((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );

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

  // Top 3 위에서 필터(속성 AND) + 정렬(추천순 / 지표 등급순) 적용
  const displayed = useMemo(() => {
    let list = results.map((r) => r.product);
    if (selectedAttrs.length > 0) {
      list = list.filter((p) => selectedAttrs.every((a) => p.attrs.includes(a)));
    }
    const mi = (METRICS as readonly string[]).indexOf(sortKey);
    if (mi >= 0) {
      const rank: Record<string, number> = { A: 0, B: 1, C: 2 };
      list = [...list].sort((a, b) => rank[a.grades[mi]] - rank[b.grades[mi]]);
    }
    return list;
  }, [results, selectedAttrs, sortKey]);


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
            <motion.div key="result" {...containerMotion} className="flex flex-col gap-4">
              {/* 정보 배너 (닫기 가능) */}
              <motion.div
                {...itemMotion}
                className="flex items-start gap-3 rounded-[12px] bg-[#f9f9f9] border border-[#e0e0e0] p-4"
              >
                <span className="material-icons-outlined text-[20px] text-[#555] shrink-0 mt-0.5">
                  info
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-black">성분 영양을 6개 강강 지표로 분석했어요</p>
                  <p className="text-[13px] text-[#888] mt-0.5">최근에 더 맞는 제품을 골라보세요.</p>
                </div>
                <button
                  onClick={() => {}}
                  className="text-[20px] text-[#bbb] hover:text-[#888] transition-colors shrink-0"
                >
                  <span className="material-icons-outlined">close</span>
                </button>
              </motion.div>

              {/* 속성 탭 필터 */}
              <motion.div
                {...itemMotion}
                className="-mx-6 px-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="flex gap-2.5 w-max">
                  {ATTR_FILTERS.map((a) => {
                    const on = selectedAttrs.includes(a);
                    return (
                      <button
                        key={a}
                        onClick={() => toggleAttr(a)}
                        className={`shrink-0 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap ${
                          on
                            ? "bg-black text-white border border-black"
                            : "border border-[#d0d0d0] text-[#555] hover:border-black"
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </motion.div>


              {/* 섹션 카드 / 빈 상태 */}
              {displayed.length === 0 ? (
                <motion.div
                  {...itemMotion}
                  className="py-16 flex flex-col items-center text-center"
                >
                  <span className="material-icons-outlined text-[40px] text-[#d0d0d0]">
                    filter_alt_off
                  </span>
                  <p className="mt-3 text-[14px] text-[#888]">조건에 맞는 추천이 없어요</p>
                  <button
                    onClick={() => setSelectedAttrs([])}
                    className="mt-4 rounded-[10px] border border-[#e0e0e0] px-4 py-2 text-[13px] text-[#555]"
                  >
                    필터 초기화
                  </button>
                </motion.div>
              ) : (
                displayed.map((product) => (
                  <motion.div
                    key={product.id}
                    {...itemMotion}
                    onClick={() => router.push(`/scanner/${product.id}`)}
                    className="rounded-[12px] border border-[#e0e0e0] overflow-hidden bg-white cursor-pointer active:bg-[#fafafa] transition-colors"
                  >
                    {/* 상품 정보 — 이미지 + 이름 + 태그 + 평점 */}
                    <div className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="w-[64px] h-[64px] shrink-0 rounded-[10px] bg-[#f5f5f5] overflow-hidden flex items-center justify-center">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="material-icons-outlined text-[26px] text-[#cccccc]">
                              nutrition
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-medium text-black leading-snug line-clamp-2">
                            {product.name}
                          </p>
                          {product.attrs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {product.attrs.map((a) => (
                                <span
                                  key={a}
                                  className="rounded-[5px] bg-[#f5f5f5] px-1.5 py-0.5 text-[9px] text-[#888]"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[12px] text-[#ff8c00]">★ {product.rating}</span>
                            <span className="text-[12px] text-[#aaa]">({product.reviewCount})</span>
                          </div>
                        </div>
                      </div>

                      {/* 등급 그리드 — 2열, 큰 글자 A/B/C */}
                      <div className="grid grid-cols-2 gap-3">
                        {METRICS.map((m, i) => {
                          const g = product.grades[i];
                          return (
                            <div key={m} className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[15px] font-bold ${GRADE_BOX[g]}`}
                              >
                                {g}
                              </div>
                              <div className="flex-1 leading-tight">
                                <p className="text-[13px] text-black">{m}</p>
                                <p className="text-[11px] text-[#aaa]">{GRADE_STATUS[g]}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 가격 + 장바구니 버튼 (가로) */}
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <p className="text-[18px] font-bold text-black">
                          {formatPrice(product.price)}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showToast("장바구니에 담았습니다");
                          }}
                          className="shrink-0 rounded-full bg-black px-5 py-2.5 text-[14px] font-medium text-white active:bg-[#333] transition-colors whitespace-nowrap"
                        >
                          장바구니 담기
                        </button>
                      </div>
                    </div>

                  </motion.div>
                ))
              )}

              <motion.div {...itemMotion} className="pt-4">
                <button
                  onClick={handleRestart}
                  className="w-full rounded-[10px] border border-[#e0e0e0] bg-white py-3 text-[15px] font-medium text-[#555] active:bg-[#f5f5f5] transition-colors"
                >
                  다시하기
                </button>
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

      {/* 필터 시트 */}
      <BottomSheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)}>
        <div className="px-6 pt-2 pb-8">
          <h3 className="text-[16px] font-medium text-black mb-3">필터</h3>
          <div className="flex flex-col">
            {ATTR_FILTERS.map((a) => {
              const on = selectedAttrs.includes(a);
              return (
                <button
                  key={a}
                  onClick={() => toggleAttr(a)}
                  className="flex items-center justify-between py-3"
                >
                  <span className={`text-[15px] ${on ? "text-black font-medium" : "text-[#555]"}`}>
                    {a}
                  </span>
                  <span
                    className={`material-icons-outlined text-[22px] ${on ? "text-black" : "text-[#ccc]"}`}
                  >
                    {on ? "check_box" : "check_box_outline_blank"}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" fullWidth onClick={() => setSelectedAttrs([])}>
              초기화
            </Button>
            <Button variant="primary" fullWidth onClick={() => setFilterSheetOpen(false)}>
              적용
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* 정렬 시트 */}
      <BottomSheet open={sortSheetOpen} onClose={() => setSortSheetOpen(false)}>
        <div className="px-6 pt-2 pb-8">
          <h3 className="text-[16px] font-medium text-black mb-2">정렬</h3>
          <div className="flex flex-col">
            {SORT_OPTIONS.map((opt) => {
              const on = sortKey === opt;
              return (
                <button
                  key={opt}
                  onClick={() => {
                    setSortKey(opt);
                    setSortSheetOpen(false);
                  }}
                  className="flex items-center justify-between py-3"
                >
                  <span className={`text-[15px] ${on ? "text-black font-medium" : "text-[#555]"}`}>
                    {opt === "추천순" ? "추천순" : `${opt}순`}
                  </span>
                  {on && (
                    <span className="material-icons-outlined text-[20px] text-black">check</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </BottomSheet>
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
