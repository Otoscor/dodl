"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (text: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((text: string, type: "success" | "error" | "info" = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-[calc(100%-32px)] max-w-[400px] pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// DESIGN.md: white-surface(#ffffff)가 토스트 기본 배경.
// Light 모드: surface-white 배경 + border-subtle + 타입별 좌측 액센트 바
function ToastItem({ toast }: { toast: ToastMessage }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const accentColor =
    toast.type === "error"   ? "border-l-accent-red"
    : toast.type === "info"  ? "border-l-text-tertiary"
    :                          "border-l-accent-green";

  return (
    <div
      className={`
        bg-surface-white border border-border-subtle border-l-4 ${accentColor}
        text-text-primary text-[13px] px-4 py-3 rounded-lg
        shadow-none transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
    >
      {toast.text}
    </div>
  );
}
