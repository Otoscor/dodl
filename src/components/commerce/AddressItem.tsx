"use client";

interface AddressItemProps {
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

export function AddressItem({
  name,
  phone,
  address,
  isDefault = false,
  selected,
  onSelect,
  onEdit,
}: AddressItemProps) {
  return (
    <div
      className="flex gap-3.5 items-start px-5 py-5 border-b border-[#e8e8e8] bg-white cursor-pointer"
      onClick={onSelect}
    >
      {/* 라디오 */}
      <div
        className={`w-[22px] h-[22px] rounded-full border-2 shrink-0 mt-0.5 transition-colors ${
          selected ? "border-black bg-black" : "border-[#cccccc] bg-white"
        }`}
      />

      {/* 콘텐츠 */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* 이름 + 기본배송지 + 변경 버튼 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[15px] font-bold text-black shrink-0">{name}</span>
            {isDefault && (
              <span className="text-[11px] text-[#888] bg-[#f0f0f0] rounded-[6px] px-2 py-0.5 shrink-0">
                기본 배송지
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="px-3.5 py-1 text-[13px] border border-[#cccccc] rounded-full text-black bg-white hover:border-black transition-colors shrink-0"
          >
            변경
          </button>
        </div>

        {/* 전화번호 */}
        <p className={`text-[13px] ${selected ? "text-black underline" : "text-[#888]"}`}>
          {phone}
        </p>

        {/* 주소 */}
        <p className="text-[13px] text-[#888] leading-relaxed">{address}</p>
      </div>
    </div>
  );
}
