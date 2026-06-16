"use client";

interface ListRowProps {
  label: string;
  value?: string;
  pressed?: boolean;
  onClick?: () => void;
}

export function ListRow({ label, value, pressed = false, onClick }: ListRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between py-4 px-5 text-left border-b border-[#e8e8e8] transition-colors ${
        pressed ? "bg-[#f5f5f5]" : "bg-white"
      }`}
    >
      <span className="text-[15px] text-black">{label}</span>
      <span className="flex items-center gap-2">
        {value && <span className="text-[14px] text-[#aaa]">{value}</span>}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-[#cccccc] shrink-0"
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
