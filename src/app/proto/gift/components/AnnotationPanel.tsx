"use client";

import { STEPS, type StepId } from "../data";

const TAG_STYLE: Record<string, string> = {
  POLICY: "bg-[#2f2f2f] text-white",
  CASE: "bg-[#e0e0e0] text-[#333]",
  DATA: "border border-[#c9c9c9] bg-white text-[#6b6b6b]",
};

function Group({ tag, items }: { tag: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-[8px]">
      {items.map((text, i) => (
        <div key={i} className="flex items-start gap-[8px]">
          <span className={`mt-[1px] shrink-0 rounded px-[6px] py-[2px] text-[10px] font-bold ${TAG_STYLE[tag]}`}>
            {tag}
          </span>
          <span className="text-[13px] leading-[1.5] text-[#4b4b4b]">{text}</span>
        </div>
      ))}
    </div>
  );
}

// 현재 화면의 POLICY/CASE/DATA 주석 동기 노출 (기획·개발용).
export default function AnnotationPanel({ current }: { current: StepId }) {
  const step = STEPS.find((s) => s.id === current)!;
  const a = step.annotation;

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <div className="flex items-center gap-[8px]">
        <span className="flex size-[24px] items-center justify-center rounded-full bg-[#2f2f2f] text-[12px] font-bold text-white">
          {step.num}
        </span>
        <h2 className="text-[15px] font-bold text-[#333]">{step.title}</h2>
      </div>
      <div className="h-px w-full bg-[#e5e5e5]" />
      <Group tag="POLICY" items={a.policy} />
      <Group tag="CASE" items={a.case} />
      <Group tag="DATA" items={a.data} />
      <p className="mt-[4px] text-[11px] leading-[1.5] text-[#b0b0b0]">
        태그 규칙: <b>POLICY</b> 정책 · <b>CASE</b> 케이스/분기 · <b>DATA</b> 데이터 필드
      </p>
    </div>
  );
}
