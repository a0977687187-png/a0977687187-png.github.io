export interface MonsterDesign {
  designId: string;
  name: string;
  avatar: string; // spriteRegistry id（見 src/content/pixelMonsters.ts）
  symbolizes: string;
  packId: string;
}

// 說明書第 5 節怪獸清單，全部已在 pixelMonsters.ts 內建 32x32 矩陣像素插畫。
export const MONSTER_DESIGNS: MonsterDesign[] = [
  { designId: "mud-lazy", name: "懶惰泥怪", avatar: "monster-mud-lazy", symbolizes: "拖拖拉拉、賴床", packId: "core" },
  { designId: "germ-trouble", name: "搗蛋菌菌怪", avatar: "monster-germ-trouble", symbolizes: "不洗手、不刷牙", packId: "core" },
  { designId: "roar-rex", name: "大吼霸王龍", avatar: "monster-roar-rex", symbolizes: "亂發脾氣、大吼大叫", packId: "core" },
  { designId: "picky-fairy", name: "挑食妖精", avatar: "monster-picky-fairy", symbolizes: "挑食", packId: "core" },
  { designId: "3c-octopus", name: "3C 章魚", avatar: "monster-3c-octopus", symbolizes: "3C 成癮", packId: "core" },
  { designId: "messy-king", name: "亂丟大王", avatar: "monster-messy-king", symbolizes: "不收玩具、房間亂", packId: "core" },
  { designId: "talkback-parrot", name: "頂嘴鸚鵡王", avatar: "monster-talkback-parrot", symbolizes: "頂嘴、不禮貌", packId: "core" },
  { designId: "night-bat", name: "夜貓蝙蝠", avatar: "monster-night-bat", symbolizes: "不肯睡覺", packId: "core" },
];
