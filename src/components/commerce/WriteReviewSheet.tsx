"use client";

import { useRef, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface WriteReviewSheetProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  onSuccess?: () => void;
}

export function WriteReviewSheet({ open, onClose, productName, onSuccess }: WriteReviewSheetProps) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setRating(0);
    setName("");
    setBody("");
    setSubmitting(false);
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
  };

  const handleClose = () => {
    reset();
    onClose();
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

  const handleSubmit = async () => {
    if (!rating || !name.trim()) return;
    setSubmitting(true);

    // 사진 업로드 (있을 경우)
    let photoUrls: string[] = [];
    if (photos.length > 0) {
      const results = await Promise.all(
        photos.map(async ({ file }) => {
          const fd = new FormData();
          fd.append("file", file);
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          const d = await r.json();
          return d.success ? (d.url as string) : null;
        })
      );
      photoUrls = results.filter((u): u is string => u !== null);
    }

    // 가상 처리 (내 리뷰 페이지는 DB에 연결된 productId가 없으므로 토스트만)
    void photoUrls;
    showToast("리뷰가 등록되었습니다.");
    reset();
    onClose();
    onSuccess?.();
  };

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="px-4 pt-2 pb-4 border-b border-[#e0e0e0]">
        <p className="text-[18px] text-black">리뷰 작성</p>
        <p className="text-[14px] text-[#aaa] mt-0.5">{productName}</p>
      </div>

      <div className="px-4 py-5 space-y-5 overflow-y-auto max-h-[65vh]">
        {/* 별점 */}
        <div>
          <p className="text-[15px] text-[#888] mb-2">별점</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-[32px] transition-opacity ${star <= rating ? "text-black" : "text-[#e0e0e0]"}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* 이름 */}
        <Input
          label="이름"
          value={name}
          onChange={setName}
          placeholder="닉네임을 입력해주세요"
          maxLength={20}
        />

        {/* 본문 */}
        <div>
          <p className="text-[15px] text-[#888] mb-1.5">내용 <span className="text-[#e0e0e0]">(선택)</span></p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="상품 사용 후기를 자유롭게 작성해주세요."
            rows={4}
            className="w-full px-3 py-2.5 bg-white text-[15px] text-black placeholder:text-[#cccccc] outline-none resize-none rounded-[10px] border border-[#e0e0e0]"
            maxLength={500}
          />
        </div>

        {/* 사진 첨부 */}
        <div>
          <p className="text-[15px] text-[#888] mb-1.5">
            사진 <span className="text-[#e0e0e0]">(선택 · 최대 5장)</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {photos.map((p, i) => (
              <div key={i} className="relative w-[72px] h-[72px] rounded-[10px] overflow-hidden bg-[#f5f5f5] shrink-0">
                <img src={p.preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handlePhotoRemove(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-[11px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-[72px] h-[72px] rounded-[10px] bg-white border border-dashed border-[#e0e0e0] flex items-center justify-center text-[#cccccc] text-[22px] shrink-0"
              >
                +
              </button>
            )}
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 border-t border-[#e0e0e0]">
        <Button
          fullWidth
          size="lg"
          disabled={rating === 0 || name.trim() === "" || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "등록 중..." : "리뷰 등록"}
        </Button>
      </div>
    </BottomSheet>
  );
}
