"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-black text-white hover:bg-[#333]",
  secondary: "bg-[#f5f5f5] text-black border border-[#e0e0e0] hover:bg-[#ebebeb]",
  ghost: "text-[#888] hover:text-black hover:bg-[#f5f5f5]",
  danger: "bg-[#f5f5f5] text-black border border-[#e0e0e0] hover:bg-[#ebebeb]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-[14px] tracking-[0.08em] uppercase",
  md: "px-5 py-3 text-[14px] tracking-[0.06em] uppercase",
  lg: "px-8 py-4 text-[14px] tracking-[0.06em] uppercase",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className = "", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center transition-colors rounded-[10px]
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
