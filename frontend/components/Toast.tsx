"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Info } from "lucide-react";

type ShowToast = (message: string) => void;
const ToastContext = createContext<ShowToast>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

/** Coy-style dark toast, announced politely to screen readers. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<ShowToast>((msg) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(msg);
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), 2200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div id="toast" className={visible ? "show" : ""} role="status" aria-live="polite">
        {message && <Info size={16} aria-hidden />}
        {message}
      </div>
    </ToastContext.Provider>
  );
}
