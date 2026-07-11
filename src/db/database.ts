// 資料層總開關：依照是否設定 Firebase 環境變數，自動選擇「本機版」或「同步版」，
// repository.ts 與所有功能頁面都只呼叫這裡的通用函式，完全不用管背後是哪個後端。
import { SYNC_BUILD_ENABLED } from "./firebaseConfig";
import { getStoredHouseholdCode } from "./syncSession";
import * as localBackend from "./localBackend";
import * as firestoreBackend from "./firestoreBackend";

function isSyncMode(): boolean {
  return SYNC_BUILD_ENABLED && getStoredHouseholdCode() !== null;
}

export async function getAll<T>(store: string): Promise<T[]> {
  return isSyncMode() ? firestoreBackend.getAll<T>(store) : localBackend.getAll<T>(store);
}

export async function getById<T>(store: string, id: string): Promise<T | undefined> {
  return isSyncMode() ? firestoreBackend.getById<T>(store, id) : localBackend.getById<T>(store, id);
}

export async function put<T>(store: string, value: T): Promise<void> {
  return isSyncMode() ? firestoreBackend.put<T>(store, value) : localBackend.put<T>(store, value);
}

// 一次寫入多筆（例如題庫種子資料上千筆）。同步版會分批送出，不會逐筆等待來回，
// 避免第一次建立家庭時要等好幾分鐘。
export async function putMany<T>(store: string, values: T[]): Promise<void> {
  return isSyncMode() ? firestoreBackend.putMany<T>(store, values) : localBackend.putMany<T>(store, values);
}

export async function remove(store: string, id: string): Promise<void> {
  return isSyncMode() ? firestoreBackend.remove(store, id) : localBackend.remove(store, id);
}

export async function clearStore(store: string): Promise<void> {
  return isSyncMode() ? firestoreBackend.clearStore(store) : localBackend.clearStore(store);
}

export async function exportAllData(): Promise<Record<string, unknown[]>> {
  return isSyncMode() ? firestoreBackend.exportAllData() : localBackend.exportAllData();
}

// 清空所有資料（含孩子、任務、怪獸、英雄擁有紀錄、流水帳...等），用於家長模式的
// 「重置所有資料」危險操作。清空後 App 會依 migrations.ts 建立全新的預設 settings，
// 下次啟動會重新跑一次初始設定精靈。
export async function resetAllData(): Promise<void> {
  return isSyncMode() ? firestoreBackend.resetAllData() : localBackend.resetAllData();
}

export async function importAllData(data: Record<string, unknown[]>): Promise<void> {
  return isSyncMode() ? firestoreBackend.importAllData(data) : localBackend.importAllData(data);
}
