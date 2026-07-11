// 同步模式（Firestore）：只有在建置時帶了 Firebase 環境變數才會用到這個檔案。
// 資料存在雲端 households/{家庭代碼}/{store}/{id}，同一組代碼的裝置看到同一份資料。
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { STORE_NAMES } from "./schema";
import { getFirestoreDb, getStoredHouseholdCode, ensureFirebaseAuthReady } from "./syncSession";

function requireHouseholdCode(): string {
  const code = getStoredHouseholdCode();
  if (!code) throw new Error("尚未設定家庭代碼，無法同步");
  return code;
}

async function ready(): Promise<string> {
  await ensureFirebaseAuthReady();
  return requireHouseholdCode();
}

function storeCollection(code: string, store: string) {
  return collection(getFirestoreDb(), "households", code, store);
}

// contentPacks 的主鍵是 packId，其餘 store 都是 id。
function docIdOf(store: string, value: unknown): string {
  const v = value as Record<string, unknown>;
  const key = store === "contentPacks" ? v.packId : v.id;
  return String(key);
}

// Firestore 不接受 undefined 欄位值（會整筆寫入失敗），但 IndexedDB 可以，
// 專案裡很多地方會寫入 undefined 欄位（例如怪獸還沒被打倒時 defeatedAt: undefined）。
// 寫入前一律遞迴剝掉 undefined 欄位，讀回來時少了該欄位效果等同 undefined，語意不變。
function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) out[k] = stripUndefined(v);
    }
    return out;
  }
  return value;
}

function toDocData(value: unknown): Record<string, unknown> {
  return stripUndefined(value) as Record<string, unknown>;
}

export async function getAll<T>(store: string): Promise<T[]> {
  const code = await ready();
  const snap = await getDocs(storeCollection(code, store));
  return snap.docs.map((d) => d.data() as T);
}

export async function getById<T>(store: string, id: string): Promise<T | undefined> {
  const code = await ready();
  const snap = await getDoc(doc(storeCollection(code, store), id));
  return snap.exists() ? (snap.data() as T) : undefined;
}

export async function put<T>(store: string, value: T): Promise<void> {
  const code = await ready();
  const id = docIdOf(store, value);
  await setDoc(doc(storeCollection(code, store), id), toDocData(value));
}

export async function putMany<T>(store: string, values: T[]): Promise<void> {
  const code = await ready();
  for (let i = 0; i < values.length; i += 400) {
    const batch = writeBatch(getFirestoreDb());
    for (const value of values.slice(i, i + 400)) {
      const id = docIdOf(store, value);
      batch.set(doc(storeCollection(code, store), id), toDocData(value));
    }
    await batch.commit();
  }
}

export async function remove(store: string, id: string): Promise<void> {
  const code = await ready();
  await deleteDoc(doc(storeCollection(code, store), id));
}

async function deleteAllDocs(code: string, store: string): Promise<void> {
  const snap = await getDocs(storeCollection(code, store));
  const docs = snap.docs;
  // Firestore 單一 batch 最多 500 筆寫入，分批處理避免超過限制。
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(getFirestoreDb());
    for (const d of docs.slice(i, i + 400)) {
      batch.delete(d.ref);
    }
    await batch.commit();
  }
}

export async function clearStore(store: string): Promise<void> {
  const code = await ready();
  await deleteAllDocs(code, store);
}

export async function exportAllData(): Promise<Record<string, unknown[]>> {
  const result: Record<string, unknown[]> = {};
  for (const name of STORE_NAMES) {
    result[name] = await getAll(name);
  }
  return result;
}

export async function resetAllData(): Promise<void> {
  const code = await ready();
  for (const name of STORE_NAMES) {
    await deleteAllDocs(code, name);
  }
}

export async function importAllData(data: Record<string, unknown[]>): Promise<void> {
  const code = await ready();
  for (const name of STORE_NAMES) {
    await deleteAllDocs(code, name);
    const rows = data[name] ?? [];
    for (let i = 0; i < rows.length; i += 400) {
      const batch = writeBatch(getFirestoreDb());
      for (const row of rows.slice(i, i + 400)) {
        const id = docIdOf(name, row);
        batch.set(doc(storeCollection(code, name), id), toDocData(row));
      }
      await batch.commit();
    }
  }
}
