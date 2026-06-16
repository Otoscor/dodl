"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface ProductRowBase {
  imageUrl?: string;
  brand: string;
  name: string;
  optionSummary?: string;
  quantity?: number;
}

interface ProductRowCart extends ProductRowBase {
  variant: "cart";
  price: number;
  checked: boolean;
  onCheck: (checked: boolean) => void;
  onRemove: () => void;
}

interface ProductRowOrder extends ProductRowBase {
  variant: "order";
  price: number;
  onClick?: () => void;
}

interface ProductRowCompact extends ProductRowBase {
  variant: "compact";
}

export type ProductRowProps = ProductRowCart | ProductRowOrder | ProductRowCompact;

export function ProductRow(props: ProductRowProps) {
  const { variant, imageUrl, brand, name, optionSummary, quantity } = props;

  const imgSize = variant === "compact" ? 64 : 80;
  const isCart = variant === "cart";
  const isOrder = variant === "order";

  const handleRowClick = () => {
    if (isCart) props.onCheck(!props.checked);
    else if (isOrder && props.onClick) props.onClick();
  };

  return (
    <div
      className={`flex items-start gap-3 px-5 py-4 bg-white ${
        variant === "compact" ? "border-b border-[#e8e8e8]" : ""
      } ${isCart || isOrder ? "cursor-pointer active:bg-[#fafafa]" : ""}`}
      onClick={handleRowClick}
    >
      {/* 왼쪽 슬롯 — 체크박스 (cart only) */}
      {isCart && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); props.onCheck(!props.checked); }}
          className={`shrink-0 w-6 h-6 rounded-[4px] border-2 flex items-center justify-center transition-colors mt-0.5 ${
            props.checked ? "bg-black border-black" : "bg-white border-[#cccccc]"
          }`}
          aria-label="선택"
        >
          {props.checked && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      )}

      {/* 이미지 */}
      <div
        className="shrink-0 rounded-[10px] overflow-hidden bg-[#f5f5f5] flex items-center justify-center"
        style={{ width: imgSize, height: imgSize }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={imgSize}
            height={imgSize}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="material-icons-outlined text-[#ccc]" style={{ fontSize: imgSize * 0.45 }}>
            medication
          </span>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-[12px] text-[#888]">{brand}</p>
        <p className="text-[14px] text-black leading-snug line-clamp-2">{name}</p>
        {(optionSummary || quantity) && (
          <p className="text-[12px] text-[#aaa]">
            {optionSummary && <span>[옵션] {optionSummary}</span>}
            {optionSummary && quantity && <span className="mx-1.5">|</span>}
            {quantity && <span>{quantity}개</span>}
          </p>
        )}
        {(isCart || isOrder) && (
          <p className="text-[16px] font-bold text-black pt-1 tabular-nums">
            {formatPrice((isCart ? props.price : (props as ProductRowOrder).price))}원
          </p>
        )}
      </div>

      {/* 오른쪽 슬롯 — 삭제 버튼 (cart only) */}
      {isCart && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); props.onRemove(); }}
          className="shrink-0 text-[#cccccc] hover:text-black transition-colors mt-0.5"
          aria-label="삭제"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}
