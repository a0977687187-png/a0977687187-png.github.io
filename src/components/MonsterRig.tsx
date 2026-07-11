import type { JSX } from "react";

interface MonsterRigProps {
  monsterId: string;
  hurt?: boolean; // 0.55s 觸發的短暫受擊反應（震動）
  crying?: boolean; // HP <= 30% 的持續哭泣狀態
  size?: number;
}

// 每隻怪獸獨立繪製的精緻 Q 版插畫（viewBox 100x100、粗輪廓＋cel-shading）。
// 每隻都有 normal / crying 兩組表情圖層（實作指南 2.2）：HP<=30% 時眼睛閉起、
// 掉眼淚（.tear-stream 由 CSS 驅動）並整體縮小 0.85，讓孩子感受到壞習慣快被戰勝。
// 怪獸建模面朝右，站在畫面右側時由外層 scaleX(-1) 鏡像面向英雄。
const OUTLINE = "#3a2a1a";

function CryingEyes({ lx, ly, rx, ry }: { lx: number; ly: number; rx: number; ry: number }) {
  return (
    <g>
      <path d={`M${lx - 5} ${ly}q5 -5 10 0`} stroke={OUTLINE} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={`M${rx - 5} ${ry}q5 -5 10 0`} stroke={OUTLINE} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse className="tear-stream" cx={lx - 3} cy={ly + 8} rx={2.5} ry={4} fill="#00b0ff" />
      <ellipse className="tear-stream" cx={rx + 3} cy={ry + 8} rx={2.5} ry={4} fill="#00b0ff" style={{ animationDelay: "0.3s" }} />
    </g>
  );
}

function CryingMouth({ cx, cy }: { cx: number; cy: number }) {
  return <path d={`M${cx - 9} ${cy + 4}q9 -8 18 0`} stroke={OUTLINE} strokeWidth="3" fill="none" strokeLinecap="round" />;
}

// ---------- 1. 懶惰泥怪：攤在地上的黏土泥巴怪 ----------
function MudLazyArt({ crying }: { crying: boolean }): JSX.Element {
  return (
    <>
      <ellipse cx="50" cy="92" rx="36" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* 攤平的泥巴身體＋融化滴落 */}
      <path d="M14 82q-4 -34 36 -36q40 2 36 36q1 8 -10 6q-6 -1 -8 3q-3 4 -8 2q-4 -2 -8 0q-4 2 -8 0q-4 -2 -8 2q-5 4 -10 -1q-3 -3 -7 -2q-9 2 -5 -10z" fill="#8a674a" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 60q4 -12 28 -12q24 0 28 12q-10 -6 -28 -6q-18 0 -28 6z" fill="#a9835b" />
      {/* 滴落的泥 */}
      <path d="M24 86q-1 8 3 8q4 0 2 -8z" fill="#6F4E37" stroke={OUTLINE} strokeWidth="2" />
      <path d="M72 88q-1 7 3 7q4 0 2 -7z" fill="#6F4E37" stroke={OUTLINE} strokeWidth="2" />
      {/* 頭頂小泥球 */}
      <circle cx="38" cy="44" r="5" fill="#6F4E37" stroke={OUTLINE} strokeWidth="2" />
      {crying ? (
        <>
          <CryingEyes lx={38} ly={64} rx={62} ry={64} />
          <CryingMouth cx={50} cy={74} />
        </>
      ) : (
        <g>
          {/* 半睜的睏眼 */}
          <path d="M32 62h12" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M56 62h12" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="38" cy="65" r="3" fill={OUTLINE} />
          <circle cx="62" cy="65" r="3" fill={OUTLINE} />
          <ellipse cx="30" cy="71" rx="4" ry="2.5" fill="#967BB6" opacity="0.6" />
          <ellipse cx="70" cy="71" rx="4" ry="2.5" fill="#967BB6" opacity="0.6" />
          <ellipse cx="50" cy="76" rx="5" ry="3.5" fill={OUTLINE} />
          {/* 打呵欠的泡泡 */}
          <circle cx="76" cy="50" r="5" fill="#cdeafc" stroke={OUTLINE} strokeWidth="1.5" opacity="0.85" />
        </g>
      )}
    </>
  );
}

// ---------- 2. 搗蛋菌菌怪：紫色病菌 ----------
function GermTroubleArt({ crying }: { crying: boolean }): JSX.Element {
  const spikes = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 + 0.3;
    const x1 = 50 + Math.cos(angle) * 28;
    const y1 = 52 + Math.sin(angle) * 28;
    const x2 = 50 + Math.cos(angle) * (crying ? 34 : 40);
    const y2 = 52 + Math.sin(angle) * (crying ? 34 : 40) + (crying ? 4 : 0);
    return { x1, y1, x2, y2, key: i };
  });
  return (
    <>
      <ellipse cx="50" cy="92" rx="30" ry="5" fill="rgba(0,0,0,0.15)" />
      {/* 尖刺（瀕死時軟化下垂） */}
      {spikes.map((s) => (
        <line key={s.key} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#F72585" strokeWidth="6" strokeLinecap="round" />
      ))}
      {/* 菌體 */}
      <circle cx="50" cy="52" r="30" fill="#7209B7" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="42" cy="42" r="10" fill="#9d4edd" opacity="0.8" />
      <circle cx="62" cy="64" r="6" fill="#560a86" opacity="0.8" />
      <circle cx="38" cy="66" r="4" fill="#560a86" opacity="0.8" />
      {crying ? (
        <>
          <CryingEyes lx={40} ly={48} rx={60} ry={48} />
          <CryingMouth cx={50} cy={62} />
        </>
      ) : (
        <g>
          {/* 壞笑瞇瞇眼 */}
          <path d="M34 44l12 4M66 44l-12 4" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />
          {/* 咧嘴壞笑＋小尖牙 */}
          <path d="M38 60q12 12 24 0q-6 4 -12 4q-6 0 -12 -4z" fill="#111111" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
          <path d="M42 61l3 4l3 -4z" fill="#ffffff" />
        </g>
      )}
    </>
  );
}

// ---------- 3. 大吼霸王龍：暴躁大恐龍 ----------
function RoarRexArt({ crying }: { crying: boolean }): JSX.Element {
  return (
    <>
      <ellipse cx="50" cy="94" rx="34" ry="5" fill="rgba(0,0,0,0.15)" />
      {/* 尾巴 */}
      <path d="M18 70q-14 -2 -14 -14q10 0 20 6z" fill="#900C3F" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 身體 */}
      <ellipse cx="48" cy="66" rx="30" ry="26" fill="#900C3F" stroke={OUTLINE} strokeWidth="3" />
      <ellipse cx="52" cy="72" rx="18" ry="15" fill="#FF5733" />
      <path d="M42 62h20M44 70h18M46 78h14" stroke="#d64425" strokeWidth="2" strokeLinecap="round" />
      {/* 小短手 */}
      <path d="M70 62q10 2 8 10" stroke={OUTLINE} strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* 腳 */}
      <ellipse cx="34" cy="90" rx="10" ry="6" fill="#6e0a30" stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="60" cy="90" rx="10" ry="6" fill="#6e0a30" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 頭 */}
      <path d="M40 14q26 -6 34 10q6 12 -2 20l-30 2q-12 -4 -12 -16q0 -12 10 -16z" fill="#900C3F" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      {/* 背刺 */}
      <path d="M38 16l-6 -8l10 2zM52 10l-2 -9l9 5zM66 12l4 -8l5 9z" fill="#FFC300" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
      {crying ? (
        <>
          <CryingEyes lx={46} ly={26} rx={64} ry={26} />
          <path d="M46 40q10 -6 20 0" stroke={OUTLINE} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <g>
          {/* 怒火眼＋怒眉 */}
          <path d="M40 20l12 5M70 20l-10 5" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="48" cy="29" r="4.5" fill="#FFC300" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="64" cy="29" r="4.5" fill="#FFC300" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="48" cy="29" r="1.8" fill={OUTLINE} />
          <circle cx="64" cy="29" r="1.8" fill={OUTLINE} />
          {/* 咆哮大嘴＋利齒 */}
          <path d="M42 38q14 14 30 2q-2 10 -16 10q-12 0 -14 -12z" fill="#5c0724" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M46 41l3 5l3 -5zM58 44l3 5l3 -6z" fill="#ffffff" />
          {/* 怒氣符號 */}
          <path d="M80 12q4 0 4 4M84 8q5 0 5 5" stroke="#FF5733" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
    </>
  );
}

// ---------- 4. 挑食妖精：捏鼻子的綠色小妖精 ----------
function PickyFairyArt({ crying }: { crying: boolean }): JSX.Element {
  return (
    <>
      <ellipse cx="50" cy="92" rx="26" ry="5" fill="rgba(0,0,0,0.15)" />
      {/* 翅膀 */}
      <ellipse cx="24" cy="52" rx="12" ry="18" fill="#e3fce9" stroke={OUTLINE} strokeWidth="2.5" opacity="0.9" transform="rotate(-15 24 52)" />
      <ellipse cx="76" cy="52" rx="12" ry="18" fill="#e3fce9" stroke={OUTLINE} strokeWidth="2.5" opacity="0.9" transform="rotate(15 76 52)" />
      {/* 身體 */}
      <path d="M38 60h24l6 28h-36z" fill="#A8E6CF" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M40 74h20" stroke="#7bc9a8" strokeWidth="2.5" strokeLinecap="round" />
      {/* 頭 */}
      <circle cx="50" cy="38" r="22" fill="#FFD3B6" stroke={OUTLINE} strokeWidth="3" />
      {/* 妖精尖耳 */}
      <path d="M28 36l-10 -4l10 -6z" fill="#FFD3B6" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M72 36l10 -4l-10 -6z" fill="#FFD3B6" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 綠色小捲髮 */}
      <path d="M32 26q4 -12 18 -12q14 0 18 12q-8 -5 -18 -5q-10 0 -18 5z" fill="#A8E6CF" stroke={OUTLINE} strokeWidth="2.5" />
      <circle cx="50" cy="12" r="5" fill="#A8E6CF" stroke={OUTLINE} strokeWidth="2.5" />
      {crying ? (
        <>
          {/* 雙手摀臉大哭 */}
          <CryingEyes lx={42} ly={36} rx={58} ry={36} />
          <CryingMouth cx={50} cy={48} />
          <circle cx="36" cy="48" r="7" fill="#FFD3B6" stroke={OUTLINE} strokeWidth="2.5" />
          <circle cx="64" cy="48" r="7" fill="#FFD3B6" stroke={OUTLINE} strokeWidth="2.5" />
        </>
      ) : (
        <g>
          {/* 嫌棄瞇眼＋紅暈＋捏鼻子的手 */}
          <path d="M38 34l8 2M62 34l-8 2" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="36" cy="42" rx="4.5" ry="3" fill="#FFAAA6" opacity="0.9" />
          <ellipse cx="64" cy="42" rx="4.5" ry="3" fill="#FFAAA6" opacity="0.9" />
          {/* 捏住的鼻子 */}
          <path d="M46 42q4 3 8 0l-2 5q-2 1 -4 0z" fill="#f5b895" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="45" cy="45" r="4" fill="#FFD3B6" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="55" cy="45" r="4" fill="#FFD3B6" stroke={OUTLINE} strokeWidth="2" />
          {/* 嘟嘴 */}
          <path d="M46 54q4 -3 8 0" stroke={OUTLINE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )}
    </>
  );
}

// ---------- 5. 3C 章魚：八腳拿手機 ----------
function OctopusArt({ crying }: { crying: boolean }): JSX.Element {
  const tentacles = Array.from({ length: 8 }, (_, i) => ({ x: 8 + i * 12, key: i }));
  return (
    <>
      <ellipse cx="50" cy="94" rx="38" ry="5" fill="rgba(0,0,0,0.15)" />
      {/* 八隻觸手＋手機 */}
      {tentacles.map((t, i) => (
        <g key={t.key}>
          <path
            d={`M${34 + i * 4.5} 62q${t.x - 40} 14 ${t.x - 34 - i * 4.5} 24`}
            stroke="#FF70A6"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <rect x={t.x - 5} y={84} width={10} height={14} rx={2.5} fill="#333333" stroke={OUTLINE} strokeWidth="1.8" />
          {crying ? (
            <g stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round">
              <line x1={t.x - 2.5} y1={87.5} x2={t.x + 2.5} y2={94.5} />
              <line x1={t.x + 2.5} y1={87.5} x2={t.x - 2.5} y2={94.5} />
            </g>
          ) : (
            <rect x={t.x - 3} y={86.5} width={6} height={9} rx={1} fill="#70D6FF" />
          )}
        </g>
      ))}
      {/* 頭身 */}
      <path d="M22 60q-4 -38 28 -38q32 0 28 38q0 8 -8 8l-40 0q-8 0 -8 -8z" fill="#FF70A6" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M30 34q6 -8 20 -8q14 0 20 8q-10 -4 -20 -4q-10 0 -20 4z" fill="#ff9dc2" />
      {/* 頭上戴著 VR 感的螢幕光 */}
      <rect x="36" y="18" width="28" height="8" rx="4" fill="#70D6FF" stroke={OUTLINE} strokeWidth="2" opacity="0.9" />
      {crying ? (
        <>
          <CryingEyes lx={40} ly={44} rx={60} ry={44} />
          <CryingMouth cx={50} cy={58} />
        </>
      ) : (
        <g>
          {/* 盯螢幕的入迷眼（螢幕反光） */}
          <circle cx="40" cy="44" r="6.5" fill="#ffffff" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="60" cy="44" r="6.5" fill="#ffffff" stroke={OUTLINE} strokeWidth="2" />
          <rect x="37" y="41" width="6" height="6" rx="1" fill="#70D6FF" />
          <rect x="57" y="41" width="6" height="6" rx="1" fill="#70D6FF" />
          <ellipse cx="50" cy="58" rx="4" ry="3" fill={OUTLINE} />
        </g>
      )}
    </>
  );
}

// ---------- 6. 亂丟大王：掛滿雜物的邋遢怪 ----------
function MessyKingArt({ crying }: { crying: boolean }): JSX.Element {
  return (
    <>
      <ellipse cx="50" cy="94" rx="34" ry="5" fill="rgba(0,0,0,0.15)" />
      {/* 本體 */}
      <path d="M20 84q-6 -44 30 -44q36 0 30 44q0 6 -8 6h-44q-8 0 -8 -6z" fill="#8D99AE" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 52q8 -8 22 -8q14 0 22 8q-11 -4 -22 -4q-11 0 -22 4z" fill="#aab4c5" />
      {crying ? (
        <>
          {/* 雜物散落一地，本體露出尷尬臉 */}
          <rect x="6" y="88" width="10" height="8" rx="2" fill="#EF233C" stroke={OUTLINE} strokeWidth="2" transform="rotate(-15 11 92)" />
          <rect x="80" y="90" width="11" height="7" rx="2" fill="#48CAE4" stroke={OUTLINE} strokeWidth="2" transform="rotate(12 85 93)" />
          <circle cx="26" cy="93" r="4" fill="#FFB703" stroke={OUTLINE} strokeWidth="2" />
          <CryingEyes lx={40} ly={60} rx={60} ry={60} />
          <CryingMouth cx={50} cy={74} />
          {/* 尷尬汗滴 */}
          <path d="M74 50q4 5 0 8q-4 -3 0 -8z" fill="#70D6FF" stroke={OUTLINE} strokeWidth="1.5" />
        </>
      ) : (
        <g>
          {/* 全身掛滿雜物 */}
          <rect x="20" y="46" width="12" height="9" rx="2" fill="#EF233C" stroke={OUTLINE} strokeWidth="2" transform="rotate(-12 26 50)" />
          <rect x="66" y="48" width="12" height="9" rx="2" fill="#48CAE4" stroke={OUTLINE} strokeWidth="2" transform="rotate(15 72 52)" />
          <circle cx="30" cy="76" r="5" fill="#FFB703" stroke={OUTLINE} strokeWidth="2" />
          <rect x="62" y="72" width="10" height="10" rx="2" fill="#EF233C" stroke={OUTLINE} strokeWidth="2" transform="rotate(20 67 77)" />
          <path d="M44 84l5 -7l5 7z" fill="#48CAE4" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
          {/* 得意的臉 */}
          <circle cx="42" cy="60" r="4" fill={OUTLINE} />
          <circle cx="60" cy="60" r="4" fill={OUTLINE} />
          <circle cx="43" cy="59" r="1.3" fill="#ffffff" />
          <circle cx="61" cy="59" r="1.3" fill="#ffffff" />
          <path d="M42 70q9 7 18 0" stroke={OUTLINE} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
    </>
  );
}

// ---------- 7. 頂嘴鸚鵡王：戴皇冠的大嘴鸚鵡 ----------
function TalkbackParrotArt({ crying }: { crying: boolean }): JSX.Element {
  return (
    <>
      <ellipse cx="50" cy="94" rx="28" ry="5" fill="rgba(0,0,0,0.15)" />
      {/* 尾羽 */}
      <path d="M28 78q-16 6 -22 18q12 2 26 -8z" fill="#06D6A0" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M30 82q-10 4 -14 12" stroke="#04a67c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* 身體 */}
      <ellipse cx="50" cy="64" rx="26" ry="28" fill="#06D6A0" stroke={OUTLINE} strokeWidth="3" />
      <ellipse cx="52" cy="72" rx="14" ry="16" fill="#7ceccb" />
      {/* 翅膀 */}
      <path d="M26 58q-8 12 -2 24q8 -2 10 -14z" fill="#04a67c" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 腳 */}
      <path d="M42 90l-2 6M58 90l2 6" stroke="#c98a00" strokeWidth="4" strokeLinecap="round" />
      {/* 頭 */}
      <circle cx="52" cy="32" r="20" fill="#06D6A0" stroke={OUTLINE} strokeWidth="3" />
      {/* 皇冠（瀕死時歪斜） */}
      <g transform={crying ? "rotate(-18 52 12)" : undefined}>
        <path d="M38 16l4 -10l6 6l4 -9l4 9l6 -6l4 10z" fill="#FFD166" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="46" cy="7" r="2" fill="#EF476F" />
        <circle cx="66" cy="7" r="2" fill="#EF476F" />
      </g>
      {crying ? (
        <>
          {/* 豆豆眼流淚、嘴閉上 */}
          <circle cx="44" cy="30" r="2.5" fill={OUTLINE} />
          <circle cx="62" cy="30" r="2.5" fill={OUTLINE} />
          <ellipse className="tear-stream" cx="42" cy="38" rx="2.5" ry="4" fill="#00b0ff" />
          <ellipse className="tear-stream" cx="64" cy="38" rx="2.5" ry="4" fill="#00b0ff" style={{ animationDelay: "0.3s" }} />
          <path d="M60 44q6 1 10 -1" stroke="#c98a00" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <g>
          {/* 神氣挑眉眼 */}
          <path d="M38 22l10 3M68 22l-10 3" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
          <circle cx="44" cy="29" r="3.5" fill={OUTLINE} />
          <circle cx="62" cy="29" r="3.5" fill={OUTLINE} />
          <circle cx="45" cy="28" r="1.2" fill="#ffffff" />
          <circle cx="63" cy="28" r="1.2" fill="#ffffff" />
          {/* 大張的嘴（頂嘴中） */}
          <path d="M58 38q18 -4 20 4q2 8 -12 10q-10 1 -12 -6q-1 -6 4 -8z" fill="#EF476F" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M62 44q8 -2 12 0" stroke="#b83252" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* 頂嘴的氣泡 */}
          <circle cx="86" cy="24" r="6" fill="#ffffff" stroke={OUTLINE} strokeWidth="2" />
          <path d="M82 30l-3 4" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
          <path d="M83 22l6 0M84 26l4 0" stroke="#EF476F" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}
    </>
  );
}

// ---------- 8. 夜貓蝙蝠：不睡覺的大眼蝙蝠 ----------
function NightBatArt({ crying }: { crying: boolean }): JSX.Element {
  return (
    <>
      <ellipse cx="50" cy="92" rx="26" ry="5" fill="rgba(0,0,0,0.15)" />
      {crying ? (
        <>
          {/* 蝠翼收攏包裹全身 */}
          <path d="M28 40q-6 30 8 44q6 4 14 4q8 0 14 -4q14 -14 8 -44z" fill="#8D99AE" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M36 50q-2 20 6 32M64 50q2 20 -6 32" stroke="#6b7688" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* 展開的蝠翼 */}
          <path d="M30 46q-24 -8 -28 -28q12 2 18 10q0 -10 8 -16q4 8 4 18z" fill="#8D99AE" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M70 46q24 -8 28 -28q-12 2 -18 10q0 -10 -8 -16q-4 8 -4 18z" fill="#8D99AE" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
        </>
      )}
      {/* 身體 */}
      <ellipse cx="50" cy="56" rx="26" ry="30" fill="#2B2D42" stroke={OUTLINE} strokeWidth="3" />
      <ellipse cx="50" cy="66" rx="14" ry="16" fill="#40435e" />
      {/* 尖耳 */}
      <path d="M34 32l-4 -14l12 8z" fill="#2B2D42" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M66 32l4 -14l-12 8z" fill="#2B2D42" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 小尖牙 */}
      <path d="M44 64l3 5l3 -5zM56 64l3 5l3 -5z" fill="#EDF2F4" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
      {crying ? (
        <>
          {/* 打叉死魚眼 */}
          <g stroke="#EDF2F4" strokeWidth="3" strokeLinecap="round">
            <line x1="37" y1="42" x2="45" y2="50" />
            <line x1="45" y1="42" x2="37" y2="50" />
            <line x1="55" y1="42" x2="63" y2="50" />
            <line x1="63" y1="42" x2="55" y2="50" />
          </g>
          <ellipse className="tear-stream" cx="38" cy="56" rx="2.5" ry="4" fill="#00b0ff" />
          <ellipse className="tear-stream" cx="62" cy="56" rx="2.5" ry="4" fill="#00b0ff" style={{ animationDelay: "0.3s" }} />
        </>
      ) : (
        <g>
          {/* 睜大的失眠眼＋黑眼圈 */}
          <circle cx="41" cy="46" r="8" fill="#EDF2F4" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="59" cy="46" r="8" fill="#EDF2F4" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="41" cy="46" r="3.5" fill="#e63946" />
          <circle cx="59" cy="46" r="3.5" fill="#e63946" />
          <circle cx="41" cy="46" r="1.5" fill={OUTLINE} />
          <circle cx="59" cy="46" r="1.5" fill={OUTLINE} />
          <path d="M33 55q8 4 16 0M51 55q8 4 16 0" stroke="#8D99AE" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* 月亮 */}
          <path d="M84 14q-8 2 -8 10q0 8 8 10q-12 2 -14 -10q2 -12 14 -10z" fill="#FFD166" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
        </g>
      )}
    </>
  );
}

// ---------- 後備造型（自訂/內容包怪獸尚未提供插畫時） ----------
function FallbackMonsterArt({ crying }: { crying: boolean }): JSX.Element {
  return (
    <>
      <ellipse cx="50" cy="92" rx="28" ry="5" fill="rgba(0,0,0,0.15)" />
      <circle cx="50" cy="54" r="32" fill="#b98cd8" stroke={OUTLINE} strokeWidth="3" />
      {crying ? (
        <>
          <CryingEyes lx={40} ly={48} rx={60} ry={48} />
          <CryingMouth cx={50} cy={62} />
        </>
      ) : (
        <g>
          <circle cx="40" cy="48" r="4.5" fill={OUTLINE} />
          <circle cx="60" cy="48" r="4.5" fill={OUTLINE} />
          <path d="M40 62q10 8 20 0" stroke={OUTLINE} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
    </>
  );
}

const MONSTER_ART: Record<string, (props: { crying: boolean }) => JSX.Element> = {
  "monster-mud-lazy": MudLazyArt,
  "monster-germ-trouble": GermTroubleArt,
  "monster-roar-rex": RoarRexArt,
  "monster-picky-fairy": PickyFairyArt,
  "monster-3c-octopus": OctopusArt,
  "monster-messy-king": MessyKingArt,
  "monster-talkback-parrot": TalkbackParrotArt,
  "monster-night-bat": NightBatArt,
};

export function MonsterRig({ monsterId, hurt = false, crying = false, size = 100 }: MonsterRigProps) {
  const Art = MONSTER_ART[monsterId] ?? FallbackMonsterArt;
  // 震動動畫掛在外層 div，鏡像翻面與瀕死縮小放在內層 svg——兩層變形分開，
  // 避免 CSS animation 蓋掉 inline transform 造成怪獸瞬間翻回正面的破圖。
  return (
    <div className={`monster-rig ${hurt ? "monster-hurt" : ""}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{
          display: "block",
          transform: crying ? "scaleX(-1) scale(0.85)" : "scaleX(-1)",
          transformOrigin: "50% 100%",
          transition: "transform 0.3s ease",
        }}
      >
        <Art crying={crying} />
      </svg>
    </div>
  );
}
