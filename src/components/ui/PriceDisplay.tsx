import { formatPrice } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({ price, size = "md", className = "" }: PriceDisplayProps) {
  const sizeStyles = {
    sm: "text-[13px]",
    md: "text-[15px]",
    lg: "text-[18px]",
  };

  return (
    <span className={`font-mono font-medium text-text-primary ${sizeStyles[size]} ${className}`}>
      {formatPrice(price)}
    </span>
  );
}
