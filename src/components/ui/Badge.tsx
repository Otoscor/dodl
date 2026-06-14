type BadgeVariant = "default" | "pink" | "amber" | "indigo" | "green" | "red" | "muted";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-elevated text-text-secondary",
  pink: "bg-label-pink/15 text-label-pink",
  amber: "bg-accent-amber/15 text-accent-amber",
  indigo: "bg-accent-indigo/15 text-accent-indigo",
  green: "bg-accent-green/15 text-accent-green",
  red: "bg-accent-red/15 text-accent-red",
  muted: "bg-surface-elevated text-text-quaternary",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-medium tracking-normal ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
