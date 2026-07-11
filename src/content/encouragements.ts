export const ENCOURAGEMENTS = [
  "爸爸媽媽以你為榮！",
  "你越來越棒了！",
  "繼續保持，你做得到！",
  "太厲害了，給自己拍拍手！",
  "你的努力大家都看到了！",
  "這就是最棒的自己！",
  "你今天又進步了一點！",
  "做得好，記得抱抱自己！",
];

export function randomEncouragement(): string {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

export const NO_POINT_PRAISES = [
  "太棒了！你做到了！",
  "你真的很努力，繼續加油！",
  "這個好習慣你已經抓到訣竅了！",
];

export function randomNoPointPraise(): string {
  return NO_POINT_PRAISES[Math.floor(Math.random() * NO_POINT_PRAISES.length)];
}
