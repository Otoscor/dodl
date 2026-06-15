"use client";

interface ToggleSwitchProps {
  on: boolean;
  onChange: (on: boolean) => void;
  "aria-label"?: string;
}

export function ToggleSwitch({ on, onChange, ...props }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-[44px] h-[26px] rounded-full transition-colors shrink-0 ${
        on ? "bg-black" : "bg-[#e0e0e0]"
      }`}
      {...props}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-[20px] h-[20px] rounded-full bg-white transition-transform ${
          on ? "translate-x-[18px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}
