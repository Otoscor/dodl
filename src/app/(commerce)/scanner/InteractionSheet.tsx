"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import {
  PRESETS,
  InteractionType,
  BLOB_SPEEDS,
  BlobSpeed,
  BlobStyle,
  BLOB_STYLE_RANGE,
  DEFAULT_BLOB_STYLE,
} from "./interactions";

interface InteractionSheetProps {
  open: boolean;
  onClose: () => void;
  value: InteractionType;
  onChange: (type: InteractionType) => void;
  stagger: boolean;
  onStaggerChange: (stagger: boolean) => void;
  blobOn: boolean;
  onBlobChange: (on: boolean) => void;
  blobSpeed: BlobSpeed;
  onBlobSpeedChange: (speed: BlobSpeed) => void;
  blobStyle: BlobStyle;
  onBlobStyleChange: (patch: Partial<BlobStyle>) => void;
}

type Tab = "transition" | "background";

const TABS: { id: Tab; label: string }[] = [
  { id: "transition", label: "전환 효과" },
  { id: "background", label: "배경" },
];

export function InteractionSheet({
  open,
  onClose,
  value,
  onChange,
  stagger,
  onStaggerChange,
  blobOn,
  onBlobChange,
  blobSpeed,
  onBlobSpeedChange,
  blobStyle,
  onBlobStyleChange,
}: InteractionSheetProps) {
  const [tab, setTab] = useState<Tab>("transition");

  return (
    <BottomSheet open={open} onClose={onClose}>
      {/* 헤더 */}
      <div className="px-4 pt-2 pb-3">
        <p className="text-[18px] text-black">인터랙션 설정</p>
      </div>

      {/* 탭 바 */}
      <div className="px-4">
        <div className="flex border-b border-[#e0e0e0]">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex-1 pb-3 pt-1 text-[15px] transition-colors ${
                  active ? "text-black font-medium" : "text-[#aaa]"
                }`}
              >
                {t.label}
                {active && (
                  <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-black" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "transition" ? (
        <TransitionTab
          value={value}
          onChange={onChange}
          stagger={stagger}
          onStaggerChange={onStaggerChange}
        />
      ) : (
        <BackgroundTab
          blobOn={blobOn}
          onBlobChange={onBlobChange}
          blobSpeed={blobSpeed}
          onBlobSpeedChange={onBlobSpeedChange}
          blobStyle={blobStyle}
          onBlobStyleChange={onBlobStyleChange}
        />
      )}

      {/* 닫기 */}
      <div className="px-4 pt-2 pb-6 border-t border-[#e0e0e0]">
        <Button variant="secondary" fullWidth onClick={onClose}>
          닫고 비교하기
        </Button>
      </div>
    </BottomSheet>
  );
}

/* ---------- 탭 1: 전환 효과 ---------- */

function TransitionTab({
  value,
  onChange,
  stagger,
  onStaggerChange,
}: {
  value: InteractionType;
  onChange: (type: InteractionType) => void;
  stagger: boolean;
  onStaggerChange: (stagger: boolean) => void;
}) {
  return (
    <>
      <p className="px-4 pt-3 text-[13px] text-[#aaa]">
        스텝 전환 · 옵션 탭 · 결과 등장에 적용됩니다
      </p>

      {/* 프리셋 목록 */}
      <div className="px-4 py-3 space-y-2">
        {PRESETS.map((preset) => {
          const isSelected = preset.id === value;
          return (
            <button
              key={preset.id}
              onClick={() => onChange(preset.id)}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-[10px] border transition-colors ${
                isSelected
                  ? "border-black bg-[#ebebeb]"
                  : "border-[#e0e0e0] bg-[#f5f5f5] hover:bg-[#ebebeb]"
              }`}
            >
              <span
                className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? "border-black" : "border-[#cccccc]"
                }`}
              >
                {isSelected && <span className="w-[9px] h-[9px] rounded-full bg-black" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] text-black tracking-[0.04em]">
                  {preset.label}
                </span>
                <span className="block text-[13px] text-[#888] mt-0.5">
                  {preset.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* 적용 방식 — 한 번에 / 시간차 */}
      <div className="px-4 py-3 border-t border-[#e0e0e0]">
        <button
          onClick={() => onStaggerChange(!stagger)}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <span className="min-w-0">
            <span className="block text-[15px] text-black">시간차 적용</span>
            <span className="block text-[13px] text-[#888] mt-0.5">
              {stagger ? "선택지가 순차적으로 등장합니다" : "선택지가 한 번에 전환됩니다"}
            </span>
          </span>
          <span
            className={`w-[22px] h-[22px] rounded-[6px] border flex items-center justify-center shrink-0 transition-colors ${
              stagger ? "bg-black border-black" : "bg-white border-[#cccccc]"
            }`}
          >
            {stagger && (
              <span className="material-icons-outlined text-white text-[16px]">check</span>
            )}
          </span>
        </button>
      </div>
    </>
  );
}

/* ---------- 탭 2: 배경 (blob 애니메이션) ---------- */

function BackgroundTab({
  blobOn,
  onBlobChange,
  blobSpeed,
  onBlobSpeedChange,
  blobStyle,
  onBlobStyleChange,
}: {
  blobOn: boolean;
  onBlobChange: (on: boolean) => void;
  blobSpeed: BlobSpeed;
  onBlobSpeedChange: (speed: BlobSpeed) => void;
  blobStyle: BlobStyle;
  onBlobStyleChange: (patch: Partial<BlobStyle>) => void;
}) {
  return (
    <>
      <p className="px-4 pt-3 text-[13px] text-[#aaa]">
        컬러 그라데이션 blob이 부유하며 형태가 변형됩니다
      </p>

      {/* ON/OFF */}
      <div className="px-4 py-3">
        <button
          onClick={() => onBlobChange(!blobOn)}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <span className="min-w-0">
            <span className="block text-[15px] text-black">배경 애니메이션</span>
            <span className="block text-[13px] text-[#888] mt-0.5">
              {blobOn ? "blob 그라데이션 표시" : "끔 (흰 배경)"}
            </span>
          </span>
          <span
            className={`w-[22px] h-[22px] rounded-[6px] border flex items-center justify-center shrink-0 transition-colors ${
              blobOn ? "bg-black border-black" : "bg-white border-[#cccccc]"
            }`}
          >
            {blobOn && (
              <span className="material-icons-outlined text-white text-[16px]">check</span>
            )}
          </span>
        </button>
      </div>

      {/* 속도 선택 */}
      <div className={`px-4 pb-3 ${blobOn ? "" : "opacity-40 pointer-events-none"}`}>
        <p className="text-[13px] text-[#888] mb-2">움직임 속도</p>
        <div className="space-y-2">
          {BLOB_SPEEDS.map((s) => {
            const isSelected = s.id === blobSpeed;
            return (
              <button
                key={s.id}
                onClick={() => onBlobSpeedChange(s.id)}
                className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-[10px] border transition-colors ${
                  isSelected
                    ? "border-black bg-[#ebebeb]"
                    : "border-[#e0e0e0] bg-[#f5f5f5] hover:bg-[#ebebeb]"
                }`}
              >
                <span
                  className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? "border-black" : "border-[#cccccc]"
                  }`}
                >
                  {isSelected && <span className="w-[9px] h-[9px] rounded-full bg-black" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] text-black tracking-[0.04em]">
                    {s.label}
                  </span>
                  <span className="block text-[13px] text-[#888] mt-0.5">
                    {s.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 그라데이션 속성 — 번짐 / 진하기 / 크기 */}
      <div className={`px-4 pb-3 ${blobOn ? "" : "opacity-40 pointer-events-none"}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] text-[#888]">그라데이션 속성</p>
          <button
            onClick={() => onBlobStyleChange(DEFAULT_BLOB_STYLE)}
            className="text-[12px] text-[#aaa] underline underline-offset-2 active:opacity-60"
          >
            초기화
          </button>
        </div>
        <div className="space-y-4">
          <Slider
            label="번짐"
            value={blobStyle.blur}
            display={`${Math.round(blobStyle.blur)}px`}
            range={BLOB_STYLE_RANGE.blur}
            onChange={(blur) => onBlobStyleChange({ blur })}
          />
          <Slider
            label="진하기"
            value={blobStyle.opacity}
            display={`${Math.round(blobStyle.opacity * 100)}%`}
            range={BLOB_STYLE_RANGE.opacity}
            onChange={(opacity) => onBlobStyleChange({ opacity })}
          />
          <Slider
            label="크기"
            value={blobStyle.scale}
            display={`${blobStyle.scale.toFixed(2)}x`}
            range={BLOB_STYLE_RANGE.scale}
            onChange={(scale) => onBlobStyleChange({ scale })}
          />
        </div>
      </div>
    </>
  );
}

/* ---------- 슬라이더 ---------- */

function Slider({
  label,
  value,
  display,
  range,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  range: { min: number; max: number; step: number };
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[14px] text-black">{label}</span>
        <span className="text-[13px] text-[#888] font-mono">{display}</span>
      </div>
      <input
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 cursor-pointer accent-black"
      />
    </div>
  );
}
