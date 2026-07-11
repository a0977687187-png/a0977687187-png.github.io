import { getAll, getById, put, putMany } from "../db/database";
import { CORE_HEROES, CORE_SKILLS } from "./heroesSeed";
import { CORE_QUESTIONS } from "./questionsSeed";
import type { ContentPack, Hero, Skill, Question } from "../types";

const CORE_PACK_ID = "core";
// 版本提升代表 core 包本身新增了內容。以 packId+version 判斷是否需要重新比對，
// 符合 8.2「以 packId+version 增量合併、不覆蓋玩家資料」原則：只新增缺少的資料，
// 已存在的資料（含家長之後可能調整過的價格、停用設定等）不會被覆蓋。
const CORE_PACK_VERSION = "1.6.0"; // 1.6.0：題庫擴充第三批（每格再 +25 題，累計每格 75 題）

export async function ensureCoreContentSeeded(): Promise<void> {
  const existingPack = await getById<ContentPack>("contentPacks", CORE_PACK_ID);
  if (existingPack && existingPack.version === CORE_PACK_VERSION) return;

  // 題庫有上千筆，逐筆檢查、逐筆寫入在同步版會是上千次雲端來回（要等好幾分鐘）。
  // 改成每個 store 只整批讀一次既有 id，缺少的部分再整批寫入（putMany 內部會分批送出）。
  const existingHeroIds = new Set((await getAll<Hero>("heroes")).map((h) => h.id));
  const existingSkillIds = new Set((await getAll<Skill>("skills")).map((s) => s.id));
  const existingQuestionIds = new Set((await getAll<Question>("questions")).map((q) => q.id));

  const missingHeroes = CORE_HEROES.filter((h) => !existingHeroIds.has(h.id));
  const missingSkills = CORE_SKILLS.filter((s) => !existingSkillIds.has(s.id));
  const missingQuestions = CORE_QUESTIONS.filter((q) => !existingQuestionIds.has(q.id));

  if (missingHeroes.length) await putMany("heroes", missingHeroes);
  if (missingSkills.length) await putMany("skills", missingSkills);
  if (missingQuestions.length) await putMany("questions", missingQuestions);

  const pack: ContentPack = {
    packId: CORE_PACK_ID,
    name: "初版內建內容",
    version: CORE_PACK_VERSION,
    installedAt: existingPack?.installedAt ?? new Date().toISOString(),
    active: true,
  };
  await put("contentPacks", pack);
}
