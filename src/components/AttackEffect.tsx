import type { JSX } from "react";
import type { Skill } from "../types";

interface AttackEffectProps {
  particleShape: Skill["particleShape"];
  color: string;
}

// 每種招式的粒子形狀都用 CSS drawn SVG 畫（不用 emoji，才能套上每位英雄自己的特效色）。
// 6 顆粒子呈放射狀噴出，搭配 App.css 的 particleBurst 關鍵影格，讓每位英雄的攻擊特效看起來不一樣。
function ParticleShape({ shape, color }: { shape: Skill["particleShape"]; color: string }): JSX.Element {
  switch (shape) {
    case "star":
      return (
        <svg viewBox="0 0 24 24" width={18} height={18}>
          <path
            d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.9l-6.18 3.12L7 13.14 2 8.27l6.91-1.01z"
            fill={color}
          />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" width={18} height={18}>
          <path
            d="M12 21s-7.5-4.7-10-9.3C.4 8.4 2 4.5 5.6 4c2-.3 3.9.7 4.9 2.3.9-1.6 2.9-2.6 4.9-2.3 3.6.5 5.2 4.4 3.6 7.7C19.5 16.3 12 21 12 21z"
            fill={color}
          />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" width={18} height={18}>
          <path d="M13 2L4 14h6l-1 8 9-12h-6z" fill={color} />
        </svg>
      );
    case "flame":
      return (
        <svg viewBox="0 0 24 24" width={18} height={18}>
          <path
            d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c0-1-.5-2-.5-2 2 1 3.5 3.5 3.5 6a7 7 0 1 1-14 0c0-5 3-7 7-11z"
            fill={color}
          />
        </svg>
      );
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" width={18} height={18}>
          <path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z" fill={color} />
          <path d="M6 18C9 12 12 9 18 6" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" fill="none" />
        </svg>
      );
    case "note":
      return (
        <svg viewBox="0 0 24 24" width={18} height={18}>
          <circle cx="7" cy="18" r="3.2" fill={color} />
          <circle cx="17" cy="16" r="3.2" fill={color} />
          <path d="M10 18V5l10-2v11" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
        </svg>
      );
    case "boom":
      return (
        <svg viewBox="0 0 24 24" width={20} height={20}>
          <path
            d="M12 2l2 5 5-3-1 5 5 1-4 4 4 4-5 1 1 5-5-3-2 5-2-5-5 3 1-5-5-1 4-4-4-4 5-1-1-5 5 3z"
            fill={color}
          />
        </svg>
      );
    case "bubble":
    default:
      return (
        <svg viewBox="0 0 24 24" width={18} height={18}>
          <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2.5" />
          <circle cx="9" cy="9" r="2" fill={color} opacity="0.6" />
        </svg>
      );
  }
}

export function AttackEffect({ particleShape, color }: AttackEffectProps) {
  const particles = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div className="attack-effect" aria-hidden>
      {particles.map((i) => (
        <span
          key={i}
          className="attack-particle"
          style={{ ["--particle-angle" as string]: `${i * 60}deg`, animationDelay: `${i * 0.02}s` }}
        >
          <ParticleShape shape={particleShape} color={color} />
        </span>
      ))}
    </div>
  );
}
