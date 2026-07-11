import { useEffect, useRef, useState } from "react";

interface PointsDisplayProps {
  points: number;
}

// 點數變動時做簡單的數字滾動動畫（立即回饋原則）。
export function PointsDisplay({ points }: PointsDisplayProps) {
  const [displayValue, setDisplayValue] = useState(points);
  const prevRef = useRef(points);

  useEffect(() => {
    const from = prevRef.current;
    const to = points;
    if (from === to) return;
    const duration = 500;
    const start = performance.now();

    let raf = 0;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      setDisplayValue(Math.round(from + (to - from) * progress));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [points]);

  return (
    <div className="points-display">
      <span className="coin">🪙</span>
      <span className="value">{displayValue}</span>
    </div>
  );
}
