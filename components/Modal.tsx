"use client";
import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="backdrop absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="sheet relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300 sm:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-leaf-dark">{title}</h2>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-gray-100 text-xl text-gray-600">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}