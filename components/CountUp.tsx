"use client";
import { useEffect, useRef, useState } from "react";

export default function CountUp({
  value,
  prefix = "",
  duration = 800,
}: {
  value: number;
  prefix?: string;
  duration?: number;
}) {
  const [n, setN] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    const b = value;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(a + (b - a) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = b;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{prefix}{n.toLocaleString("en-IN")}</>;
}