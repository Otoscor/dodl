"use client";

import { useState } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_BRANDS } from "../mock";

export default function MyFollowingPage() {
  // 가상 관계: 처음 2개 브랜드를 팔로잉 상태로 시작
  const [following, setFollowing] = useState<Set<string>>(
    () => new Set(MOCK_BRANDS.slice(0, 2).map((b) => b.id))
  );

  const toggle = (id: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const followingBrands = MOCK_BRANDS.filter((b) => following.has(b.id));

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="팔로잉 브랜드" />

      {followingBrands.length === 0 ? (
        <EmptyState icon="storefront" title="팔로잉한 브랜드가 없습니다" description="관심 브랜드를 팔로우해보세요." />
      ) : (
        <>
          <p className="px-6 pt-4 text-[14px] text-text-tertiary">팔로잉 {followingBrands.length}</p>
          <div className="divide-y divide-border-subtle">
            {MOCK_BRANDS.map((brand) => {
              const isFollowing = following.has(brand.id);
              return (
                <div key={brand.id} className="px-6 py-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                    <span className="text-[15px] text-text-tertiary">{brand.name.slice(0, 1)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] text-text-primary">{brand.name}</p>
                    <p className="text-[13px] text-text-tertiary mt-0.5">상품 {brand.productCount}개</p>
                  </div>
                  <button
                    onClick={() => toggle(brand.id)}
                    className={`px-3 py-1.5 text-[13px] rounded-[10px] border transition-colors shrink-0 ${
                      isFollowing
                        ? "border-[#e0e0e0] bg-[#f5f5f5] text-[#888]"
                        : "border-black bg-black text-white"
                    }`}
                  >
                    {isFollowing ? "팔로잉" : "팔로우"}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
