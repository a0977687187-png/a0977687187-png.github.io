import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { PinPad } from "../../components/PinPad";
import { useParentAuth } from "../../state/ParentAuthContext";

export function PinGate() {
  const { isUnlocked, tryUnlock, attemptsLeft, lockedUntil } = useParentAuth();
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [, setTick] = useState(0);
  const navigate = useNavigate();

  const isLocked = !!lockedUntil && Date.now() < lockedUntil;

  // 鎖定期間每秒重新渲染，讓倒數秒數會動、時間到自動恢復輸入。
  useEffect(() => {
    if (!isLocked) return;
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isLocked]);

  useEffect(() => {
    if (!isLocked) setError("");
  }, [isLocked]);

  if (isUnlocked) {
    return <Outlet />;
  }

  function handleComplete(value: string) {
    const ok = tryUnlock(value);
    if (!ok) {
      const remaining = attemptsLeft - 1;
      setError(remaining > 0 ? `PIN 不正確，還可以再試 ${remaining} 次` : "");
      setPinInput("");
    }
  }

  const lockRemaining = isLocked ? Math.max(1, Math.ceil((lockedUntil! - Date.now()) / 1000)) : 0;

  return (
    <div className="screen">
      <div className="stack card" style={{ marginTop: 40, textAlign: "center" }}>
        <h2>🔒 家長模式</h2>
        <p className="text-muted">請輸入 4 位數 PIN 碼</p>
        {isLocked ? (
          <p style={{ color: "var(--color-danger)" }}>PIN 錯誤次數過多，請 {lockRemaining} 秒後再試</p>
        ) : (
          <>
            <PinPad value={pinInput} onChange={setPinInput} onComplete={handleComplete} />
            {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
          </>
        )}
        <button className="link-btn" onClick={() => navigate("/")}>
          返回孩子模式
        </button>
      </div>
    </div>
  );
}
