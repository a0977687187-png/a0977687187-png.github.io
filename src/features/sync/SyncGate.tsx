import { useEffect, useState, type ReactNode } from "react";
import { SYNC_BUILD_ENABLED } from "../../db/firebaseConfig";
import {
  generateHouseholdCode,
  getStoredHouseholdCode,
  setStoredHouseholdCode,
  ensureFirebaseAuthReady,
} from "../../db/syncSession";

// 只有同步版（有帶 Firebase 環境變數的建置）才會顯示這個畫面；
// 給朋友的本機版完全不會執行到這裡，SYNC_BUILD_ENABLED 為 false 時直接放行。
export function SyncGate({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string | null>(() =>
    SYNC_BUILD_ENABLED ? getStoredHouseholdCode() : "local"
  );
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [joinInput, setJoinInput] = useState("");

  if (!SYNC_BUILD_ENABLED) {
    return <>{children}</>;
  }

  if (code) {
    return <AuthWait>{children}</AuthWait>;
  }

  async function handleCreate() {
    setConnecting(true);
    setError("");
    try {
      const newCode = generateHouseholdCode();
      await ensureFirebaseAuthReady();
      setStoredHouseholdCode(newCode);
      setCode(newCode);
    } catch {
      setError("連線失敗，請檢查網路後再試一次");
    } finally {
      setConnecting(false);
    }
  }

  async function handleJoin() {
    const trimmed = joinInput.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError("家庭代碼是 6 個字");
      return;
    }
    setConnecting(true);
    setError("");
    try {
      await ensureFirebaseAuthReady();
      setStoredHouseholdCode(trimmed);
      setCode(trimmed);
    } catch {
      setError("連線失敗，請檢查網路後再試一次");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="screen">
      <div className="stack card" style={{ marginTop: 40, textAlign: "center" }}>
        <div style={{ fontSize: 56 }}>🍊</div>
        <h2>跨裝置同步</h2>
        <p className="text-muted">
          第一次使用同步版，請先建立一個新家庭，或輸入另一支手機已經建立好的家庭代碼。
        </p>

        <button className="primary-btn" onClick={handleCreate} disabled={connecting}>
          {connecting ? "連線中…" : "建立新家庭"}
        </button>

        <div className="stack" style={{ marginTop: 24 }}>
          <p className="text-muted">已經有家庭代碼？在另一支手機的「設定」頁可以看到。</p>
          <input
            placeholder="輸入 6 碼家庭代碼"
            value={joinInput}
            maxLength={6}
            onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
            style={{ textAlign: "center", letterSpacing: 4, fontSize: 20 }}
          />
          <button className="secondary-btn" onClick={handleJoin} disabled={connecting}>
            {connecting ? "連線中…" : "加入這個家庭"}
          </button>
        </div>

        {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      </div>
    </div>
  );
}

// 已經有代碼，但還沒確認匿名登入完成前先顯示載入畫面，避免資料層在還沒登入時就發出請求。
function AuthWait({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ensureFirebaseAuthReady()
      .then(() => setReady(true))
      .catch(() => setError("連線失敗，請檢查網路後重新整理頁面"));
  }, []);

  if (error) {
    return (
      <div className="screen">
        <div className="stack card" style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-danger)" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="screen">
        <div className="stack card" style={{ marginTop: 40, textAlign: "center" }}>
          <div style={{ fontSize: 56 }}>🍊</div>
          <p className="text-muted">連線中…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
