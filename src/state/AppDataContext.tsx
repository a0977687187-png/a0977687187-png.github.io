import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Child, Settings } from "../types";
import { listChildren, getSettings, ensureSettingsExist } from "../db/repository";
import { ensureCoreContentSeeded } from "../content/seed";

export interface CelebrationPayload {
  childId: string;
  title: string; // 行為名稱
  points: number; // 0 表示間歇未給點的社會性讚美
  encouragement: string;
}

interface AppDataContextValue {
  children: Child[];
  settings: Settings | null;
  selectedChildId: string | null;
  selectedChild: Child | null;
  loading: boolean;
  setSelectedChildId: (id: string) => void;
  refreshChildren: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  celebration: CelebrationPayload | null;
  pushCelebration: (payload: CelebrationPayload) => void;
  clearCelebration: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

const SELECTED_CHILD_KEY = "yuzu-selected-child-id";

export function AppDataProvider({ children: reactChildren }: { children: ReactNode }) {
  const [childList, setChildList] = useState<Child[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedChildId, setSelectedChildIdState] = useState<string | null>(
    () => localStorage.getItem(SELECTED_CHILD_KEY)
  );
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState<CelebrationPayload | null>(null);

  const refreshChildren = useCallback(async () => {
    const list = await listChildren();
    setChildList(list);
  }, []);

  const refreshSettings = useCallback(async () => {
    const s = await getSettings();
    setSettings(s);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await ensureSettingsExist();
        await ensureCoreContentSeeded();
      } catch (err) {
        console.error("內容包種子資料初始化失敗", err);
      }
      await Promise.all([refreshChildren(), refreshSettings()]);
      setLoading(false);
    })();
  }, [refreshChildren, refreshSettings]);

  const setSelectedChildId = useCallback((id: string) => {
    setSelectedChildIdState(id);
    localStorage.setItem(SELECTED_CHILD_KEY, id);
  }, []);

  useEffect(() => {
    if (!selectedChildId && childList.length > 0) {
      setSelectedChildId(childList[0].id);
    }
  }, [childList, selectedChildId, setSelectedChildId]);

  const selectedChild = useMemo(
    () => childList.find((c) => c.id === selectedChildId) ?? null,
    [childList, selectedChildId]
  );

  const pushCelebration = useCallback((payload: CelebrationPayload) => {
    setCelebration(payload);
  }, []);
  const clearCelebration = useCallback(() => setCelebration(null), []);

  const value: AppDataContextValue = {
    children: childList,
    settings,
    selectedChildId,
    selectedChild,
    loading,
    setSelectedChildId,
    refreshChildren,
    refreshSettings,
    celebration,
    pushCelebration,
    clearCelebration,
  };

  return <AppDataContext.Provider value={value}>{reactChildren}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
