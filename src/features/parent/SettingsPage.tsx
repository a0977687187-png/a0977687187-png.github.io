import { useRef, useState } from "react";
import { useAppData } from "../../state/AppDataContext";
import { updateSettings, STUDY_DEFAULTS } from "../../db/repository";
import { exportAllData, importAllData, resetAllData } from "../../db/database";
import { CURRENT_SCHEMA_VERSION } from "../../db/schema";
import { SYNC_BUILD_ENABLED } from "../../db/firebaseConfig";
import { getStoredHouseholdCode, clearStoredHouseholdCode } from "../../db/syncSession";

const WEEKDAYS = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

export function SettingsPage() {
  const { settings, refreshSettings } = useAppData();
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const [studyMsg, setStudyMsg] = useState("");
  const [studyMinutes, setStudyMinutes] = useState("");
  const [studyPoints, setStudyPoints] = useState("");
  const [studyDailyLimit, setStudyDailyLimit] = useState("");
  const [studyLoaded, setStudyLoaded] = useState(false);
  const householdCode = SYNC_BUILD_ENABLED ? getStoredHouseholdCode() : null;

  if (!settings) return null;

  // 首次渲染時把目前設定帶進讀書時間表單（settings 已確定存在）
  if (!studyLoaded) {
    setStudyMinutes(String(settings.studyMinutes ?? STUDY_DEFAULTS.minutes));
    setStudyPoints(String(settings.studyPoints ?? STUDY_DEFAULTS.points));
    setStudyDailyLimit(String(settings.studyDailyLimit ?? STUDY_DEFAULTS.dailyLimit));
    setStudyLoaded(true);
  }

  async function saveStudySettings() {
    const clamp = (raw: string, fallback: number, min: number, max: number) => {
      const n = Math.round(Number(raw));
      return Number.isFinite(n) && n >= min ? Math.min(n, max) : fallback;
    };
    const minutes = clamp(studyMinutes, STUDY_DEFAULTS.minutes, 1, 180);
    const points = clamp(studyPoints, STUDY_DEFAULTS.points, 1, 100);
    const dailyLimit = clamp(studyDailyLimit, STUDY_DEFAULTS.dailyLimit, 1, 10);
    await updateSettings({ studyMinutes: minutes, studyPoints: points, studyDailyLimit: dailyLimit });
    await refreshSettings();
    setStudyMinutes(String(minutes));
    setStudyPoints(String(points));
    setStudyDailyLimit(String(dailyLimit));
    setStudyMsg("讀書時間設定已儲存");
  }

  async function copyHouseholdCode() {
    if (!householdCode) return;
    try {
      await navigator.clipboard.writeText(householdCode);
      setCopyMsg("已複製！貼給另一支手機輸入即可同步");
    } catch {
      setCopyMsg("複製失敗，請手動記下代碼");
    }
  }

  function handleResyncClick() {
    if (!confirm("確定要重新設定同步嗎？這支手機會暫時看不到資料，直到重新輸入家庭代碼。")) return;
    clearStoredHouseholdCode();
    window.location.reload();
  }

  async function savePin() {
    if (!/^\d{4}$/.test(newPin)) {
      setPinMsg("請輸入 4 位數字");
      return;
    }
    await updateSettings({ parentPin: newPin });
    await refreshSettings();
    setPinMsg("PIN 已更新");
    setNewPin("");
  }

  async function toggleSound() {
    if (!settings) return;
    await updateSettings({ soundEnabled: !settings.soundEnabled });
    await refreshSettings();
  }

  async function setWeekday(day: number) {
    await updateSettings({ redemptionWeekday: day });
    await refreshSettings();
  }

  async function handleExport() {
    const data = await exportAllData();
    const payload = { schemaVersion: CURRENT_SCHEMA_VERSION, exportedAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yuzu-quest-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.data) throw new Error("格式錯誤：缺少 data 欄位");
      await importAllData(parsed.data);
      await refreshSettings();
      setImportMsg("匯入成功！");
    } catch (err) {
      setImportMsg("匯入失敗：" + (err as Error).message);
    }
  }

  async function handleReset() {
    if (!confirm("確定要重置所有資料嗎？這會刪除所有孩子、任務、怪獸、已買的英雄與紀錄，無法復原！")) return;
    if (!confirm("再次確認：真的要清空全部資料，重新開始設定嗎？")) return;
    await resetAllData();
    window.location.reload();
  }

  return (
    <div className="stack">
      {householdCode && (
        <div className="card stack">
          <h3>🔗 跨裝置同步</h3>
          <p className="text-muted">
            這支手機的家庭代碼，另一支手機的「設定」頁輸入同樣的代碼即可看到一樣的資料。
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4, textAlign: "center" }}>
            {householdCode}
          </p>
          <button className="secondary-btn" onClick={copyHouseholdCode}>
            複製家庭代碼
          </button>
          {copyMsg && <p className="text-muted">{copyMsg}</p>}
          <button className="secondary-btn" onClick={handleResyncClick}>
            重新設定同步
          </button>
        </div>
      )}

      <div className="card stack">
        <h3>家長 PIN</h3>
        <input
          inputMode="numeric"
          maxLength={4}
          placeholder="新的 4 位數 PIN"
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
        />
        <button className="primary-btn" onClick={savePin}>
          更新 PIN
        </button>
        {pinMsg && <p className="text-muted">{pinMsg}</p>}
      </div>

      <div className="card stack">
        <h3>📚 讀書時間計時</h3>
        <p className="text-muted">孩子在首頁點「讀書時間」開始計時，達成目標就自動獲得點數。</p>
        <label className="text-muted" style={{ fontSize: 14 }}>
          一次要讀幾分鐘（1~180）
          <input
            inputMode="numeric"
            value={studyMinutes}
            onChange={(e) => setStudyMinutes(e.target.value.replace(/\D/g, ""))}
          />
        </label>
        <label className="text-muted" style={{ fontSize: 14 }}>
          達成獎勵點數（1~100）
          <input
            inputMode="numeric"
            value={studyPoints}
            onChange={(e) => setStudyPoints(e.target.value.replace(/\D/g, ""))}
          />
        </label>
        <label className="text-muted" style={{ fontSize: 14 }}>
          每天最多次數（1~10）
          <input
            inputMode="numeric"
            value={studyDailyLimit}
            onChange={(e) => setStudyDailyLimit(e.target.value.replace(/\D/g, ""))}
          />
        </label>
        <button className="primary-btn" onClick={saveStudySettings}>
          儲存讀書時間設定
        </button>
        {studyMsg && <p className="text-muted">{studyMsg}</p>}
      </div>

      <div className="card stack">
        <h3>每週固定兌獎日</h3>
        <div className="row" style={{ flexWrap: "wrap" }}>
          {WEEKDAYS.map((label, day) => (
            <button
              key={day}
              className="secondary-btn"
              style={{
                background: settings.redemptionWeekday === day ? "var(--color-primary)" : "white",
                color: settings.redemptionWeekday === day ? "white" : "var(--color-text)",
              }}
              onClick={() => setWeekday(day)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card row">
        <h3 style={{ flex: 1 }}>音效</h3>
        <button className="secondary-btn" onClick={toggleSound}>
          {settings.soundEnabled ? "🔊 開啟中" : "🔇 已靜音"}
        </button>
      </div>

      <div className="card stack">
        <h3>備份與還原</h3>
        <button className="secondary-btn" onClick={handleExport}>
          匯出 JSON 備份
        </button>
        <button className="secondary-btn" onClick={() => fileInputRef.current?.click()}>
          匯入 JSON 備份
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = "";
          }}
        />
        {importMsg && <p className="text-muted">{importMsg}</p>}
      </div>

      <div className="card stack" style={{ border: "2px solid var(--color-danger)" }}>
        <h3 style={{ color: "var(--color-danger)" }}>⚠️ 危險區域</h3>
        <p className="text-muted">
          清空所有資料（孩子、任務、怪獸、已購買的英雄、點數紀錄...）並回到初始設定精靈。這個操作無法復原，通常只在測試時使用。
        </p>
        <button className="danger-btn" onClick={handleReset}>
          重置所有資料
        </button>
      </div>
    </div>
  );
}
