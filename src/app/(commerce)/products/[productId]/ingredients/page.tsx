"use client";

import { useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { BackHeader } from "@/components/layout/BackHeader";
import {
  INGREDIENTS,
  INGREDIENT_DETAILS,
  CALORIE_BREAKDOWN,
  TOTAL_CALORIES,
  CATEGORY_STYLE,
  CATEGORY_ORDER,
  type IngredientCategory,
  type IngredientDetail,
} from "./data";

export default function IngredientsPage() {
  const [filter, setFilter] = useState<IngredientCategory>("영양강화");
  const [openIdx, setOpenIdx] = useState<number | null>(1); // 효소처리스테비아 기본 펼침

  return (
    <div className="min-h-screen bg-white pb-12">
      <BackHeader title="원재료 전체보기" />

      {/* 1) 인포그래픽 — 디자인용 정적 게이지 */}
      <CalorieGauge />

      <div className="h-2 bg-[#f5f5f5]" />

      {/* 2) 원재료 한눈에 보기 */}
      <section className="px-6 pt-7">
        <h2 className="text-[18px] text-black mb-4">원재료 한눈에 보기</h2>

        {/* 필터 칩 — 단일 선택 */}
        <div className="flex gap-2 mb-4">
          {CATEGORY_ORDER.map((cat) => {
            const active = filter === cat;
            const c = CATEGORY_STYLE[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] transition-colors ${
                  active
                    ? "border border-black bg-white text-black"
                    : "border border-transparent bg-[#f0f0f0] text-[#999]"
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.solid }} />
                {cat}
              </button>
            );
          })}
        </div>

        {/* 재료 클라우드 — 선택 필터 카테고리만 강조 */}
        <div className="rounded-[14px] bg-[#f7f7f7] p-4 flex flex-wrap gap-2">
          {INGREDIENTS.map((ing) => {
            const on = ing.category === filter;
            return (
              <span
                key={ing.name}
                className={`rounded-full px-3 py-1.5 text-[14px] leading-none transition-colors ${
                  on ? "bg-[#dadada] text-[#1f1f1f]" : "bg-[#f0f0f0] text-[#bcbcbc]"
                }`}
              >
                {ing.name}
              </span>
            );
          })}
        </div>
      </section>

      {/* 3) 주요 재료 아코디언 */}
      <section className="px-6 pt-6 space-y-3">
        {INGREDIENT_DETAILS.map((d, i) => (
          <AccordionCard
            key={d.name}
            detail={d}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}
      </section>
    </div>
  );
}

/* ---------- 인포그래픽 게이지 (recharts 반원 도넛) ---------- */

const GAUGE_DATA = CALORIE_BREAKDOWN.map((s) => ({
  name: s.category,
  value: s.value,
  fill: CATEGORY_STYLE[s.category].solid,
}));

function CalorieGauge() {
  return (
    <div className="pt-6 pb-7">
      <div className="relative mx-auto" style={{ width: 260, height: 150 }}>
        <PieChart width={260} height={150}>
          <Pie
            data={GAUGE_DATA}
            dataKey="value"
            nameKey="name"
            cx={130}
            cy={130}
            startAngle={180}
            endAngle={0}
            innerRadius={90}
            outerRadius={106}
            cornerRadius={13}
            paddingAngle={3}
            stroke="none"
            isAnimationActive={false}
          >
            {GAUGE_DATA.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-x-0 text-center" style={{ top: 70 }}>
          <p className="text-[28px] font-bold text-black leading-none">{TOTAL_CALORIES.toLocaleString()}</p>
          <p className="mt-1.5 text-[13px] text-[#888]">총 섭취 칼로리</p>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex justify-center gap-5 mt-2">
        {CALORIE_BREAKDOWN.map((s) => (
          <div key={s.category} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_STYLE[s.category].solid }} />
            <span className="text-[13px] text-[#666]">{s.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 주요 재료 아코디언 카드 ---------- */

function AccordionCard({
  detail,
  open,
  onToggle,
}: {
  detail: IngredientDetail;
  open: boolean;
  onToggle: () => void;
}) {
  const c = CATEGORY_STYLE[detail.category];
  return (
    <div className="rounded-[14px] border border-[#ededed] overflow-hidden">
      <button onClick={onToggle} className="w-full text-left px-5 py-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.solid }} />
          <span className="text-[13px] text-[#888]">{detail.category}</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[19px] text-black leading-snug min-w-0">{detail.name}</p>
          <span
            className={`material-icons-outlined text-[22px] text-[#bbb] shrink-0 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </div>
        <p className="mt-2 text-[14px] text-[#888] leading-relaxed">{detail.summary}</p>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="border-t border-[#f0f0f0] pt-4 space-y-4">
            <div>
              <p className="text-[15px] font-medium text-black mb-1.5">균형안</p>
              <p className="text-[14px] text-[#777] leading-relaxed">{detail.balanced}</p>
            </div>
            <div>
              <p className="text-[15px] font-medium text-black mb-1.5">직접안</p>
              <p className="text-[14px] text-[#777] leading-relaxed">{detail.direct}</p>
            </div>
            <div className="rounded-[12px] bg-[#f7f7f7] px-4 py-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="material-icons-outlined text-[18px] text-[#888]">school</span>
                <span className="text-[14px] text-black font-medium">기관 근거</span>
              </div>
              <p className="text-[13.5px] text-[#777] leading-relaxed">{detail.basis}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
