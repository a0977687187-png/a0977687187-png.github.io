import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../state/AppDataContext";
import { getStudyStatus, completeStudySession, type StudyStatus } from "../../db/repository";
import { Fireworks } from "../../components/VictoryCelebration";
import { playVictorySound } from "../../content/sound";

// 計時狀態存 localStorage（記「開始的時間點」而不是倒數秒數），
// 所以中途鎖屏、切去別的 App、甚至關掉重開，回來都會用真實時間繼續算，不會歸零。
const STORAGE_PREFIX = "yuzu-study-session-";

interface StoredSession {
  startedAt: number; // Date.now()
  targetMinutes: number;
}

function loadSession(childId: string): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + childId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed.startedAt || !parsed.targetMinutes) return null;
    return parsed;
  } catch {
    return null;
  }
}

const PRAISES = [
  "你靠自己的力量專心讀完了，這就是自律的超能力！",
  "說到做到、坐得住！你比昨天的自己更厲害了！",
  "專注的你散發著光芒，連英雄們都為你鼓掌！",
  "堅持到最後一秒，你是自己的小隊長！",
  "了不起！能管好自己時間的人，未來什麼都做得到！",
];

type Stage = "loading" | "idle" | "running" | "celebrating" | "limit";

export function StudyTimer() {
  const { selectedChild, settings, refreshChildren } = useAppData();
  const navigate = useNavigate();
  const [status, setStatus] = useState<StudyStatus | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [session, setSession] = useState<StoredSession | null>(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const [awardedPoints, setAwardedPoints] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const praise = useMemo(() => PRAISES[Math.floor(Math.random() * PRAISES.length)], []);

  const soundEnabled = settings?.soundEnabled ?? true;
  // 用 id（字串）當依賴而不是整個物件：達成後 refreshChildren() 會換掉物件參照，
  // 若依賴物件會讓載入邏輯重跑、把慶祝畫面蓋回每日上限畫面。
  const childId = selectedChild?.id ?? null;

  useEffect(() => {
    // cancelled 旗標：載入若被重跑（React 嚴格模式）或孩子切換，舊的那次不得再改狀態。
    let cancelled = false;
    (async () => {
      if (!childId) return;
      const s = await getStudyStatus(childId);
      if (cancelled) return;
      setStatus(s);
      const existing = loadSession(childId);
      if (existing) {
        setSession(existing);
        setStage("running");
      } else {
        setStage(s.canStudy ? "idle" : "limit");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [childId]);

  // 每 0.5 秒重新渲染讓倒數會動；用時間戳計算，切到背景回來也正確。
  useEffect(() => {
    if (stage !== "running") return;
    const timer = setInterval(() => setNowTick(Date.now()), 500);
    return () => clearInterval(timer);
  }, [stage]);

  const remainingSeconds = useMemo(() => {
    if (!session) return 0;
    const elapsed = Math.floor((nowTick - session.startedAt) / 1000);
    return Math.max(0, session.targetMinutes * 60 - elapsed);
  }, [session, nowTick]);

  // 倒數歸零 → 結算給點 → 進慶祝畫面
  useEffect(() => {
    if (stage !== "running" || !session || !selectedChild || finishing) return;
    if (remainingSeconds > 0) return;
    setFinishing(true);
    (async () => {
      const result = await completeStudySession(selectedChild.id, session.targetMinutes);
      localStorage.removeItem(STORAGE_PREFIX + selectedChild.id);
      setSession(null);
      setAwardedPoints(result.awardedPoints);
      setStage("celebrating");
      if (soundEnabled) playVictorySound();
      refreshChildren();
      setFinishing(false);
    })();
  }, [stage, session, selectedChild, remainingSeconds, finishing, soundEnabled, refreshChildren]);

  if (!selectedChild) {
    return (
      <div className="screen" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <p className="text-muted">尚未建立孩子資料。</p>
        <button className="secondary-btn" onClick={() => navigate("/")}>
          返回首頁
        </button>
      </div>
    );
  }

  function startSession() {
    if (!status || !selectedChild) return;
    const s: StoredSession = { startedAt: Date.now(), targetMinutes: status.minutes };
    localStorage.setItem(STORAGE_PREFIX + selectedChild.id, JSON.stringify(s));
    setSession(s);
    setNowTick(Date.now());
    setStage("running");
  }

  function giveUp() {
    if (!selectedChild) return;
    if (!confirm("要放棄這次讀書計時嗎？時間不會保留喔。")) return;
    localStorage.removeItem(STORAGE_PREFIX + selectedChild.id);
    setSession(null);
    setStage(status?.canStudy ? "idle" : "limit");
  }

  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const ss = String(remainingSeconds % 60).padStart(2, "0");
  const progress = session ? 1 - remainingSeconds / (session.targetMinutes * 60) : 0;

  return (
    <div className="screen">
      <div className="row">
        <button className="link-btn" onClick={() => navigate("/")}>
          ← 返回
        </button>
      </div>

      {stage === "loading" && <p className="text-muted" style={{ textAlign: "center" }}>載入中…</p>}

      {stage === "idle" && status && (
        <div className="card stack" style={{ textAlign: "center", alignItems: "center" }}>
          <div style={{ fontSize: 64 }}>📚</div>
          <h2>讀書時間</h2>
          <p className="text-muted">
            專心讀書 {status.minutes} 分鐘，就能獲得 ⭐{status.points} 點！
            <br />
            今天已完成 {status.completedToday} / {status.dailyLimit} 次
          </p>
          <button className="primary-btn" style={{ fontSize: 22 }} onClick={startSession}>
            開始讀書！
          </button>
          <p className="text-muted" style={{ fontSize: 13 }}>
            按下開始後就去讀書吧，時間到了回來看驚喜！
            <br />
            中間鎖螢幕或關掉畫面都沒關係，時間會繼續算。
          </p>
        </div>
      )}

      {stage === "running" && session && (
        <div className="card stack" style={{ textAlign: "center", alignItems: "center" }}>
          <div style={{ fontSize: 48 }}>📖</div>
          <h3>專心讀書中…</h3>
          <div className="study-countdown">{mm}:{ss}</div>
          <div className="hp-bar-track" style={{ maxWidth: 280 }}>
            <div
              className="hp-bar-fill"
              style={{ width: `${Math.round(progress * 100)}%`, background: "var(--color-success)" }}
            />
          </div>
          <p className="text-muted">目標 {session.targetMinutes} 分鐘，加油！</p>
          <button className="link-btn" style={{ color: "var(--color-danger)" }} onClick={giveUp}>
            放棄這次計時
          </button>
        </div>
      )}

      {stage === "limit" && status && (
        <div className="card stack" style={{ textAlign: "center", alignItems: "center" }}>
          <div style={{ fontSize: 64 }}>🌙</div>
          <h3>今天的讀書計時完成囉！</h3>
          <p className="text-muted">
            今天已完成 {status.completedToday} / {status.dailyLimit} 次，明天再來挑戰吧！
          </p>
          <button className="secondary-btn" onClick={() => navigate("/")}>
            返回首頁
          </button>
        </div>
      )}

      {stage === "celebrating" && (
        <div className="celebration-overlay victory-overlay">
          <Fireworks />
          <div className="celebration-title">🎉 讀書時間達成！</div>
          <div style={{ fontSize: 80, margin: "12px 0" }}>📚✨</div>
          {awardedPoints > 0 ? (
            <div className="reward-card">獲得 ⭐{awardedPoints} 點！</div>
          ) : (
            <div className="reward-card">今天次數已滿，但你的努力大家都看見了！</div>
          )}
          <div className="celebration-quote" style={{ color: "#ffe9b8", maxWidth: 300 }}>
            {praise}
          </div>
          <div className="row" style={{ marginTop: 20, gap: 12 }}>
            <button
              className="secondary-btn"
              onClick={async () => {
                const s = await getStudyStatus(selectedChild.id);
                setStatus(s);
                setStage(s.canStudy ? "idle" : "limit");
              }}
            >
              再讀一輪
            </button>
            <button className="primary-btn" onClick={() => navigate("/")}>
              回首頁
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
