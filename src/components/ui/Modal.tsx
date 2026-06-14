"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, actions }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-[360px] bg-white rounded-[10px] p-8 space-y-4">
        <h3 className="text-[16px] text-black tracking-[0.06em] uppercase">{title}</h3>
        <div className="text-[14px] text-[#888] leading-relaxed">{children}</div>
        <div className="flex gap-2 pt-2">
          {actions || (
            <Button variant="secondary" fullWidth onClick={onClose}>
              확인
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
