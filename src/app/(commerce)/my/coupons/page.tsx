"use client";

import { useState } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MOCK_COUPONS } from "../mock";

type Filter = "전체" | "사용가능" | "만료";

export default function MyCouponsPage() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<Filter>("사용가능");
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [registerOpen, setRegisterOpen] = useState(false);
  const [code, setCode] = useState("");

  const filtered = MOCK_COUPONS.filter((c) => {
    if (filter === "사용가능") return !c.expired;
    if (filter === "만료") return !!c.expired;
    return true;
  });

  const totalCount = MOCK_COUPONS.length;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    showToast(`${selected.size}개 쿠폰이 삭제되었습니다.`);
    setSelected(new Set());
    setEditMode(false);
  };

  const handleRegister = () => {
    if (!code.trim()) return;
    showToast("쿠폰이 등록되었습니다.");
    setCode("");
    setRegisterOpen(false);
  };

  const handleEditToggle = () => {
    setEditMode((v) => !v);
    setSelected(new Set());
  };

  return (
    <div className={`min-h-screen bg-white ${editMode ? "pb-32" : "pb-10"}`}>
      <BackHeader title="쿠폰함" />

      {/* 총 개수 + 액션 버튼 바 */}
      <div className="flex items-center justify-between px-6 pt-4 pb-3">
        <p className="text-[14px] text-[#888]">
          전체 쿠폰 <span className="text-black font-medium">{totalCount}개</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRegisterOpen(true)}
            className="px-4 py-1.5 text-[13px] border border-[#e0e0e0] rounded-[10px] text-black bg-white hover:bg-[#f5f5f5] transition-colors"
          >
            쿠폰 등록
          </button>
          <button
            onClick={handleEditToggle}
            className={`px-4 py-1.5 text-[13px] rounded-[10px] transition-colors ${
              editMode
                ? "bg-[#f5f5f5] text-[#888] border border-[#e0e0e0]"
                : "bg-black text-white"
            }`}
          >
            {editMode ? "취소" : "편집"}
          </button>
        </div>
      </div>


      {/* 필터 탭 */}
      <div className="flex gap-2 px-6 pb-3">
        {(["사용가능", "만료", "전체"] as Filter[]).map((f) => {
          const count =
            f === "사용가능"
              ? MOCK_COUPONS.filter((c) => !c.expired).length
              : f === "만료"
              ? MOCK_COUPONS.filter((c) => c.expired).length
              : totalCount;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[12px] uppercase tracking-[0.08em] border rounded-[10px] transition-colors ${
                filter === f
                  ? "border-black bg-black text-white"
                  : "border-[#e0e0e0] bg-[#f5f5f5] text-[#888]"
              }`}
            >
              {f} {count}
            </button>
          );
        })}
      </div>

      {/* 쿠폰 리스트 */}
      {filtered.length === 0 ? (
        <EmptyState icon="confirmation_number" title="해당하는 쿠폰이 없습니다" />
      ) : (
        <div className="px-6 flex flex-col gap-3">
          {filtered.map((coupon) => (
            <div
              key={coupon.id}
              className={`rounded-[10px] border bg-white overflow-hidden transition-colors ${
                editMode && selected.has(coupon.id)
                  ? "border-black"
                  : "border-[#e0e0e0]"
              } ${coupon.expired ? "opacity-45" : ""}`}
              onClick={editMode ? () => toggleSelect(coupon.id) : undefined}
            >
              {/* 상단: 태그 + 할인값 + 체크박스(편집 모드) */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {/* 태그 행 */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-[12px] text-[#555] bg-[#f0f0f0] rounded-[6px] px-2 py-0.5">
                        {coupon.typeTag}
                      </span>
                      {coupon.usageTag && (
                        <span className="text-[12px] text-[#555] bg-[#f0f0f0] rounded-[6px] px-2 py-0.5">
                          {coupon.usageTag}
                        </span>
                      )}
                    </div>
                    {/* 대형 할인값 */}
                    <p className="font-mono text-[32px] font-bold text-black leading-none">
                      {coupon.discount}
                    </p>
                  </div>

                  {/* 편집 모드 체크 */}
                  {editMode && (
                    <div
                      className={`mt-1 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selected.has(coupon.id) ? "border-black bg-black" : "border-[#ccc]"
                      }`}
                    >
                      {selected.has(coupon.id) && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-[#e0e0e0]" />

              {/* 하단: 쿠폰명·조건·만료일 */}
              <div className="px-5 py-4">
                <p className="text-[15px] text-black mb-1.5 leading-snug">{coupon.name}</p>
                <p className="text-[13px] text-[#888] mb-1">{coupon.condition}</p>
                <p className="text-[13px] text-[#888]">{coupon.expiry}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 편집 모드 하단 고정 바 */}
      {editMode && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-md border-t border-[#e0e0e0] px-6 py-4 z-30">
          <button
            disabled={selected.size === 0}
            onClick={handleDeleteSelected}
            className={`w-full py-3.5 rounded-[10px] text-[15px] font-medium transition-colors ${
              selected.size > 0
                ? "bg-black text-white"
                : "bg-[#f5f5f5] text-[#ccc] cursor-not-allowed"
            }`}
          >
            {selected.size > 0 ? `선택 쿠폰 삭제 (${selected.size})` : "쿠폰을 선택해주세요"}
          </button>
        </div>
      )}

      {/* 쿠폰 등록 모달 */}
      <Modal
        open={registerOpen}
        onClose={() => { setRegisterOpen(false); setCode(""); }}
        title="쿠폰 등록"
        actions={
          <>
            <Button variant="secondary" fullWidth onClick={() => { setRegisterOpen(false); setCode(""); }}>
              취소
            </Button>
            <Button fullWidth disabled={!code.trim()} onClick={handleRegister}>
              등록
            </Button>
          </>
        }
      >
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="쿠폰 코드를 입력해주세요"
          className="w-full px-3 py-2.5 bg-white text-[15px] text-black placeholder:text-[#cccccc] outline-none rounded-[10px] border border-[#e0e0e0] focus:border-black transition-colors"
          autoFocus
        />
      </Modal>
    </div>
  );
}
