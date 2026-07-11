// 英雄商店擴充包的專屬台詞（見 MAPLE_UI_GUIDE.md）。idle 顯示在英雄商店的出戰卡片上，
// attack/victory 先保留資料備用（skill-card 目前顯示招式名稱，欄位保留給未來想接台詞氣泡時直接用）。
export interface HeroDialogue {
  idle: string;
  attack: string;
  victory: string;
}

export const HERO_DIALOGUE: Record<string, HeroDialogue> = {
  "hero-yoru": {
    idle: "潛入陰影之中……壞習慣的破綻，我已經看穿了。",
    attack: "影縫之術！這招你躲不掉的！",
    victory: "（收刀入鞘）任務完成。下次遇到困難，我依然會保護你。",
  },
  "hero-panda": {
    idle: "（呼嚕嚕）肚子好餓啊……打完這隻怪獸可以吃竹子便當嗎？",
    attack: "接招！熊貓百裂拳——！！",
    victory: "哈哈！只要肯努力，沒有什麼習慣是改不掉的！",
  },
  "hero-alice": {
    idle: "讓優美的琴聲，洗滌心靈的疲憊與壞習慣吧。",
    attack: "神聖交響樂——奏鳴！",
    victory: "勇氣就是最美的旋律，你彈奏得非常好哦。",
  },
  "hero-chiu": {
    idle: "嘿嘿……聽說把點數和爆炸物結合，能做出不得了的東西呢！",
    attack: "嘗嘗我最新發明的——超級柚子大火砲！",
    victory: "科學的勝利！轟炸壞習慣的感覺太爽快了！",
  },
  "hero-kyle": {
    idle: "吾血即為龍之羈絆，星海將指引我們戰勝懶惰。",
    attack: "龍魂覺醒……貫穿它，星神閃！",
    victory: "你展現了真正的騎士精神，繼續保持下去。",
  },
};

export function getHeroDialogue(heroId: string): HeroDialogue | null {
  return HERO_DIALOGUE[heroId] ?? null;
}
