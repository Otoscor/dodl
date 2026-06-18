"use client";

import { useId } from "react";

const REQUIRED_COLOR = "#ff5b35";

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "tel" | "password" | "email" | "number";
  error?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "decimal" | "search";
  maxLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  name?: string;
}

// 라벨-인-컨테이너 단일행 입력 — 연한 회색 컨테이너 안에 작은 라벨 + 큰 굵은 값
export function Input({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
  error,
  inputMode,
  maxLength,
  autoComplete,
  autoFocus,
  disabled,
  name,
}: InputProps) {
  const id = useId();

  return (
    <div>
      <div
        className={`rounded-[14px] bg-[#f5f5f5] border px-4 py-3 transition-colors ${
          disabled ? "opacity-60" : ""
        } ${
          error
            ? "border-[#ff5b35]"
            : "border-[#e0e0e0] focus-within:border-black"
        }`}
      >
        <label htmlFor={id} className="block text-[13px] font-medium text-[#555]">
          {label}
          {required && <span style={{ color: REQUIRED_COLOR }}> *</span>}
        </label>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          className="w-full bg-transparent mt-1.5 text-[17px] font-semibold text-black placeholder:text-[#cccccc] placeholder:font-normal outline-none disabled:cursor-not-allowed"
        />
      </div>
      {error && <p className="mt-1.5 text-[12px] text-[#ff5b35]">⚠ {error}</p>}
    </div>
  );
}
