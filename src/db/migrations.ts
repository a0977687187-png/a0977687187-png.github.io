import type { IDBPDatabase } from "idb";
import { CURRENT_SCHEMA_VERSION } from "./schema";
import type { Settings } from "../types";

type Migration = (db: IDBPDatabase) => Promise<void>;

// migrations[N] 負責把資料從版本 N 升級到 N+1。
// v0 -> v1：初版建立，資料結構已在 database.ts 的 upgrade() 中就緒，這裡是空升級，
// 純粹示範 migration 管線可運作（驗收條件 14）。
const migrations: Record<number, Migration> = {
  0: async () => {
    // no-op：初版資料結構已由 IndexedDB upgrade 建立完成
  },
};

const SETTINGS_KEY = "singleton";

export async function runMigrations(db: IDBPDatabase): Promise<void> {
  const existing = (await db.get("settings", SETTINGS_KEY)) as Settings | undefined;
  let version = existing?.schemaVersion ?? 0;

  while (version < CURRENT_SCHEMA_VERSION) {
    const migrate = migrations[version];
    if (migrate) {
      await migrate(db);
    }
    version += 1;
  }

  const settings: Settings = existing ?? {
    id: SETTINGS_KEY,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    parentPin: "",
    securityQuestion: null,
    soundEnabled: true,
    redemptionWeekday: null,
    setupCompleted: false,
  };
  settings.schemaVersion = CURRENT_SCHEMA_VERSION;
  await db.put("settings", settings);
}
