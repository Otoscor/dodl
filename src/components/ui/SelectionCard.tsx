"use client";

interface SelectionCardProps {
  icon: string;
  title: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function SelectionCard({
  icon,
  title,
  description,
  selected = false,
  disabled = false,
  onClick,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        text-left w-full p-4 rounded-[12px] border transition-all
        ${selected
          ? "border-black border-2 bg-white"
          : "border-[#e0e0e0] border bg-white hover:border-[#aaa]"
        }
        ${disabled ? "opacity-45 cursor-not-allowed bg-[#fafafa]" : "cursor-pointer"}
      `}
    >
      <span className="text-[22px] block mb-1.5">{icon}</span>
      <p className="text-[14px] font-bold text-black leading-snug mb-1">{title}</p>
      {description && (
        <p className="text-[12px] text-[#888] leading-relaxed whitespace-pre-line">
          {description}
        </p>
      )}
    </button>
  );
}
