"use client";

import { useState } from "react";
import Link from "next/link";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { STORIES, type KnobDef, type KnobValues, type Story } from "./stories";

export default function ComponentsPage() {
  const [activeId, setActiveId] = useState(STORIES[0].id);
  const active = STORIES.find((s) => s.id === activeId) ?? STORIES[0];

  const [values, setValues] = useState<KnobValues>(active.defaults);
  const [resetCount, setResetCount] = useState(0);
  const [callback, setCallback] = useState<string | null>(null);

  const switchStory = (story: Story) => {
    setActiveId(story.id);
    setValues(story.defaults);
    setCallback(null);
    setResetCount(0);
  };

  const setKnob = (key: string, value: KnobValues[string]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setCallback(null);
  };

  const remountKey = `${active.id}:${active.signature(values)}:${resetCount}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white text-black">
      <div className="mx-auto max-w-[1000px] px-6 py-8">
        {/* 상단 바 */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-[13px] text-[#888] hover:text-black transition-colors"
          >
            ← dodl
          </Link>
          <span className="text-[12px] text-[#ccc]">컴포넌트 문서</span>
        </div>

        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-[28px] tracking-tight">컴포넌트</h1>
          <p className="text-[14px] text-[#888] mt-1">
            실제 컴포넌트를 state 값을 조절하며 확인합니다.
          </p>
          <div className="mt-4 h-px bg-[#e0e0e0]" />
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── 좌: 네비 + 라이브 프리뷰 ── */}
          <div className="flex-1 min-w-0">
            {/* 컴포넌트 목록 */}
            <nav className="flex flex-wrap gap-2 mb-6">
              {STORIES.map((story) => {
                const isActive = story.id === active.id;
                return (
                  <button
                    key={story.id}
                    onClick={() => switchStory(story)}
                    className={`px-3 py-1.5 text-[13px] rounded-[10px] border transition-colors ${
                      isActive
                        ? "border-black bg-black text-white"
                        : "border-[#e0e0e0] bg-[#f5f5f5] text-[#888] hover:bg-[#ebebeb]"
                    }`}
                  >
                    {story.name}
                  </button>
                );
              })}
            </nav>

            {/* 라이브 프리뷰 */}
            <section>
              <p className="text-[12px] uppercase tracking-[0.08em] text-[#aaa] mb-2">
                Live Preview
              </p>
              <div className="rounded-[10px] border border-[#e0e0e0] bg-[#fafafa] p-6 flex justify-center">
                <div className="w-full max-w-[390px]">
                  <div key={remountKey}>{active.render(values, setCallback)}</div>
                </div>
              </div>

              {/* 콜백 출력 readout */}
              <div className="mt-3 rounded-[10px] border border-[#e0e0e0] bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-[#aaa] mb-1">
                  onSkuSelected 콜백 출력
                </p>
                <p className="text-[13px] font-mono text-black">
                  {callback ?? <span className="text-[#ccc]">선택 대기 중…</span>}
                </p>
              </div>
            </section>
          </div>

          {/* ── 우: 컨트롤 + 상태 + Props ── */}
          <aside className="lg:w-[320px] shrink-0 space-y-6">
            {/* Controls */}
            <section className="rounded-[10px] border border-[#e0e0e0] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] uppercase tracking-[0.08em] text-[#aaa]">
                  Controls
                </p>
                <button
                  onClick={() => {
                    setResetCount((c) => c + 1);
                    setCallback(null);
                  }}
                  className="text-[12px] text-[#888] hover:text-black transition-colors"
                >
                  선택 초기화 ↺
                </button>
              </div>

              <div className="space-y-4">
                {active.knobs
                  .filter((knob) => !knob.visible || knob.visible(values))
                  .map((knob) => (
                    <KnobControl
                      key={knob.key}
                      knob={knob}
                      value={values[knob.key]}
                      onChange={(v) => setKnob(knob.key, v)}
                    />
                  ))}
              </div>
            </section>

            {/* 상태 목록 */}
            <section>
              <p className="text-[12px] uppercase tracking-[0.08em] text-[#aaa] mb-2">
                States
              </p>
              <div className="flex flex-wrap gap-1.5">
                {active.states.map((state) => (
                  <span
                    key={state}
                    className="px-2 py-0.5 text-[12px] rounded-[6px] bg-[#f0f0f0] text-[#555]"
                  >
                    {state}
                  </span>
                ))}
              </div>
            </section>

            {/* Props */}
            <section>
              <p className="text-[12px] uppercase tracking-[0.08em] text-[#aaa] mb-2">
                Props
              </p>
              <div className="space-y-3">
                {active.propsDoc.map((prop) => (
                  <div key={prop.name}>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <code className="text-[13px] font-mono text-black">{prop.name}</code>
                      <code className="text-[11px] font-mono text-[#888]">{prop.type}</code>
                    </div>
                    <p className="text-[12px] text-[#888] mt-0.5 leading-relaxed">
                      {prop.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ── 제네릭 Knob 컨트롤 ── */
function KnobControl({
  knob,
  value,
  onChange,
}: {
  knob: KnobDef;
  value: KnobValues[string];
  onChange: (value: KnobValues[string]) => void;
}) {
  if (knob.type === "radio") {
    return (
      <div>
        <p className="text-[13px] text-black mb-2">{knob.label}</p>
        <div className="flex gap-2">
          {knob.options.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => onChange(opt.value)}
                className={`flex-1 px-3 py-1.5 text-[13px] rounded-[10px] border transition-colors ${
                  selected
                    ? "border-black bg-black text-white"
                    : "border-[#e0e0e0] bg-[#f5f5f5] text-[#888] hover:bg-[#ebebeb]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (knob.type === "toggle") {
    return (
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-black">{knob.label}</p>
        <ToggleSwitch
          on={Boolean(value)}
          onChange={(on) => onChange(on)}
          aria-label={knob.label}
        />
      </div>
    );
  }

  // stepper
  const num = Number(value);
  return (
    <div className="flex items-center justify-between">
      <p className="text-[13px] text-black">{knob.label}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(knob.min, num - 1))}
          disabled={num <= knob.min}
          className="w-7 h-7 rounded-[8px] border border-[#e0e0e0] text-[#888] disabled:opacity-30 hover:bg-[#f5f5f5] transition-colors"
        >
          −
        </button>
        <span className="text-[14px] font-mono w-5 text-center tabular-nums">{num}</span>
        <button
          onClick={() => onChange(Math.min(knob.max, num + 1))}
          disabled={num >= knob.max}
          className="w-7 h-7 rounded-[8px] border border-[#e0e0e0] text-[#888] disabled:opacity-30 hover:bg-[#f5f5f5] transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
