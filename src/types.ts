export type AgeGroup = "幼稚園" | "小一小二" | "小三小四" | "小五小六";

export type TaskType = "改掉壞習慣" | "培養好習慣" | "學習愛好" | "家事協助";
export type ReinforceMode = "連續" | "間歇";

export type QuizSubject = "國語" | "英語" | "數學" | "安全宣導" | "禮貌品格";

export interface Child {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  avatar: string; // emoji or base64
  pointsCache: number; // cached total, derived from pointLedger
  redemptionWeekday?: number; // 0-6, 週日=0；固定兌獎日
  quizSubjects?: QuizSubject[]; // 家長勾選要出的科目，undefined = 全部
  quizDaily?: { date: string; usedQuestionIds: string[]; rounds: number }; // 當日去重與回合數
  createdAt: string;
}

export interface Task {
  id: string;
  childId: string;
  title: string;
  type: TaskType;
  points: number;
  reinforceMode: ReinforceMode;
  intermittentRate: number; // 0~1，間歇模式下給點機率，預設 0.6
  dailyLimit: number;
  active: boolean;
  createdAt: string;
}

export interface DeductionRule {
  id: string;
  childId: string;
  title: string; // 如「對長輩大聲頂嘴」
  points: number; // 正數，扣點時取負
  active: boolean;
  createdAt: string;
}

export type LedgerRefType = "task" | "attack" | "quiz" | "purchase" | "redeem" | "adjust" | "deduction";

export interface PointLedgerEntry {
  id: string;
  childId: string;
  delta: number;
  reason: string;
  refType: LedgerRefType;
  refId?: string;
  timestamp: string;
}

export interface Monster {
  id: string;
  childId: string;
  name: string;
  avatar: string; // 內建怪獸 id 或上傳圖片 base64
  maxHp: number;
  costPerAttack: number;
  reward: string;
  status: "排隊中" | "挑戰中" | "已擊倒";
  currentHp: number;
  defeatedAt?: string;
  createdAt: string;
}

export interface Hero {
  id: string;
  name: string;
  avatar: string;
  price: number;
  skillIds: string[];
  defaultSkillId: string;
  packId: string;
  active?: boolean; // 家長可下架，undefined 視為上架中
}

export interface Skill {
  id: string;
  name: string;
  effectColor: string;
  animationType: "slash" | "punch" | "beam" | "spin" | "magic" | "throw";
  particleShape: "star" | "heart" | "bubble" | "bolt" | "flame" | "leaf" | "note" | "boom";
  unlockCost: number;
  packId: string;
  burstText?: string; // 命中時彈出的爆擊字（如 "SHRED!"、"BOOM!"），不填則不顯示
}

export interface HeroOwnership {
  id: string;
  childId: string;
  heroId: string;
  activeSkillId: string;
  isDeployed: boolean;
  acquiredAt: string;
}

export interface SkillUnlock {
  id: string;
  childId: string;
  skillId: string;
  unlockedAt: string;
}

export interface Prize {
  id: string;
  childId: string;
  name: string;
  cost: number;
  stock?: number;
  active: boolean;
  immediateRedeem?: boolean; // true = 不受每週固定兌獎日限制，隨時可兌換
}

export interface Question {
  id: string;
  ageGroup: AgeGroup;
  subject: QuizSubject;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  active: boolean;
}

export interface RewardCoupon {
  id: string;
  childId: string;
  monsterId: string;
  monsterName: string;
  reward: string;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  childId: string;
  subject: QuizSubject;
  correct: boolean;
  timestamp: string;
}

export interface ContentPack {
  packId: string;
  name: string;
  version: string;
  installedAt: string;
  active: boolean;
}

export interface SecurityQuestion {
  question: string;
  answer: string;
}

export interface Settings {
  id: "singleton";
  schemaVersion: number;
  parentPin: string;
  securityQuestion: SecurityQuestion | null;
  soundEnabled: boolean;
  redemptionWeekday: number | null; // 全域預設兌獎日（0=週日）
  setupCompleted: boolean;
  quizRoundsPerDay?: number; // 每天可作答回合數 1~3，預設 1
  quizFullScorePoints?: number; // 5 題全對的獎勵點數，預設 5
  quizPerCorrectPoints?: number; // 答對 3~4 題時每題點數，預設 1
  quizFullScoreOnly?: boolean; // true = 全對才給點，預設 false
}
