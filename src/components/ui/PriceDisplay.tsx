import { formatPrice } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({ price, size = "md", className = "" }: PriceDisplayProps) {
  const sizeStyles = {
    sm: "text-[14px]",
    md: "text-[17px]",
    lg: "text-[24px]",
  };

  return (
    <span className={`font-mono text-black ${sizeStyles[size]} ${className}`}>
      {formatPrice(price)}
    </span>
  );
}
