import { getAll, getById, put, remove } from "./database";
import { CURRENT_SCHEMA_VERSION } from "./schema";
import type {
  Child,
  Task,
  DeductionRule,
  Monster,
  Hero,
  Skill,
  HeroOwnership,
  PointLedgerEntry,
  LedgerRefType,
  Prize,
  Question,
  QuizSubject,
  QuizAttempt,
  RewardCoupon,
  Settings,
} from "../types";

function uid(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

// ---------- Settings ----------
// 確保 settings 一定存在。本機版由 migrations 建立，但同步版（Firestore）新家庭
// 是一個全空的雲端資料庫，沒有這一步 App 會以為初始設定已完成而卡在空白首頁。
export async function ensureSettingsExist(): Promise<void> {
  const existing = await getById<Settings>("settings", "singleton");
  if (existing) return;
  const defaults: Settings = {
    id: "singleton",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    parentPin: "",
    securityQuestion: null,
    soundEnabled: true,
    redemptionWeekday: null,
    setupCompleted: false,
  };
  await put("settings", defaults);
}

export async function getSettings(): Promise<Settings> {
  const settings = await getById<Settings>("settings", "singleton");
  return settings as Settings;
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await put("settings", next);
  return next;
}

// ---------- Children ----------
export async function listChildren(): Promise<Child[]> {
  return getAll<Child>("children");
}

export async function getChild(id: string): Promise<Child | undefined> {
  return getById<Child>("children", id);
}

export async function createChild(data: Omit<Child, "id" | "pointsCache" | "createdAt">): Promise<Child> {
  const child: Child = { ...data, id: uid(), pointsCache: 0, createdAt: nowIso() };
  await put("children", child);
  return child;
}

export async function updateChild(id: string, patch: Partial<Child>): Promise<Child | undefined> {
  const existing = await getChild(id);
  if (!existing) return undefined;
  const next = { ...existing, ...patch };
  await put("children", next);
  return next;
}

export async function deleteChild(id: string): Promise<void> {
  await remove("children", id);
}

// ---------- Tasks ----------
export async function listTasks(childId?: string): Promise<Task[]> {
  const all = await getAll<Task>("tasks");
  return childId ? all.filter((t) => t.childId === childId) : all;
}

export async function createTask(data: Omit<Task, "id" | "createdAt">): Promise<Task> {
  const task: Task = { ...data, id: uid(), createdAt: nowIso() };
  await put("tasks", task);
  return task;
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<Task | undefined> {
  const existing = await getById<Task>("tasks", id);
  if (!existing) return undefined;
  const next = { ...existing, ...patch };
  await put("tasks", next);
  return next;
}

export async function deleteTask(id: string): Promise<void> {
  await remove("tasks", id);
}

// ---------- Deduction rules ----------
export async function listDeductionRules(childId?: string): Promise<DeductionRule[]> {
  const all = await getAll<DeductionRule>("deductionRules");
  return childId ? all.filter((r) => r.childId === childId) : all;
}

export async function createDeductionRule(
  data: Omit<DeductionRule, "id" | "createdAt">
): Promise<DeductionRule> {
  const rule: DeductionRule = { ...data, id: uid(), createdAt: nowIso() };
  await put("deductionRules", rule);
  return rule;
}

export async function updateDeductionRule(
  id: string,
  patch: Partial<DeductionRule>
): Promise<DeductionRule | undefined> {
  const existing = await getById<DeductionRule>("deductionRules", id);
  if (!existing) return undefined;
  const next = { ...existing, ...patch };
  await put("deductionRules", next);
  return next;
}

export async function deleteDeductionRule(id: string): Promise<void> {
  await remove("deductionRules", id);
}

// ---------- Point ledger (single source of truth for points) ----------
export async function listLedger(childId?: string): Promise<PointLedgerEntry[]> {
  const all = await getAll<PointLedgerEntry>("pointLedger");
  const filtered = childId ? all.filter((e) => e.childId === childId) : all;
  return filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

async function applyLedgerEntry(
  childId: string,
  delta: number,
  reason: string,
  refType: LedgerRefType,
  refId?: string
): Promise<{ entry: PointLedgerEntry; child: Child }> {
  const child = await getChild(childId);
  if (!child) throw new Error("Child not found: " + childId);

  const nextPoints = Math.max(0, child.pointsCache + delta);
  const actualDelta = nextPoints - child.pointsCache;

  const entry: PointLedgerEntry = {
    id: uid(),
    childId,
    delta: actualDelta,
    reason,
    refType,
    refId,
    timestamp: nowIso(),
  };
  await put("pointLedger", entry);

  const updatedChild = { ...child, pointsCache: nextPoints };
  await put("children", updatedChild);

  return { entry, child: updatedChild };
}

export interface GivePointsResult {
  entry: PointLedgerEntry;
  child: Child;
  awarded: boolean;
  limitReached?: boolean; // 今日已達此任務的 dailyLimit 上限，未給點
}

export async function givePointsForTask(
  childId: string,
  task: Task,
  multiplier = 1,
  reasonOverride?: string
): Promise<GivePointsResult> {
  // 每日最多可得次數（3.2.1 dailyLimit）：計算今天這個任務已給點幾次，達上限就不再給。
  const dailyLimit = Number(task.dailyLimit);
  if (Number.isFinite(dailyLimit) && dailyLimit >= 1) {
    const today = todayStr();
    const ledger = await listLedger(childId);
    const todayCount = ledger.filter(
      (e) => e.refType === "task" && e.refId === task.id && new Date(e.timestamp).toDateString() === today
    ).length;
    if (todayCount >= dailyLimit) {
      return {
        child: (await getChild(childId))!,
        awarded: false,
        limitReached: true,
        entry: {
          id: uid(),
          childId,
          delta: 0,
          reason: reasonOverride ?? task.title,
          refType: "task",
          refId: task.id,
          timestamp: nowIso(),
        },
      };
    }
  }

  if (task.reinforceMode === "間歇") {
    const awarded = Math.random() < task.intermittentRate;
    if (!awarded) {
      return {
        child: (await getChild(childId))!,
        awarded: false,
        entry: {
          id: uid(),
          childId,
          delta: 0,
          reason: reasonOverride ?? task.title,
          refType: "task",
          refId: task.id,
          timestamp: nowIso(),
        },
      };
    }
  }
  const points = Math.round(task.points * multiplier);
  const result = await applyLedgerEntry(
    childId,
    points,
    reasonOverride ?? task.title,
    "task",
    task.id
  );
  return { ...result, awarded: true };
}

export async function applyDeduction(
  childId: string,
  rule: DeductionRule
): Promise<{ entry: PointLedgerEntry; child: Child }> {
  return applyLedgerEntry(childId, -Math.abs(rule.points), rule.title, "deduction", rule.id);
}

export async function adjustPoints(
  childId: string,
  delta: number,
  reason: string
): Promise<{ entry: PointLedgerEntry; child: Child }> {
  return applyLedgerEntry(childId, delta, reason, "adjust");
}

// ---------- Monsters ----------
export async function listMonsters(childId?: string): Promise<Monster[]> {
  const all = await getAll<Monster>("monsters");
  return childId ? all.filter((m) => m.childId === childId) : all;
}

export async function createMonster(
  data: Omit<Monster, "id" | "createdAt" | "currentHp">
): Promise<Monster> {
  const monster: Monster = { ...data, id: uid(), currentHp: data.maxHp, createdAt: nowIso() };
  await put("monsters", monster);
  return monster;
}

export async function updateMonster(id: string, patch: Partial<Monster>): Promise<Monster | undefined> {
  const existing = await getById<Monster>("monsters", id);
  if (!existing) return undefined;
  const next = { ...existing, ...patch };
  await put("monsters", next);
  return next;
}

export async function deleteMonster(id: string): Promise<void> {
  await remove("monsters", id);
}

// 啟用一隻排隊中的怪獸為挑戰中；同一孩子同時只能有一隻挑戰中怪獸。
export async function activateMonster(childId: string, monsterId: string): Promise<Monster | undefined> {
  const monsters = await listMonsters(childId);
  const alreadyActive = monsters.some((m) => m.status === "挑戰中");
  if (alreadyActive) return undefined;
  return updateMonster(monsterId, { status: "挑戰中" });
}

// 怪獸擊倒後，若還有排隊中的怪獸，自動遞補最早建立的一隻為挑戰中。
async function promoteNextQueuedMonster(childId: string): Promise<void> {
  const monsters = await listMonsters(childId);
  if (monsters.some((m) => m.status === "挑戰中")) return;
  const queued = monsters
    .filter((m) => m.status === "排隊中")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (queued[0]) {
    await updateMonster(queued[0].id, { status: "挑戰中" });
  }
}

export interface AttackResult {
  ok: boolean;
  reason?: "insufficient" | "no-monster";
  monster?: Monster;
  child?: Child;
  defeated: boolean;
  coupon?: RewardCoupon;
  pointsSpent: number;
}

// 打怪獸：扣除攻擊所需點數並造成 1 點傷害，血量歸零時發放獎勵券並自動遞補下一隻排隊怪獸。
export async function attackMonster(childId: string, monsterId: string): Promise<AttackResult> {
  const monster = await getById<Monster>("monsters", monsterId);
  if (!monster || monster.status !== "挑戰中") {
    return { ok: false, reason: "no-monster", defeated: false, pointsSpent: 0 };
  }
  const child = await getChild(childId);
  if (!child || child.pointsCache < monster.costPerAttack) {
    return { ok: false, reason: "insufficient", defeated: false, pointsSpent: 0 };
  }

  const { child: updatedChild } = await applyLedgerEntry(
    childId,
    -monster.costPerAttack,
    `攻擊【${monster.name}】`,
    "attack",
    monster.id
  );

  const nextHp = Math.max(0, monster.currentHp - 1);
  const defeated = nextHp === 0;
  const updatedMonster = await updateMonster(monster.id, {
    currentHp: nextHp,
    status: defeated ? "已擊倒" : "挑戰中",
    defeatedAt: defeated ? nowIso() : undefined,
  });

  let coupon: RewardCoupon | undefined;
  if (defeated) {
    coupon = await createRewardCoupon({
      childId,
      monsterId: monster.id,
      monsterName: monster.name,
      reward: monster.reward,
    });
    await promoteNextQueuedMonster(childId);
  }

  return {
    ok: true,
    defeated,
    monster: updatedMonster,
    child: updatedChild,
    coupon,
    pointsSpent: monster.costPerAttack,
  };
}

// ---------- Heroes / Skills ----------
export async function listHeroes(): Promise<Hero[]> {
  return getAll<Hero>("heroes");
}

export async function listSkills(): Promise<Skill[]> {
  return getAll<Skill>("skills");
}

export async function updateHero(id: string, patch: Partial<Hero>): Promise<Hero | undefined> {
  const existing = await getById<Hero>("heroes", id);
  if (!existing) return undefined;
  const next = { ...existing, ...patch };
  await put("heroes", next);
  return next;
}

export interface PurchaseHeroResult {
  ok: boolean;
  reason?: "insufficient" | "owned";
  child?: Child;
}

// 購買英雄：扣點（寫入 pointLedger）並建立擁有紀錄。與打怪共用同一個點數池，
// 讓孩子練習「儲蓄 vs. 消費」的取捨（開發說明書 3.4）。
export async function purchaseHero(childId: string, hero: Hero): Promise<PurchaseHeroResult> {
  const owned = await listHeroOwnership(childId);
  if (owned.some((o) => o.heroId === hero.id)) {
    return { ok: false, reason: "owned" };
  }
  const child = await getChild(childId);
  if (!child || child.pointsCache < hero.price) {
    return { ok: false, reason: "insufficient" };
  }
  const { child: updatedChild } = await applyLedgerEntry(
    childId,
    -hero.price,
    `購買英雄【${hero.name}】`,
    "purchase",
    hero.id
  );
  const ownership: HeroOwnership = {
    id: uid(),
    childId,
    heroId: hero.id,
    activeSkillId: hero.defaultSkillId,
    isDeployed: false,
    acquiredAt: nowIso(),
  };
  await put("heroOwnership", ownership);
  return { ok: true, child: updatedChild };
}

// 設定出戰英雄：同一孩子同時只有一位英雄出戰。
export async function deployHero(childId: string, heroId: string): Promise<void> {
  const owned = await listHeroOwnership(childId);
  for (const o of owned) {
    const shouldDeploy = o.heroId === heroId;
    if (o.isDeployed !== shouldDeploy) {
      await put("heroOwnership", { ...o, isDeployed: shouldDeploy });
    }
  }
}

// ---------- Hero ownership ----------
export async function listHeroOwnership(childId?: string): Promise<HeroOwnership[]> {
  const all = await getAll<HeroOwnership>("heroOwnership");
  return childId ? all.filter((o) => o.childId === childId) : all;
}

// 確保孩子擁有所有免費（price=0）英雄；若尚無出戰英雄，指定第一位免費英雄出戰。
// 用於新建孩子時，也可安全地對既有孩子重複呼叫（不會重複發放）。
export async function ensureStarterHeroes(childId: string): Promise<void> {
  const [heroes, owned] = await Promise.all([listHeroes(), listHeroOwnership(childId)]);
  const ownedHeroIds = new Set(owned.map((o) => o.heroId));
  const freeHeroes = heroes.filter((h) => h.price === 0);

  for (const hero of freeHeroes) {
    if (!ownedHeroIds.has(hero.id)) {
      const ownership: HeroOwnership = {
        id: uid(),
        childId,
        heroId: hero.id,
        activeSkillId: hero.defaultSkillId,
        isDeployed: false,
        acquiredAt: nowIso(),
      };
      await put("heroOwnership", ownership);
      owned.push(ownership);
    }
  }

  if (!owned.some((o) => o.isDeployed) && owned[0]) {
    await put("heroOwnership", { ...owned[0], isDeployed: true });
  }
}

export interface DeployedHero {
  ownership: HeroOwnership;
  hero: Hero;
  skill: Skill;
}

export async function getDeployedHero(childId: string): Promise<DeployedHero | null> {
  const owned = await listHeroOwnership(childId);
  const deployed = owned.find((o) => o.isDeployed) ?? owned[0];
  if (!deployed) return null;
  const [heroes, skills] = await Promise.all([listHeroes(), listSkills()]);
  const hero = heroes.find((h) => h.id === deployed.heroId);
  if (!hero) return null;
  const skill = skills.find((s) => s.id === deployed.activeSkillId) ?? skills.find((s) => s.id === hero.defaultSkillId);
  if (!skill) return null;
  return { ownership: deployed, hero, skill };
}

// ---------- Prizes ----------
export async function listPrizes(childId?: string): Promise<Prize[]> {
  const all = await getAll<Prize>("prizes");
  return childId ? all.filter((p) => p.childId === childId) : all;
}

export async function createPrize(data: Omit<Prize, "id">): Promise<Prize> {
  const prize: Prize = { ...data, id: uid() };
  await put("prizes", prize);
  return prize;
}

export async function updatePrize(id: string, patch: Partial<Prize>): Promise<Prize | undefined> {
  const existing = await getById<Prize>("prizes", id);
  if (!existing) return undefined;
  const next = { ...existing, ...patch };
  await put("prizes", next);
  return next;
}

export async function deletePrize(id: string): Promise<void> {
  await remove("prizes", id);
}

export interface RedeemPrizeResult {
  ok: boolean;
  reason?: "insufficient" | "out-of-stock";
  child?: Child;
}

// 兌換獎品：家長輸入 PIN 確認後扣點，若獎品有設定庫存則遞減。
export async function redeemPrize(childId: string, prize: Prize): Promise<RedeemPrizeResult> {
  if (prize.stock !== undefined && prize.stock <= 0) {
    return { ok: false, reason: "out-of-stock" };
  }
  const child = await getChild(childId);
  if (!child || child.pointsCache < prize.cost) {
    return { ok: false, reason: "insufficient" };
  }
  const { child: updatedChild } = await applyLedgerEntry(
    childId,
    -prize.cost,
    `兌換獎品【${prize.name}】`,
    "redeem",
    prize.id
  );
  if (prize.stock !== undefined) {
    await updatePrize(prize.id, { stock: prize.stock - 1 });
  }
  return { ok: true, child: updatedChild };
}

// ---------- Questions ----------
export async function listQuestions(): Promise<Question[]> {
  return getAll<Question>("questions");
}

export async function createQuestion(data: Omit<Question, "id">): Promise<Question> {
  const question: Question = { ...data, id: uid() };
  await put("questions", question);
  return question;
}

export async function updateQuestion(id: string, patch: Partial<Question>): Promise<Question | undefined> {
  const existing = await getById<Question>("questions", id);
  if (!existing) return undefined;
  const next = { ...existing, ...patch };
  await put("questions", next);
  return next;
}

export async function deleteQuestion(id: string): Promise<void> {
  await remove("questions", id);
}

function todayStr(): string {
  return new Date().toDateString();
}

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface QuizStatus {
  roundsUsedToday: number;
  roundsAllowed: number;
  canPlay: boolean;
}

export async function getQuizStatus(childId: string): Promise<QuizStatus> {
  const [child, settings] = await Promise.all([getChild(childId), getSettings()]);
  const roundsAllowed = settings.quizRoundsPerDay ?? 1;
  const roundsUsedToday = child?.quizDaily?.date === todayStr() ? child.quizDaily.rounds : 0;
  return { roundsUsedToday, roundsAllowed, canPlay: roundsUsedToday < roundsAllowed };
}

// 抽一回合的 5 題：依孩子年齡層與家長勾選的科目抽題，當天已抽過的題目不重複出現。
export async function startQuizRound(childId: string): Promise<Question[]> {
  const child = await getChild(childId);
  if (!child) return [];
  const usedToday = child.quizDaily?.date === todayStr() ? child.quizDaily.usedQuestionIds : [];
  const all = await listQuestions();
  const pool = all.filter(
    (q) =>
      q.active &&
      q.ageGroup === child.ageGroup &&
      (!child.quizSubjects || child.quizSubjects.length === 0 || child.quizSubjects.includes(q.subject)) &&
      !usedToday.includes(q.id)
  );
  return shuffle(pool).slice(0, 5);
}

export interface QuizResult {
  entry: PointLedgerEntry | null;
  child: Child;
  awardedPoints: number;
}

export async function submitQuizResult(
  childId: string,
  questionIds: string[],
  correctCount: number
): Promise<QuizResult> {
  const [child, settings] = await Promise.all([getChild(childId), getSettings()]);
  if (!child) throw new Error("Child not found: " + childId);

  const fullScorePoints = settings.quizFullScorePoints ?? 5;
  const perCorrectPoints = settings.quizPerCorrectPoints ?? 1;
  const fullScoreOnly = settings.quizFullScoreOnly ?? false;

  let awardedPoints = 0;
  if (correctCount === 5) {
    awardedPoints = fullScorePoints;
  } else if (!fullScoreOnly && correctCount >= 3) {
    awardedPoints = correctCount * perCorrectPoints;
  }

  const today = todayStr();
  const priorUsed = child.quizDaily?.date === today ? child.quizDaily.usedQuestionIds : [];
  const priorRounds = child.quizDaily?.date === today ? child.quizDaily.rounds : 0;
  const nextQuizDaily = {
    date: today,
    usedQuestionIds: [...priorUsed, ...questionIds],
    rounds: priorRounds + 1,
  };
  await put("children", { ...child, quizDaily: nextQuizDaily });

  if (awardedPoints > 0) {
    const { entry, child: updatedChild } = await applyLedgerEntry(
      childId,
      awardedPoints,
      `每日測驗答對 ${correctCount} 題`,
      "quiz"
    );
    return { entry, child: updatedChild, awardedPoints };
  }

  const freshChild = (await getChild(childId))!;
  return { entry: null, child: freshChild, awardedPoints: 0 };
}

export async function setChildQuizSubjects(childId: string, subjects: QuizSubject[]): Promise<void> {
  await updateChild(childId, { quizSubjects: subjects });
}

// ---------- Quiz attempts（供統計報表用：測驗答對率分科目）----------
export async function logQuizAttempt(childId: string, subject: QuizSubject, correct: boolean): Promise<void> {
  const attempt: QuizAttempt = { id: uid(), childId, subject, correct, timestamp: nowIso() };
  await put("quizAttempts", attempt);
}

export async function listQuizAttempts(childId?: string): Promise<QuizAttempt[]> {
  const all = await getAll<QuizAttempt>("quizAttempts");
  return childId ? all.filter((a) => a.childId === childId) : all;
}

// ---------- Reward coupons ----------
export async function listRewardCoupons(childId?: string): Promise<RewardCoupon[]> {
  const all = await getAll<RewardCoupon>("rewardCoupons");
  return childId ? all.filter((c) => c.childId === childId) : all;
}

export async function createRewardCoupon(data: Omit<RewardCoupon, "id" | "createdAt">): Promise<RewardCoupon> {
  const coupon: RewardCoupon = { ...data, id: uid(), createdAt: nowIso() };
  await put("rewardCoupons", coupon);
  return coupon;
}

// 兌換過的獎勵券直接刪除，不留在清單裡（一次性票券，兌現後沒有再顯示的必要）。
export async function redeemRewardCoupon(id: string): Promise<void> {
  await remove("rewardCoupons", id);
}
