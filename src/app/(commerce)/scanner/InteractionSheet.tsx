"use client";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { PRESETS, InteractionType } from "./interactions";

interface InteractionSheetProps {
  open: boolean;
  onClose: () => void;
  value: InteractionType;
  onChange: (type: InteractionType) => void;
  stagger: boolean;
  onStaggerChange: (stagger: boolean) => void;
}

export function InteractionSheet({
  open,
  onClose,
  value,
  onChange,
  stagger,
  onStaggerChange,
}: InteractionSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      {/* 헤더 */}
      <div className="px-4 pt-2 pb-4 border-b border-[#e0e0e0]">
        <p className="text-[18px] text-black">인터랙션 타입</p>
        <p className="text-[14px] text-[#aaa] mt-0.5">
          스텝 전환 · 옵션 탭 · 결과 등장에 적용됩니다
        </p>
      </div>

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
              {/* 라디오 표시 */}
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

      {/* 닫기 */}
      <div className="px-4 pt-2 pb-6 border-t border-[#e0e0e0]">
        <Button variant="secondary" fullWidth onClick={onClose}>
          닫고 비교하기
        </Button>
      </div>
    </BottomSheet>
  );
}
