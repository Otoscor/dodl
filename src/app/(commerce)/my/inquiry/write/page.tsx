"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BackHeader } from "@/components/layout/BackHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";
import type { ProductListItem } from "@/types/product";
import { INQUIRY_CATEGORIES, INQUIRY_DETAIL_TYPES } from "../../mock";

const BODY_MAX = 1000;

export default function InquiryWritePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [category, setCategory] = useState<string>(INQUIRY_CATEGORIES[0]);
  const [detail, setDetail] = useState<string>("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // 문의 상품 선택
  const [recentProducts, setRecentProducts] = useState<ProductListItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const all: ProductListItem[] = data.products || [];
        // 가상 관계: 실제 상품 일부를 "최근 본 상품"으로 노출
        setRecentProducts(all.length > 6 ? all.slice(0, 6) : all);
      })
      .catch(() => {});
  }, []);

  const detailOptions = useMemo(() => INQUIRY_DETAIL_TYPES[category] ?? [], [category]);

  const canSubmit = title.trim() !== "" && body.trim() !== "";

  const handleCategory = (c: string) => {
    setCategory(c);
    setDetail(""); // 유형 바뀌면 세부 유형 초기화
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - photos.length;
    const toAdd = files.slice(0, remaining).map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotos((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    showToast("문의가 등록되었습니다.");
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    router.back();
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      <BackHeader title="1:1 문의하기" />

      <div className="px-6 pt-2 space-y-6">
        {/* 문의 유형 */}
        <section>
          <p className="text-[15px] text-black mb-3">문의 유형</p>

          {/* 카테고리 칩 — 가로 스크롤 */}
          <div className="-mx-6 px-6 flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {INQUIRY_CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => handleCategory(c)}
                  className={`shrink-0 px-5 py-2.5 rounded-full text-[14px] border transition-colors ${
                    active
                      ? "border-black text-black"
                      : "border-[#e8e8e8] text-[#bbb]"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {/* 세부 유형 드롭다운 */}
          <div className="relative mt-3">
            <select
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className={`w-full appearance-none bg-[#f7f7f7] rounded-[14px] px-5 py-4 text-[15px] outline-none ${
                detail ? "text-black" : "text-[#bbb]"
              }`}
            >
              <option value="" disabled>
                문의 유형을 선택해주세요.
              </option>
              {detailOptions.map((d) => (
                <option key={d} value={d} className="text-black">
                  {d}
                </option>
              ))}
            </select>
            <svg
              width="20" height="20" viewBox="0 0 20 20" fill="none"
              className="absolute right-5 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none"
            >
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* 상품 선택 (상품 문의일 때만) */}
          {category === "상품" && (
            selectedProduct ? (
              <div className="mt-3 flex items-center gap-3 rounded-[14px] border border-[#e8e8e8] p-3">
                <div className="w-[52px] h-[52px] rounded-[10px] bg-[#f5f5f5] shrink-0 relative overflow-hidden flex items-center justify-center">
                  {selectedProduct.image_url?.startsWith("http") ? (
                    <Image src={selectedProduct.image_url} alt={selectedProduct.name} fill className="object-cover" sizes="52px" />
                  ) : (
                    <span className="material-icons-outlined text-[24px] text-[#e0e0e0]">medication</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-[#aaa] mb-0.5">{selectedProduct.brand || selectedProduct.category_name}</p>
                  <p className="text-[14px] text-black leading-snug line-clamp-1">{selectedProduct.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="shrink-0 text-[13px] text-[#888] underline underline-offset-2 px-1"
                >
                  변경
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="w-full mt-3 rounded-full border border-[#e8e8e8] px-5 py-3.5 text-[15px] text-[#888]"
              >
                문의하실 상품을 선택해주세요
              </button>
            )
          )}
        </section>

        {/* 제목 */}
        <Input
          label="제목"
          required
          value={title}
          onChange={setTitle}
          placeholder="제목을 입력해주세요."
          maxLength={50}
        />

        {/* 내용 */}
        <section>
          <div className="bg-[#f7f7f7] rounded-[14px] px-5 py-4">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))}
              placeholder="내용을 입력해주세요."
              rows={5}
              className="w-full bg-transparent text-[16px] text-black placeholder:text-[#bbb] outline-none resize-none"
            />
          </div>
          <p className="mt-2 text-right text-[13px] text-[#bbb]">
            {body.length}/{BODY_MAX}
          </p>
        </section>

        {/* 사진 추가 */}
        <section>
          <div className="flex gap-3 flex-wrap">
            {photos.map((p, i) => (
              <div key={i} className="relative w-[88px] h-[88px] rounded-[14px] overflow-hidden bg-[#f5f5f5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handlePhotoRemove(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/55 text-white text-[11px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-[88px] h-[88px] rounded-[14px] border border-dashed border-[#d8d8d8] flex flex-col items-center justify-center gap-1 text-[#bbb]"
              >
                <span className="material-icons-outlined text-[24px]">photo_camera</span>
                <span className="text-[12px]">사진 추가</span>
              </button>
            )}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </section>
      </div>

      {/* 하단 고정 등록 버튼 (바텀 탭바 위) */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-md px-6 py-4 border-t border-[#e0e0e0] z-30">
        <Button fullWidth size="lg" disabled={!canSubmit} onClick={handleSubmit}>
          문의 등록하기
        </Button>
      </div>

      {/* 문의 상품 선택 바텀시트 — 최근 본 상품 */}
      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)}>
        <div className="px-5 pt-2 pb-4 border-b border-[#eee]">
          <p className="text-[18px] text-black">문의할 상품 선택</p>
          <p className="text-[14px] text-[#aaa] mt-0.5">최근 본 상품 중에서 선택해주세요.</p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#f0f0f0] pb-2">
          {recentProducts.length === 0 ? (
            <p className="px-5 py-10 text-center text-[14px] text-[#bbb]">최근 본 상품이 없습니다.</p>
          ) : (
            recentProducts.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedProduct(p);
                    setPickerOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left active:bg-[#f7f7f7] transition-colors"
                >
                  <div className="w-[60px] h-[60px] rounded-[10px] bg-[#f5f5f5] shrink-0 relative overflow-hidden flex items-center justify-center">
                    {p.image_url?.startsWith("http") ? (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="60px" />
                    ) : (
                      <span className="material-icons-outlined text-[26px] text-[#e0e0e0]">medication</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-[#aaa] mb-0.5">{p.brand || p.category_name}</p>
                    <p className="text-[14px] text-black leading-snug line-clamp-2 mb-0.5">{p.name}</p>
                    <p className="font-mono text-[14px] text-black">
                      {p.all_sold_out ? "품절" : formatPrice(p.min_price)}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="material-icons-outlined text-[20px] text-black shrink-0">check</span>
                  )}
                </button>
              );
            })
          )}
        </div>
        <div className="h-6" />
      </BottomSheet>
    </div>
  );
}
