"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QUESTIONS, TAG_LABEL } from "./data";
import { recommend } from "./recommend";

export default function ScannerPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0~2: 질문, 3: 결과
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const isResult = step >= QUESTIONS.length;
  const question = QUESTIONS[step];

  const results = useMemo(
    () => (isResult ? recommend(answers) : []),
    [isResult, answers]
  );

  const handleSelect = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      router.push("/home");
    } else {
      setStep((s) => s - 1);
    }
  };

  const handleRestart = () => {
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
            {isResult
              ? "RESULT"
              : `0${step + 1} / 0${QUESTIONS.length}`}
          </span>
        </div>
      </header>

      <div className="px-6 pb-24">
        {!isResult ? (
          <section className="pt-4">
            <p className="text-[12px] tracking-[0.1em] uppercase text-[#aaa] mb-3">
              단백질 스캐너
            </p>
            <h1 className="text-[22px] leading-snug tracking-[-0.01em] text-black mb-8">
              {`0${step + 1}. ${question.title}`}
            </h1>

            <div className="space-y-3">
              {question.options.map((option, i) => {
                const isSelected = answers[question.id] === i;
                return (
                  <button
                    key={option.label}
                    onClick={() => handleSelect(i)}
                    className={`w-full text-left px-5 py-4 rounded-[10px] border text-[15px] leading-snug transition-colors ${
                      isSelected
                        ? "border-black bg-[#ebebeb] text-black"
                        : "border-[#e0e0e0] bg-[#f5f5f5] text-[#333] hover:bg-[#ebebeb]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="pt-4">
            <p className="text-[12px] tracking-[0.1em] uppercase text-[#aaa] mb-3">
              단백질 스캐너 결과
            </p>
            <h1 className="text-[22px] leading-snug tracking-[-0.01em] text-black mb-8">
              내 선택에 딱 맞는 단백질 쉐이크 3
            </h1>

            <div className="space-y-4">
              {results.map(({ product, reasons }, i) => (
                <article
                  key={product.id}
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
                </article>
              ))}
            </div>

            <div className="mt-8">
              <Button variant="secondary" fullWidth onClick={handleRestart}>
                처음으로
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
