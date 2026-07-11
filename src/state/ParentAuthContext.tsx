import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAppData } from "./AppDataContext";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

interface ParentAuthContextValue {
  isUnlocked: boolean;
  attemptsLeft: number;
  lockedUntil: number | null;
  tryUnlock: (pin: string) => boolean;
  /** 只驗證 PIN 是否正確（計入錯誤次數），不解鎖家長模式——供孩子端兌換等單次確認使用 */
  verifyPin: (pin: string) => boolean;
  lock: () => void;
}

const ParentAuthContext = createContext<ParentAuthContextValue | null>(null);

export function ParentAuthProvider({ children }: { children: ReactNode }) {
  const { settings } = useAppData();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const attempt = useCallback(
    (pin: string, unlock: boolean): boolean => {
      if (lockedUntil && Date.now() < lockedUntil) return false;
      if (lockedUntil && Date.now() >= lockedUntil) {
        setLockedUntil(null);
        setFailCount(0);
      }
      if (settings?.parentPin && pin === settings.parentPin) {
        if (unlock) setIsUnlocked(true);
        setFailCount(0);
        return true;
      }
      const next = failCount + 1;
      setFailCount(next);
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
      }
      return false;
    },
    [settings, failCount, lockedUntil]
  );

  const tryUnlock = useCallback((pin: string) => attempt(pin, true), [attempt]);
  const verifyPin = useCallback((pin: string) => attempt(pin, false), [attempt]);

  const lock = useCallback(() => setIsUnlocked(false), []);

  const value = useMemo<ParentAuthContextValue>(
    () => ({
      isUnlocked,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - failCount),
      lockedUntil,
      tryUnlock,
      verifyPin,
      lock,
    }),
    [isUnlocked, failCount, lockedUntil, tryUnlock, verifyPin, lock]
  );

  return <ParentAuthContext.Provider value={value}>{children}</ParentAuthContext.Provider>;
}

export function useParentAuth(): ParentAuthContextValue {
  const ctx = useContext(ParentAuthContext);
  if (!ctx) throw new Error("useParentAuth must be used within ParentAuthProvider");
  return ctx;
}
