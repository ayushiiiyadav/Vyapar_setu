"use client";
import { useRef } from "react";

export default function Tilt({
  children,
  className = "",
  style,
  max = 6,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function move(e: React.MouseEvent) {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-4px)`;
  }
  function leave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={`tilt ${className}`} style={style}>
      {children}
    </div>
  );
}