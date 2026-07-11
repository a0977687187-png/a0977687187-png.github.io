// 本機模式（IndexedDB）：沒有設定 Firebase 環境變數時使用（例如給朋友的版本）。
// 資料完全留在這台裝置上，不會對外連線。
import { openDB, type IDBPDatabase } from "idb";
import { DB_NAME, STORE_NAMES } from "./schema";
import { runMigrations } from "./migrations";

let dbPromise: Promise<IDBPDatabase> | null = null;

// IndexedDB 版本：新增 object store 一定要提高這個數字，IndexedDB 才會觸發 upgrade()
// 幫既有使用者的資料庫補建新 store（純資料欄位變動則交給 settings.schemaVersion +
// runMigrations 處理即可，不需要動這個版本號）。
// v1：初版所有 store。v2：新增 quizAttempts（測驗分科目正確率統計用）。
const IDB_VERSION = 2;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, IDB_VERSION, {
      upgrade(db) {
        for (const name of STORE_NAMES) {
          if (!db.objectStoreNames.contains(name)) {
            const keyPath = name === "contentPacks" ? "packId" : "id";
            db.createObjectStore(name, { keyPath });
          }
        }
      },
    }).then(async (db) => {
      await runMigrations(db);
      return db;
    });
  }
  return dbPromise;
}

export async function getAll<T>(store: string): Promise<T[]> {
  const db = await getDb();
  return db.getAll(store);
}

export async function getById<T>(store: string, id: string): Promise<T | undefined> {
  const db = await getDb();
  return db.get(store, id);
}

export async function put<T>(store: string, value: T): Promise<void> {
  const db = await getDb();
  await db.put(store, value);
}

export async function putMany<T>(store: string, values: T[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(store, "readwrite");
  await Promise.all(values.map((value) => tx.objectStore(store).put(value)));
  await tx.done;
}

export async function remove(store: string, id: string): Promise<void> {
  const db = await getDb();
  await db.delete(store, id);
}

export async function clearStore(store: string): Promise<void> {
  const db = await getDb();
  await db.clear(store);
}

export async function exportAllData(): Promise<Record<string, unknown[]>> {
  const db = await getDb();
  const result: Record<string, unknown[]> = {};
  for (const name of db.objectStoreNames) {
    result[name] = await db.getAll(name);
  }
  return result;
}

// 清空所有資料（含孩子、任務、怪獸、英雄擁有紀錄、流水帳...等），用於家長模式的
// 「重置所有資料」危險操作。清空後 App 會依 migrations.ts 建立全新的預設 settings，
// 下次啟動會重新跑一次初始設定精靈。
export async function resetAllData(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(Array.from(db.objectStoreNames), "readwrite");
  await Promise.all(Array.from(db.objectStoreNames).map((name) => tx.objectStore(name).clear()));
  await tx.done;
}

export async function importAllData(data: Record<string, unknown[]>): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(Array.from(db.objectStoreNames), "readwrite");
  await Promise.all(
    Array.from(db.objectStoreNames).map(async (name) => {
      await tx.objectStore(name).clear();
      const rows = data[name] ?? [];
      for (const row of rows) {
        await tx.objectStore(name).put(row);
      }
    })
  );
  await tx.done;
}
