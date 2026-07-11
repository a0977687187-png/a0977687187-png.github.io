// 4 節「8-bit 復古音效引擎」：純 Web Audio 合成，不載入任何音檔。
// 呼叫端自行依 settings.soundEnabled 決定是否播放。
let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx) sharedCtx = new Ctor();
  return sharedCtx;
}

// 4.1 揮擊音效：triangle 波做 pitch sweep。
export function playSwingSound(): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(100, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

export type HitVariant = "default" | "sharp" | "boom";

// 4.2 命中音效：低頻 sawtooth 悶擊 + 高頻 sine 清脆感疊加。
// variant "sharp"（小夜／凱爾的斬擊、刺擊）：高頻拉更高，模擬鋒利切除感。
// variant "boom"（阿秋的爆炸砲擊）：低頻 sawtooth 衰減時間拉長到 0.5s，做出重裝大爆炸的轟鳴感。
export function playHitSound(variant: HitVariant = "default"): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;

  const lowDecay = variant === "boom" ? 0.5 : 0.25;
  const oscLow = audioCtx.createOscillator();
  const gainLow = audioCtx.createGain();
  oscLow.type = "sawtooth";
  oscLow.frequency.setValueAtTime(variant === "boom" ? 200 : 150, audioCtx.currentTime);
  oscLow.frequency.exponentialRampToValueAtTime(variant === "boom" ? 30 : 40, audioCtx.currentTime + lowDecay * 0.8);

  gainLow.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gainLow.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + lowDecay);

  oscLow.connect(gainLow);
  gainLow.connect(audioCtx.destination);
  oscLow.start();
  oscLow.stop(audioCtx.currentTime + lowDecay);

  const highFreq = variant === "sharp" ? 1600 : 900;
  const highFreqDrop = variant === "sharp" ? 900 : 450;
  const oscHigh = audioCtx.createOscillator();
  const gainHigh = audioCtx.createGain();
  oscHigh.type = "sine";
  oscHigh.frequency.setValueAtTime(highFreq, audioCtx.currentTime);
  oscHigh.frequency.setValueAtTime(highFreqDrop, audioCtx.currentTime + 0.05);

  gainHigh.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gainHigh.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

  oscHigh.connect(gainHigh);
  gainHigh.connect(audioCtx.destination);
  oscHigh.start();
  oscHigh.stop(audioCtx.currentTime + 0.15);
}

// 4.3 怪獸哭泣音效：sine 波做 vibrato 下滑音。
export function playCrySound(): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.4);
  osc.frequency.linearRampToValueAtTime(450, audioCtx.currentTime + 0.8);

  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.8);
}

// 勝利號角與點數不足提示不在原始指南範圍內，沿用簡易合成音補齊既有互動回饋。
export function playVictorySound(): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  [523, 659, 784].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = audioCtx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

// 開禮物：快速上行琶音＋高音閃亮感。
export function playGiftOpenSound(): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const start = audioCtx.currentTime + i * 0.07;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + 0.35);
  });
}

export function playInsufficientSound(): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 220;
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
}
