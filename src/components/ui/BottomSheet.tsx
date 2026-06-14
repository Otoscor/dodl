"use client";

import { useEffect, useState } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      // 2-frame delay so transition fires after mount
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      document.body.style.overflow = "";
      const t = setTimeout(() => setRendered(false), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sheet — 430px에 맞춤 */}
      <div
        className={`
          relative w-full max-w-[430px] bg-surface-white rounded-t-2xl
          transition-transform duration-300 ease-out
          ${visible ? "translate-y-0" : "translate-y-full"}
        `}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-[3px] bg-border-subtle rounded-full" />
        </div>
        {children}
      </div>
    </div>
  );
}
