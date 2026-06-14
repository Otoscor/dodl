"use client";

interface QuantitySelectorProps {
  quantity: number;
  max: number;
  onChange: (qty: number) => void;
  size?: "sm" | "md";
}

export function QuantitySelector({ quantity, max, onChange, size = "md" }: QuantitySelectorProps) {
  const btnSize = size === "sm" ? "w-7 h-7 text-[13px]" : "w-8 h-8 text-[14px]";
  const numSize = size === "sm" ? "w-8 text-[13px]" : "w-10 text-[14px]";

  return (
    <div className="flex items-center border border-[#e0e0e0] rounded-[10px] overflow-hidden">
      <button
        onClick={() => onChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
        className={`${btnSize} flex items-center justify-center text-[#888] hover:bg-[#f5f5f5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer`}
      >
        −
      </button>
      <span className={`${numSize} text-center text-black font-mono tabular-nums`}>
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className={`${btnSize} flex items-center justify-center text-[#888] hover:bg-[#f5f5f5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer`}
      >
        +
      </button>
    </div>
  );
}
