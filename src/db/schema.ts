export const DB_NAME = "yuzu-quest-db";
export const CURRENT_SCHEMA_VERSION = 1;

export const STORE_NAMES = [
  "children",
  "tasks",
  "deductionRules",
  "monsters",
  "heroes",
  "skills",
  "heroOwnership",
  "skillUnlocks",
  "prizes",
  "questions",
  "pointLedger",
  "rewardCoupons",
  "contentPacks",
  "settings",
  "quizAttempts",
] as const;

export type StoreName = (typeof STORE_NAMES)[number];
