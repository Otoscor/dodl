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
  primary: "bg-action-primary text-white hover:bg-action-primary-hover",
  secondary: "bg-surface-elevated text-text-primary border border-border-subtle hover:bg-surface-elevated/80",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-elevated",
  danger: "bg-accent-red/10 text-accent-red border border-accent-red/20 hover:bg-accent-red/20",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2.5 text-[14px]",
  lg: "px-6 py-3.5 text-[15px] font-medium",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className = "", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center rounded-xl transition-colors
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
