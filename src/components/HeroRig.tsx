import type { JSX } from "react";

export type HeroPhase = "idle" | "prep" | "slash";

interface HeroRigProps {
  heroId: string;
  phase?: HeroPhase;
  size?: number;
}

// 每位英雄獨立繪製的精緻 Q 版插畫（viewBox 120x120、面朝右、粗輪廓＋腮紅＋高光的
// 楓之谷風格 cel-shading）。動畫仍由外層 g 的 class 統一驅動（見 App.css characterIdle 等），
// 新增英雄 = 新增一個繪圖函式並註冊 id，不動任何動畫與戰鬥邏輯。
const OUTLINE = "#3a2a1a";

function Blush({ cx, cy }: { cx: number; cy: number }) {
  return <ellipse cx={cx} cy={cy} rx={5} ry={3} fill="#ff8a80" opacity={0.7} />;
}

function Eye({ cx, cy, r = 3.6 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#2c3e50" />
      <circle cx={cx + r * 0.35} cy={cy - r * 0.4} r={r * 0.35} fill="#ffffff" />
    </g>
  );
}

// ---------- 小勇者阿光：平底鍋頭盔＋木劍 ----------
function AguangArt(): JSX.Element {
  return (
    <>
      <ellipse cx="58" cy="108" rx="26" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* 身體：草綠短袍＋腰帶 */}
      <rect x="40" y="62" width="38" height="38" rx="14" fill="#63B02B" stroke={OUTLINE} strokeWidth="3" />
      <rect x="40" y="78" width="38" height="6" fill="#4a8a1f" />
      <rect x="53" y="76" width="10" height="10" rx="2" fill="#F1C40F" stroke={OUTLINE} strokeWidth="2" />
      {/* 手臂 */}
      <circle cx="42" cy="74" r="7" fill="#D4A373" stroke={OUTLINE} strokeWidth="2.5" />
      <circle cx="80" cy="72" r="7" fill="#D4A373" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 腳 */}
      <ellipse cx="50" cy="102" rx="8" ry="5" fill="#8a5a2a" stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="68" cy="102" rx="8" ry="5" fill="#8a5a2a" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 頭 */}
      <circle cx="58" cy="42" r="26" fill="#D4A373" stroke={OUTLINE} strokeWidth="3" />
      {/* 瀏海 */}
      <path d="M34 38q4 -14 24 -14q20 0 24 14l-6 4q-8 -8 -18 -8q-10 0 -18 8z" fill="#3A2512" />
      {/* 平底鍋頭盔 */}
      <ellipse cx="58" cy="24" rx="24" ry="10" fill="#9aa5ad" stroke={OUTLINE} strokeWidth="3" />
      <ellipse cx="58" cy="21" rx="24" ry="9" fill="#b8c2c9" stroke={OUTLINE} strokeWidth="2.5" />
      <rect x="80" y="17" width="16" height="6" rx="3" fill="#7F8C8D" stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="50" cy="19" rx="7" ry="2.5" fill="#ffffff" opacity="0.6" />
      {/* 臉 */}
      <Eye cx={48} cy={44} r={4} />
      <Eye cx={68} cy={44} r={4} />
      <Blush cx={42} cy={52} />
      <Blush cx={74} cy={52} />
      <path d="M52 56q6 5 12 0" stroke={OUTLINE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* 木劍 */}
      <g>
        <rect x="86" y="46" width="7" height="34" rx="3" fill="#c8913f" stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="81" y="74" width="17" height="6" rx="3" fill="#8a5a2a" stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="88" y="48" width="2" height="24" fill="#e0b46a" />
      </g>
    </>
  );
}

// ---------- 布丁忍者：布丁頭巾忍者貓 ----------
function PuddingNinjaArt(): JSX.Element {
  return (
    <>
      <ellipse cx="58" cy="108" rx="26" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* 身體：忍者服 */}
      <rect x="41" y="64" width="36" height="36" rx="14" fill="#2A9D8F" stroke={OUTLINE} strokeWidth="3" />
      <path d="M45 68l28 26M73 68l-28 26" stroke="#1d7a6e" strokeWidth="3" strokeLinecap="round" />
      {/* 紅圍巾＋飄尾 */}
      <rect x="42" y="60" width="34" height="10" rx="5" fill="#E63946" stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M44 66q-14 4 -18 14l6 4q6 -10 14 -12z" fill="#E63946" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 腳 */}
      <ellipse cx="50" cy="102" rx="8" ry="5" fill="#1d7a6e" stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="68" cy="102" rx="8" ry="5" fill="#1d7a6e" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 頭：布丁 */}
      <circle cx="58" cy="42" r="25" fill="#FFF3B0" stroke={OUTLINE} strokeWidth="3" />
      {/* 貓耳（藏在布丁頭巾裡） */}
      <path d="M38 26l-4 -12l12 6z" fill="#543810" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M78 26l4 -12l-12 6z" fill="#543810" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 焦糖頂 */}
      <path d="M34 34q0 -18 24 -18q24 0 24 18q0 4 -5 3q-4 -1 -5 2q-2 4 -6 2q-3 -2 -6 0q-3 2 -6 0q-3 -2 -6 0q-4 2 -6 -2q-1 -3 -5 -2q-5 1 -3 -3z" fill="#543810" stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="48" cy="22" rx="6" ry="2.5" fill="#7a5230" />
      {/* 貓眼＋鬍鬚 */}
      <Eye cx={48} cy={44} r={4} />
      <Eye cx={68} cy={44} r={4} />
      <path d="M55 51l3 2l3 -2" stroke={OUTLINE} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 46h8M30 52h8M78 46h8M78 52h8" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
      <Blush cx={41} cy={52} />
      <Blush cx={75} cy={52} />
      {/* 手裡劍 */}
      <g>
        <path d="M90 58l6 10l-10 -2l10 -2l-6 10l-2 -10l8 6l-8 -6z" fill="#543810" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="90" cy="66" r="3" fill="#FFF3B0" stroke={OUTLINE} strokeWidth="2" />
      </g>
    </>
  );
}

// ---------- 星星魔法師：星杖小女孩 ----------
function StarWizardArt(): JSX.Element {
  return (
    <>
      <ellipse cx="58" cy="108" rx="26" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* 長裙 */}
      <path d="M44 64l28 0l8 36l-44 0z" fill="#9B5DE5" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M40 92h44" stroke="#7a3fc4" strokeWidth="3" />
      <circle cx="52" cy="80" r="2.5" fill="#FEE440" />
      <circle cx="64" cy="86" r="2.5" fill="#FEE440" />
      {/* 長髮 */}
      <path d="M36 40q-6 26 -2 34q6 4 10 -2l0 -28z" fill="#F15BB5" stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M80 40q6 26 2 34q-6 4 -10 -2l0 -28z" fill="#F15BB5" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 頭 */}
      <circle cx="58" cy="42" r="24" fill="#FCD5CE" stroke={OUTLINE} strokeWidth="3" />
      <path d="M36 38q2 -14 22 -14q20 0 22 14l-6 3q-6 -7 -16 -7q-10 0 -16 7z" fill="#F15BB5" />
      {/* 魔女帽 */}
      <path d="M32 26q26 -10 52 0q-6 6 -26 6q-20 0 -26 -6z" fill="#9B5DE5" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M46 24q6 -22 22 -20q-4 6 -2 18z" fill="#9B5DE5" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="68" cy="6" r="4" fill="#FEE440" stroke={OUTLINE} strokeWidth="2" />
      {/* 臉 */}
      <Eye cx={49} cy={44} r={4} />
      <Eye cx={67} cy={44} r={4} />
      <Blush cx={43} cy={52} />
      <Blush cx={73} cy={52} />
      <path d="M53 55q5 4 10 0" stroke={OUTLINE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* 星星法杖 */}
      <g>
        <rect x="88" y="34" width="5" height="46" rx="2.5" fill="#00F5D4" stroke={OUTLINE} strokeWidth="2.5" />
        <path d="M90 12l4 9l10 1l-7 7l2 10l-9 -5l-9 5l2 -10l-7 -7l10 -1z" fill="#FEE440" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="87" cy="20" r="1.5" fill="#ffffff" />
      </g>
    </>
  );
}

// ---------- 機器狗汪答：科技藍機器狗 ----------
function RoboDogArt(): JSX.Element {
  return (
    <>
      <ellipse cx="58" cy="108" rx="28" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* 身體 */}
      <rect x="36" y="58" width="44" height="40" rx="16" fill="#4EA8DE" stroke={OUTLINE} strokeWidth="3" />
      {/* 螢幕肚子 */}
      <rect x="46" y="68" width="24" height="18" rx="5" fill="#ADE8F4" stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M50 78l4 -5l4 5l4 -5l4 5" stroke="#0077b6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* 四肢關節 */}
      <ellipse cx="44" cy="100" rx="8" ry="6" fill="#48CAE4" stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="72" cy="100" rx="8" ry="6" fill="#48CAE4" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 尾巴天線 */}
      <path d="M36 62q-10 -4 -8 -14" stroke={OUTLINE} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="28" cy="46" r="4" fill="#FF6B6B" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 頭 */}
      <rect x="34" y="14" width="48" height="38" rx="17" fill="#4EA8DE" stroke={OUTLINE} strokeWidth="3" />
      <rect x="38" y="18" width="40" height="14" rx="7" fill="#8bd0f0" opacity="0.55" />
      {/* 垂耳 */}
      <path d="M34 22q-10 2 -10 16q6 4 12 -2z" fill="#2b7cb8" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M82 22q10 2 10 16q-6 4 -12 -2z" fill="#2b7cb8" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 天線 */}
      <line x1="58" y1="14" x2="58" y2="5" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
      <circle cx="58" cy="4" r="3.5" fill="#FF6B6B" stroke={OUTLINE} strokeWidth="2" />
      {/* 電子眼 */}
      <circle cx="48" cy="34" r="6" fill="#003049" stroke={OUTLINE} strokeWidth="2" />
      <circle cx="70" cy="34" r="6" fill="#003049" stroke={OUTLINE} strokeWidth="2" />
      <circle cx="50" cy="32" r="2" fill="#70e0ff" />
      <circle cx="72" cy="32" r="2" fill="#70e0ff" />
      {/* 鼻子＋嘴 */}
      <ellipse cx="59" cy="43" rx="4" ry="3" fill="#003049" />
      <path d="M53 48q6 4 12 0" stroke={OUTLINE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* 火箭飛拳（右前肢） */}
      <g>
        <rect x="80" y="66" width="16" height="12" rx="6" fill="#48CAE4" stroke={OUTLINE} strokeWidth="2.5" />
        <path d="M80 72h-5l3 -4M80 72h-5l3 4" stroke="#FF6B6B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </>
  );
}

// ---------- 恐龍寶貝噴噴：背書包的小暴龍 ----------
function BabyDinoArt(): JSX.Element {
  return (
    <>
      <ellipse cx="58" cy="108" rx="28" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* 尾巴 */}
      <path d="M40 84q-18 2 -22 -8q10 -4 24 0z" fill="#52B788" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 身體 */}
      <ellipse cx="58" cy="80" rx="24" ry="22" fill="#52B788" stroke={OUTLINE} strokeWidth="3" />
      <ellipse cx="60" cy="86" rx="14" ry="12" fill="#b7e4c7" />
      {/* 書包背帶＋書包 */}
      <path d="M46 64l8 18M70 64l-6 18" stroke="#c98a00" strokeWidth="4" strokeLinecap="round" />
      <rect x="26" y="66" width="18" height="22" rx="6" fill="#FFB703" stroke={OUTLINE} strokeWidth="2.5" />
      <rect x="30" y="72" width="10" height="6" rx="2" fill="#e09b00" stroke={OUTLINE} strokeWidth="1.5" />
      {/* 腳 */}
      <ellipse cx="48" cy="102" rx="9" ry="6" fill="#3f9970" stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="70" cy="102" rx="9" ry="6" fill="#3f9970" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 頭 */}
      <circle cx="60" cy="38" r="24" fill="#52B788" stroke={OUTLINE} strokeWidth="3" />
      {/* 吻部 */}
      <path d="M78 36q14 0 12 10q-2 8 -14 6q-6 -1 -6 -8q0 -7 8 -8z" fill="#74c69d" stroke={OUTLINE} strokeWidth="2.5" />
      <circle cx="84" cy="42" r="1.8" fill={OUTLINE} />
      {/* 背刺 */}
      <path d="M42 18l-4 -10l10 4zM56 12l0 -11l8 7zM70 15l6 -9l3 11z" fill="#2D6A4F" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 臉 */}
      <Eye cx={52} cy={38} r={4.2} />
      <Eye cx={70} cy={34} r={3.4} />
      <Blush cx={46} cy={47} />
      <path d="M62 48q6 3 12 0" stroke={OUTLINE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M66 48l2 3l3 -3" fill="#ffffff" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
    </>
  );
}

// ---------- 貓咪超人喵俠：紅披風橘貓 ----------
function CatHeroArt(): JSX.Element {
  return (
    <>
      <ellipse cx="58" cy="108" rx="26" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* 披風 */}
      <path d="M44 62q-18 16 -14 38q16 2 26 -4l-4 -30z" fill="#D62828" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 身體 */}
      <rect x="42" y="62" width="34" height="38" rx="14" fill="#F77F00" stroke={OUTLINE} strokeWidth="3" />
      <path d="M50 66q4 8 0 16M60 66q4 8 0 16" stroke="#FCBF49" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* 胸口徽章 */}
      <circle cx="59" cy="80" r="7" fill="#FCBF49" stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M59 76l1.4 2.8l3.1 .4l-2.2 2.2l.5 3.1l-2.8 -1.5l-2.8 1.5l.5 -3.1l-2.2 -2.2l3.1 -.4z" fill="#D62828" />
      {/* 腳 */}
      <ellipse cx="50" cy="102" rx="8" ry="5" fill="#e06f00" stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="68" cy="102" rx="8" ry="5" fill="#e06f00" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 尾巴 */}
      <path d="M76 92q16 0 16 -14" stroke={OUTLINE} strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M76 92q16 0 16 -14" stroke="#F77F00" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* 頭 */}
      <circle cx="58" cy="40" r="25" fill="#F77F00" stroke={OUTLINE} strokeWidth="3" />
      {/* 貓耳 */}
      <path d="M38 24l-5 -14l14 7z" fill="#F77F00" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M78 24l5 -14l-14 7z" fill="#F77F00" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M39 21l-2 -6l6 3z" fill="#FCBF49" />
      <path d="M77 21l2 -6l-6 3z" fill="#FCBF49" />
      {/* 面罩 */}
      <path d="M35 34q23 -8 46 0l-1 10q-22 -6 -44 0z" fill="#003049" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="48" cy="39" rx="5" ry="4.5" fill="#ffffff" />
      <ellipse cx="68" cy="39" rx="5" ry="4.5" fill="#ffffff" />
      <circle cx="49" cy="39" r="2.5" fill="#2c3e50" />
      <circle cx="69" cy="39" r="2.5" fill="#2c3e50" />
      {/* 鼻＋嘴＋鬍鬚 */}
      <path d="M56 48l2 2l2 -2" fill="#ff8a80" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M54 53q4 3 8 0" stroke={OUTLINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M30 46h8M30 51h8M78 46h8M78 51h8" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
      <Blush cx={41} cy={50} />
      <Blush cx={75} cy={50} />
      {/* 肉球拳 */}
      <g>
        <circle cx="88" cy="70" r="9" fill="#F77F00" stroke={OUTLINE} strokeWidth="2.5" />
        <circle cx="86" cy="68" r="2" fill="#ffb3c1" />
        <circle cx="91" cy="67" r="2" fill="#ffb3c1" />
        <ellipse cx="88" cy="73" rx="3.5" ry="2.5" fill="#ffb3c1" />
      </g>
    </>
  );
}

// ---------- 幽靈刺客小夜：銀髮賽博朋克刺客 ----------
function YoruArt(): JSX.Element {
  return (
    <>
      <ellipse cx="58" cy="108" rx="26" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* 漂浮能量光球 */}
      <circle cx="26" cy="70" r="7" fill="#1fd1ff" opacity="0.35" />
      <circle cx="26" cy="70" r="4" fill="#7be9ff" stroke={OUTLINE} strokeWidth="1.5" />
      {/* 身體：黑色潛行服＋霓虹藍流光邊 */}
      <rect x="42" y="62" width="34" height="38" rx="13" fill="#14161c" stroke={OUTLINE} strokeWidth="3" />
      <path d="M44 66q30 4 30 34M74 66q-30 4 -30 34" stroke="#1fd1ff" strokeWidth="2" fill="none" opacity="0.85" />
      {/* 腳 */}
      <ellipse cx="50" cy="102" rx="8" ry="5" fill="#0c0d11" stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="68" cy="102" rx="8" ry="5" fill="#0c0d11" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 長銀髮（背後） */}
      <path d="M34 38q-8 30 -4 46q6 6 12 -2l-2 -40z" fill="#dfe6ea" stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M82 38q8 30 4 46q-6 6 -12 -2l2 -40z" fill="#dfe6ea" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 頭 */}
      <circle cx="58" cy="42" r="24" fill="#f3d9c4" stroke={OUTLINE} strokeWidth="3" />
      <path d="M35 38q3 -16 23 -16q20 0 23 16l-6 2q-6 -9 -17 -9q-11 0 -17 9z" fill="#eef2f4" stroke={OUTLINE} strokeWidth="2" />
      {/* 霓虹藍發光眼 */}
      <circle cx="49" cy="44" r="5" fill="#0b8fb0" opacity="0.35" />
      <circle cx="49" cy="44" r="3.2" fill="#1fd1ff" stroke={OUTLINE} strokeWidth="1.5" />
      <circle cx="67" cy="44" r="5" fill="#0b8fb0" opacity="0.35" />
      <circle cx="67" cy="44" r="3.2" fill="#1fd1ff" stroke={OUTLINE} strokeWidth="1.5" />
      <path d="M52 54q6 3 12 0" stroke={OUTLINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 科技短匕首（反手持） */}
      <g>
        <path d="M84 50l14 8l-14 4l4-6z" fill="#cfe9ff" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
        <rect x="80" y="55" width="8" height="6" rx="2" fill="#14161c" stroke={OUTLINE} strokeWidth="2" />
      </g>
    </>
  );
}

// ---------- 熊貓拳聖胖達：圓滾滾的中式武術大熊貓 ----------
function PandaArt(): JSX.Element {
  return (
    <>
      <ellipse cx="58" cy="108" rx="30" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* 葫蘆 */}
      <path d="M32 82q-2-4 2-6q4 2 2 6q3 3 0 6q-4 3-6 0q-3-3 2-6z" fill="#c98a00" stroke={OUTLINE} strokeWidth="2" />
      {/* 身體：圓滾滾白身 */}
      <ellipse cx="58" cy="82" rx="30" ry="26" fill="#fdfdfd" stroke={OUTLINE} strokeWidth="3" />
      {/* 紅色唐裝背心 */}
      <path d="M36 68q22-8 44 0l-4 30q-18 6 -36 0z" fill="#D62828" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="58" cy="80" r="2.5" fill="#FCBF49" />
      <circle cx="58" cy="90" r="2.5" fill="#FCBF49" />
      {/* 黑熊掌腳 */}
      <ellipse cx="42" cy="104" rx="10" ry="6" fill="#1c1c1c" stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="74" cy="104" rx="10" ry="6" fill="#1c1c1c" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 頭 */}
      <circle cx="58" cy="40" r="25" fill="#fdfdfd" stroke={OUTLINE} strokeWidth="3" />
      {/* 黑耳朵 */}
      <circle cx="36" cy="22" r="9" fill="#1c1c1c" stroke={OUTLINE} strokeWidth="2.5" />
      <circle cx="80" cy="22" r="9" fill="#1c1c1c" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 熱血頭巾 */}
      <path d="M32 30q26-14 52 0l-3 6q-23-11-46 0z" fill="#F1C40F" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M84 30q10 2 8 12" stroke="#F1C40F" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* 黑眼罩＋眼睛 */}
      <ellipse cx="47" cy="42" rx="9" ry="10" fill="#1c1c1c" />
      <ellipse cx="69" cy="42" rx="9" ry="10" fill="#1c1c1c" />
      <circle cx="48" cy="43" r="3.2" fill="#ffffff" />
      <circle cx="70" cy="43" r="3.2" fill="#ffffff" />
      <circle cx="49" cy="44" r="1.6" fill={OUTLINE} />
      <circle cx="71" cy="44" r="1.6" fill={OUTLINE} />
      <ellipse cx="58" cy="52" rx="6" ry="4.5" fill="#ffffff" stroke={OUTLINE} strokeWidth="1.5" />
      <circle cx="58" cy="52" r="1.8" fill={OUTLINE} />
      {/* 巨大厚重拳套 */}
      <g>
        <circle cx="90" cy="72" r="12" fill="#8a5a2a" stroke={OUTLINE} strokeWidth="3" />
        <path d="M82 68h4M82 74h4M82 80h4" stroke="#6a4319" strokeWidth="2" strokeLinecap="round" />
      </g>
    </>
  );
}

// ---------- 皇家琴劍士愛麗絲：金髮宮廷豎琴劍士 ----------
function AliceArt(): JSX.Element {
  return (
    <>
      <ellipse cx="58" cy="108" rx="26" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* 蓬蓬裙 */}
      <path d="M40 66q18-8 36 0l10 34l-56 0z" fill="#ffffff" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M40 66q18-8 36 0l3 10q-21-9-42 0z" fill="#4EA8DE" opacity="0.5" />
      <path d="M34 100h48" stroke="#4EA8DE" strokeWidth="3" />
      {/* 金色雙馬尾 */}
      <path d="M36 34q-14 6 -12 26q2 10 10 8q-6-16 2-34z" fill="#FEE440" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M80 34q14 6 12 26q-2 10 -10 8q6-16 -2-34z" fill="#FEE440" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 頭 */}
      <circle cx="58" cy="40" r="24" fill="#FCD5CE" stroke={OUTLINE} strokeWidth="3" />
      <path d="M36 36q3-16 22-16q19 0 22 16l-6 2q-6-9-16-9q-10 0-16 9z" fill="#FEE440" stroke={OUTLINE} strokeWidth="2" />
      {/* 精靈翅膀髮箍 */}
      <path d="M46 20q-8-6-4-12q6-2 8 8z" fill="#9B5DE5" stroke={OUTLINE} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M70 20q8-6 4-12q-6-2 -8 8z" fill="#9B5DE5" stroke={OUTLINE} strokeWidth="1.8" strokeLinejoin="round" />
      {/* 臉 */}
      <Eye cx={49} cy={42} r={4} />
      <Eye cx={67} cy={42} r={4} />
      <Blush cx={43} cy={50} />
      <Blush cx={73} cy={50} />
      <path d="M53 53q5 4 10 0" stroke={OUTLINE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* 霓虹粉電子豎琴＋白色細劍 */}
      <g>
        <path d="M84 40q16 6 10 40q-5 4 -8 0q3-30 -6-36z" fill="#ff9ecf" opacity="0.55" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
        <line x1="86" y1="46" x2="90" y2="76" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
        <line x1="90" y1="44" x2="93" y2="74" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
        <rect x="92" y="10" width="3" height="34" rx="1.5" fill="#ffffff" stroke={OUTLINE} strokeWidth="1.8" />
      </g>
    </>
  );
}

// ---------- 爆彈科學家阿秋：薄荷綠亂髮科學家 ----------
function ChiuArt(): JSX.Element {
  return (
    <>
      <ellipse cx="58" cy="108" rx="27" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* 白袍（沾污漬） */}
      <rect x="40" y="62" width="36" height="38" rx="12" fill="#f4f6f7" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="48" cy="76" r="3" fill="#3a2a1a" opacity="0.25" />
      <circle cx="66" cy="88" r="4" fill="#3a2a1a" opacity="0.2" />
      <path d="M58 62v38" stroke="#c7ccce" strokeWidth="2" />
      {/* 腳 */}
      <ellipse cx="50" cy="102" rx="8" ry="5" fill="#5a5f61" stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="68" cy="102" rx="8" ry="5" fill="#5a5f61" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 頭 */}
      <circle cx="58" cy="40" r="24" fill="#f3d9c4" stroke={OUTLINE} strokeWidth="3" />
      {/* 薄荷綠亂髮 */}
      <path d="M33 34q0-20 25-20q25 0 25 20q-6-4-10 2q-4-8-10-2q-4-8-10-2q-4-8-10-2q-6-4-10 6z" fill="#8ee6c8" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 大護目鏡（單邊紅光） */}
      <circle cx="49" cy="42" r="8" fill="#dfeaea" stroke={OUTLINE} strokeWidth="2.5" />
      <circle cx="67" cy="42" r="8" fill="#ff4d4d" opacity="0.8" stroke={OUTLINE} strokeWidth="2.5" />
      <rect x="55" y="40" width="6" height="3" fill="#5a5f61" />
      <circle cx="49" cy="42" r="2.5" fill={OUTLINE} />
      <circle cx="67" cy="42" r="2.5" fill="#ffffff" />
      <path d="M52 54q6 3 12 0" stroke={OUTLINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 柚子造型科技手砲（扛肩上） */}
      <g>
        <circle cx="92" cy="58" r="14" fill="#52B788" stroke={OUTLINE} strokeWidth="3" />
        <circle cx="92" cy="58" r="7" fill="#caffbf" opacity="0.7" />
        <rect x="76" y="70" width="10" height="20" rx="4" fill="#3f9970" stroke={OUTLINE} strokeWidth="2.5" />
      </g>
    </>
  );
}

// ---------- 星海龍騎士凱爾：紫藍鱗甲龍騎士 ----------
function KyleArt(): JSX.Element {
  return (
    <>
      <ellipse cx="58" cy="108" rx="27" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* 星空披風 */}
      <path d="M40 64q-16 20 -8 44q14 4 26-4l-2-38z" fill="#241b4e" opacity="0.85" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="34" cy="86" r="1.4" fill="#ffffff" />
      <circle cx="30" cy="98" r="1.2" fill="#ffffff" />
      <circle cx="38" cy="102" r="1.4" fill="#ffffff" />
      {/* 龍鱗鎧甲身體 */}
      <rect x="42" y="62" width="34" height="38" rx="12" fill="#3d3a7c" stroke={OUTLINE} strokeWidth="3" />
      <path d="M46 70q4 4 0 8M54 70q4 4 0 8M62 70q4 4 0 8M70 70q4 4 0 8" stroke="#6a5fd6" strokeWidth="2" fill="none" opacity="0.8" />
      {/* 腳 */}
      <ellipse cx="50" cy="102" rx="8" ry="5" fill="#2c2960" stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="68" cy="102" rx="8" ry="5" fill="#2c2960" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 頭 */}
      <circle cx="58" cy="40" r="24" fill="#f3d9c4" stroke={OUTLINE} strokeWidth="3" />
      {/* 深藍短髮 */}
      <path d="M34 36q2-18 24-18q22 0 24 18l-6 3q-7-11-18-11q-11 0-18 11z" fill="#22245c" stroke={OUTLINE} strokeWidth="2.5" />
      {/* 龍角 */}
      <path d="M42 20l-4-10l8 4z" fill="#7be0ff" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M74 20l4-10l-8 4z" fill="#7be0ff" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
      {/* 臉：沉穩銳眼 */}
      <path d="M40 42l14 2M76 42l-14 2" stroke={OUTLINE} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="49" cy="45" r="3.4" fill="#3d3a7c" stroke={OUTLINE} strokeWidth="1.6" />
      <circle cx="67" cy="45" r="3.4" fill="#3d3a7c" stroke={OUTLINE} strokeWidth="1.6" />
      <path d="M52 54q6 2 12 0" stroke={OUTLINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 龍骨長槍 */}
      <g>
        <rect x="86" y="20" width="5" height="62" rx="2.5" fill="#cfc6ee" stroke={OUTLINE} strokeWidth="2.5" />
        <path d="M88 6l7 14l-14 0z" fill="#9b5dff" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="88" cy="30" r="2" fill="#9b5dff" opacity="0.7" />
      </g>
    </>
  );
}

// ---------- 後備造型（內容包英雄尚未提供插畫時） ----------
function FallbackHeroArt(): JSX.Element {
  return (
    <>
      <ellipse cx="58" cy="108" rx="26" ry="6" fill="rgba(0,0,0,0.15)" />
      <rect x="40" y="62" width="36" height="38" rx="14" fill="#8ec6f0" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="58" cy="42" r="25" fill="#FCD5CE" stroke={OUTLINE} strokeWidth="3" />
      <Eye cx={49} cy={44} r={4} />
      <Eye cx={67} cy={44} r={4} />
      <path d="M52 55q6 4 12 0" stroke={OUTLINE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  );
}

const HERO_ART: Record<string, () => JSX.Element> = {
  "hero-aguang": AguangArt,
  "hero-pudding-ninja": PuddingNinjaArt,
  "hero-star-wizard": StarWizardArt,
  "hero-robo-dog": RoboDogArt,
  "hero-baby-dino": BabyDinoArt,
  "hero-cat-hero": CatHeroArt,
  "hero-yoru": YoruArt,
  "hero-panda": PandaArt,
  "hero-alice": AliceArt,
  "hero-chiu": ChiuArt,
  "hero-kyle": KyleArt,
};

export function HeroRig({ heroId, phase = "idle", size = 120 }: HeroRigProps) {
  const Art = HERO_ART[heroId] ?? FallbackHeroArt;
  const phaseClass = phase === "prep" ? "anim-prep" : phase === "slash" ? "anim-slash" : "anim-idle";
  // 動畫掛在外層 div（HTML 元素的 transform-origin 可靠地設在腳底中央），
  // 不能掛在 SVG 內部的 <g> 上——SVG 的變形原點預設在 viewBox 左上角，縮放/傾斜會整個跑位。
  return (
    <div className={`hero-rig ${phaseClass}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} style={{ display: "block" }}>
        <Art />
      </svg>
    </div>
  );
}
