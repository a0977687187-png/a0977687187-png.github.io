import { useState } from "react";
import type { CSSProperties, JSX } from "react";
import { playGiftOpenSound } from "../content/sound";

interface VictoryCelebrationProps {
  monsterName: string;
  reward: string;
  soundEnabled: boolean;
  onContinue: () => void; // 留在戰鬥頁（載入下一隻排隊怪獸）
  onHome: () => void;
}

// 打倒怪獸的慶祝畫面：夜空煙火 + 禮物盒開箱揭曉獎品。
// 禮物盒必須由孩子親手點開，強化「戰勝壞習慣 → 獲得獎勵」的成就感連結。
export function VictoryCelebration({ monsterName, reward, soundEnabled, onContinue, onHome }: VictoryCelebrationProps) {
  const [opened, setOpened] = useState(false);

  function openGift() {
    if (opened) return;
    if (soundEnabled) playGiftOpenSound();
    setOpened(true);
  }

  return (
    <div className="celebration-overlay victory-overlay">
      <Fireworks />
      <div className="celebration-title">🎆 恭喜擊倒【{monsterName}】！</div>

      {!opened ? (
        <>
          <button className="gift-box-btn" onClick={openGift} aria-label="打開禮物">
            <GiftBoxArt />
          </button>
          <div className="celebration-quote" style={{ color: "#ffe9b8" }}>
            點一下禮物盒，看看你的獎勵是什麼！
          </div>
        </>
      ) : (
        <>
          <div className="reward-reveal">
            <div className="reward-sparks" aria-hidden>
              ✨🎊✨
            </div>
            <div className="reward-card">🎁 {reward}</div>
          </div>
          <div className="celebration-quote" style={{ color: "#ffe9b8" }}>
            獎勵券已放進獎勵券匣，等家長兌現吧！
          </div>
          <div className="row" style={{ marginTop: 20, gap: 12 }}>
            <button className="secondary-btn" onClick={onContinue}>
              繼續冒險
            </button>
            <button className="primary-btn" onClick={onHome}>
              回首頁
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// CSS 煙火：4 束不同位置/顏色/延遲的爆發，每束 8 條放射線（--angle 控制方向）。
function Fireworks(): JSX.Element {
  const bursts = [
    { left: "16%", top: "16%", color: "#ffd166", delay: 0 },
    { left: "78%", top: "12%", color: "#ef476f", delay: 0.45 },
    { left: "60%", top: "30%", color: "#06d6a0", delay: 0.9 },
    { left: "32%", top: "26%", color: "#4ea8de", delay: 1.35 },
  ];
  return (
    <div className="fireworks" aria-hidden>
      {bursts.map((b, i) => (
        <div key={i} className="firework" style={{ left: b.left, top: b.top }}>
          {Array.from({ length: 8 }, (_, j) => (
            <span
              key={j}
              style={
                {
                  "--angle": `${j * 45}deg`,
                  background: b.color,
                  animationDelay: `${b.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function GiftBoxArt(): JSX.Element {
  return (
    <svg viewBox="0 0 120 120" width={150} height={150} style={{ display: "block" }}>
      {/* 盒身 */}
      <rect x="28" y="54" width="64" height="50" rx="7" fill="#f25c78" stroke="#3a2a1a" strokeWidth="3" />
      <rect x="53" y="54" width="14" height="50" fill="#ffd166" stroke="#3a2a1a" strokeWidth="2" />
      <rect x="34" y="60" width="10" height="6" rx="3" fill="#ffffff" opacity="0.4" />
      {/* 盒蓋 */}
      <rect x="22" y="36" width="76" height="20" rx="6" fill="#ef476f" stroke="#3a2a1a" strokeWidth="3" />
      <rect x="53" y="36" width="14" height="20" fill="#ffd166" stroke="#3a2a1a" strokeWidth="2" />
      {/* 蝴蝶結 */}
      <path d="M60 36q-16 -14 -8 -21q9 -5 8 11q-1 -16 8 -11q8 7 -8 21z" fill="#ffd166" stroke="#3a2a1a" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="60" cy="33" r="4.5" fill="#ffb703" stroke="#3a2a1a" strokeWidth="2" />
    </svg>
  );
}
