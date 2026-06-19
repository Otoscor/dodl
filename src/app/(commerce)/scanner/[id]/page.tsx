"use client";

import { use, useState } from "react";
import Link from "next/link";
import { BackHeader } from "@/components/layout/BackHeader";
import { IndicatorGradeTable } from "@/components/commerce/IndicatorGradeTable";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";
import type { IndicatorGrade } from "@/types/product";
import {
  findProteinProduct,
  DETAIL_METRICS,
  METRICS,
  GRADE_STATUS,
  gradeReason,
  audienceFor,
  weakestMetricIndex,
  similarBy,
  type Grade,
} from "../data";
import {
  INGREDIENTS,
  INGREDIENT_DETAILS,
  CATEGORY_STYLE,
  CATEGORY_ORDER,
} from "../../products/[productId]/ingredients/data";

// 등급 배지 (지표등급표·왜 이런 평가) — 흑백, 균일 그레이 원형
function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span className="w-9 h-9 shrink-0 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[14px] font-semibold text-[#555]">
      {grade}
    </span>
  );
}

// 펼침 행 (왜 이런 평가 / 첨가물 상세)
function Collapsible({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#e8e8e8]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 py-4 text-left"
      >
        {header}
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          className={`shrink-0 text-[#aaa] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 8l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}

export default function ScannerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { showToast } = useToast();
  const product = findProteinProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <BackHeader />
        <p className="p-8 text-center text-[14px] text-[#aaa]">상품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const grades: IndicatorGrade[] = DETAIL_METRICS.map((metric, i) => ({
    metric,
    grade: product.grades[i],
    status: GRADE_STATUS[product.grades[i]],
  }));

  const audience = audienceFor(product);
  const weakIdx = weakestMetricIndex(product);
  const weakMetric = METRICS[weakIdx];
  const similar = similarBy(product, weakIdx);

  const catCount = (cat: (typeof CATEGORY_ORDER)[number]) =>
    INGREDIENTS.filter((x) => x.category === cat).length;

  const N = product.nutrition;
  const nutritionStats = [
    { label: "칼로리", value: N.calories, unit: "kcal" },
    { label: "단백질", value: N.protein, unit: "g" },
    { label: "당류", value: N.sugar, unit: "g" },
    { label: "지방", value: N.fat, unit: "g" },
    { label: "식이섬유", value: N.fiber, unit: "g" },
  ];

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        /* 취소 */
      }
    } else {
      showToast("공유 링크가 복사되었습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      <BackHeader
        rightAction={
          <button
            onClick={handleShare}
            aria-label="공유"
            className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-black"
          >
            <span className="material-icons-outlined text-[20px]">ios_share</span>
          </button>
        }
      />

      {/* 상품 이미지 */}
      <div className="aspect-square bg-[#f5f5f5] relative flex items-center justify-center overflow-hidden">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-contain" />
        ) : (
          <span className="material-icons-outlined text-[72px] text-[#e0e0e0]">nutrition</span>
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-1.5 rounded-full ${i === 0 ? "w-4 bg-black" : "w-1.5 bg-black/20"}`} />
          ))}
        </div>
      </div>

      {/* 제목 블록 */}
      <div className="px-6 pt-7 pb-7">
        <h1 className="text-[22px] text-black leading-snug tracking-[-0.02em]">{product.name}</h1>
        <p className="mt-1.5 text-[13px] text-[#888]">원산지: {product.origin}</p>
        {product.attrs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {product.attrs.map((a) => (
              <span key={a} className="rounded-[6px] bg-[#f5f5f5] px-2 py-1 text-[12px] text-[#888]">
                {a}
              </span>
            ))}
          </div>
        )}
        <p className="mt-4 font-mono text-[24px] font-semibold text-black">{formatPrice(product.price)}</p>
      </div>

      {/* 지표등급표 (재사용) */}
      <div className="border-t border-[#f0f0f0]">
        <IndicatorGradeTable grades={grades} />
      </div>

      {/* 왜 이런 평가일까 */}
      <section className="pt-10 px-6">
        <h2 className="text-[17px] text-black mb-2">왜 이런 평가일까?</h2>
        <div className="border-t border-[#e8e8e8]">
          {grades.map((g) => (
            <Collapsible
              key={g.metric}
              header={
                <div className="flex items-center gap-3">
                  <GradeBadge grade={g.grade} />
                  <div className="leading-tight">
                    <p className="text-[15px] text-black">{g.metric}</p>
                    <p className="text-[12px] text-[#888]">{g.status}</p>
                  </div>
                </div>
              }
            >
              <p className="text-[14px] text-[#666] leading-relaxed">{gradeReason(g.metric, g.grade)}</p>
            </Collapsible>
          ))}
        </div>
      </section>

      {/* 핵심 영양 */}
      <section className="pt-10 px-6">
        <h2 className="text-[17px] text-black mb-5">핵심 영양</h2>
        <div className="flex justify-between gap-2">
          {nutritionStats.map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <p className="text-[20px] font-bold text-black leading-none">
                {s.value}
                <span className="text-[11px] font-normal text-[#888] ml-0.5">{s.unit}</span>
              </p>
              <p className="text-[12px] text-[#888] mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 첨가물 등급 */}
      <section className="pt-10 px-6">
        <h2 className="text-[17px] text-black mb-4">첨가물 등급</h2>
        {/* 범례 (그레이 명도) */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
          {CATEGORY_ORDER.map((cat) => (
            <div key={cat} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_STYLE[cat].solid }} />
              <span className="text-[12px] text-[#888]">
                {cat} {catCount(cat)}
              </span>
            </div>
          ))}
        </div>
        {/* 성분 칩 플로우 */}
        <div className="flex flex-wrap gap-1.5">
          {INGREDIENTS.map((ing) => (
            <span
              key={ing.name}
              className="flex items-center gap-1.5 rounded-[6px] bg-[#f7f7f7] px-2 py-1 text-[12px] text-[#555]"
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_STYLE[ing.category].solid }} />
              {ing.name}
            </span>
          ))}
        </div>

        {/* 주요 첨가물 설명 */}
        <div className="mt-6 border-t border-[#e8e8e8]">
          {INGREDIENT_DETAILS.map((d) => (
            <Collapsible
              key={d.name}
              header={
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_STYLE[d.category].solid }} />
                    <span className="text-[12px] text-[#888]">{d.category}</span>
                  </div>
                  <p className="text-[15px] text-black mt-1">{d.name}</p>
                </div>
              }
            >
              <p className="text-[13px] text-[#888] leading-relaxed">{d.summary}</p>
              <div className="mt-3 space-y-3">
                {[
                  ["균형안", d.balanced],
                  ["직접안", d.direct],
                  ["기관 근거", d.basis],
                ].map(([label, text]) => (
                  <div key={label}>
                    <p className="text-[12px] font-semibold text-black mb-1">{label}</p>
                    <p className="text-[13px] text-[#666] leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </Collapsible>
          ))}
        </div>
      </section>

      {/* 이런 분께 */}
      <section className="pt-10 px-6">
        <h2 className="text-[17px] text-black mb-4">이런 분께</h2>
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-[12px] border border-[#e8e8e8] p-4">
            <p className="text-[14px] font-semibold text-black mb-2.5">추천 대상</p>
            <ul className="space-y-1.5">
              {audience.recommend.map((t) => (
                <li key={t} className="flex items-start gap-2 text-[14px] text-[#555]">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[12px] border border-[#e8e8e8] p-4">
            <p className="text-[14px] font-semibold text-black mb-2.5">고민 대상</p>
            <ul className="space-y-1.5">
              {audience.caution.map((t) => (
                <li key={t} className="flex items-start gap-2 text-[14px] text-[#555]">
                  <span className="mt-[6px] w-1.5 h-1.5 rounded-full border border-[#888] shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 비슷한 제품 */}
      {similar.length > 0 && (
        <section className="pt-10">
          <h2 className="px-6 text-[17px] text-black mb-4">{weakMetric} 지표가 더 좋은 비슷한 제품</h2>
          <div className="flex gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {similar.map((s) => (
              <Link key={s.id} href={`/scanner/${s.id}`} className="shrink-0 w-[136px] active:opacity-70">
                <div className="aspect-square rounded-[10px] bg-[#f5f5f5] overflow-hidden flex items-center justify-center">
                  {s.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image} alt={s.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="material-icons-outlined text-[30px] text-[#cccccc]">nutrition</span>
                  )}
                </div>
                <p className="mt-2 text-[13px] text-black leading-snug line-clamp-2">{s.name}</p>
                <p className="mt-1 text-[14px] font-bold text-black">{formatPrice(s.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 고정 하단 CTA */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white px-5 py-3 z-30 border-t border-[#f0f0f0]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("준비 중입니다", "info")}
            className="flex-1 rounded-[10px] border border-[#e0e0e0] py-3.5 text-[15px] font-medium text-black active:bg-[#f5f5f5] transition-colors"
          >
            선물하기
          </button>
          <button
            onClick={() => showToast("준비 중입니다", "info")}
            className="flex-[2] rounded-[10px] bg-black py-3.5 text-[15px] font-medium text-white active:bg-[#333] transition-colors"
          >
            구매하기
          </button>
        </div>
      </div>
    </div>
  );
}
