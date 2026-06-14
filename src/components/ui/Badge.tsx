type BadgeVariant = "default" | "pink" | "amber" | "indigo" | "green" | "red" | "muted";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[#f5f5f5] text-[#888]",
  pink: "bg-black text-white",
  amber: "bg-[#e0e0e0] text-black",
  indigo: "bg-black text-white",
  green: "bg-[#e0e0e0] text-black",
  red: "bg-black text-white",
  muted: "bg-[#f5f5f5] text-[#aaa]",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[12px] tracking-[0.1em] uppercase rounded-[10px] ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
