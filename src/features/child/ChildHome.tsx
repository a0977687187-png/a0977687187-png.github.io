import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../state/AppDataContext";
import { listMonsters, listLedger } from "../../db/repository";
import type { Monster } from "../../types";
import { ChildAvatar } from "../../components/ChildAvatar";
import { PointsDisplay } from "../../components/PointsDisplay";
import { BigButton } from "../../components/BigButton";
import { MonsterRig } from "../../components/MonsterRig";
import { DialogueBubble } from "../../components/DialogueBubble";
import { PointsCelebration } from "./PointsCelebration";

function daysUntilWeekday(target: number): number {
  const now = new Date();
  const current = now.getDay();
  let diff = target - current;
  if (diff < 0) diff += 7;
  return diff;
}

export function ChildHome() {
  const { children, selectedChild, setSelectedChildId, settings } = useAppData();
  const navigate = useNavigate();
  const [monster, setMonster] = useState<Monster | null>(null);
  const [todayPoints, setTodayPoints] = useState(0);

  useEffect(() => {
    (async () => {
      if (!selectedChild) return;
      const monsters = await listMonsters(selectedChild.id);
      setMonster(monsters.find((m) => m.status === "挑戰中") ?? null);

      const ledger = await listLedger(selectedChild.id);
      const todayStr = new Date().toDateString();
      const total = ledger
        .filter((e) => new Date(e.timestamp).toDateString() === todayStr && e.delta > 0)
        .reduce((sum, e) => sum + e.delta, 0);
      setTodayPoints(total);
    })();
  }, [selectedChild]);

  if (!selectedChild) {
    return (
        <div className="screen">
          <p className="text-muted">尚未建立孩子資料，請進入家長模式完成初始設定。</p>
        </div>
    );
  }

  const redemptionWeekday = selectedChild.redemptionWeekday ?? settings?.redemptionWeekday ?? null;
  const countdown = redemptionWeekday !== null ? daysUntilWeekday(redemptionWeekday) : null;
  const hpPercent = monster ? Math.round((monster.currentHp / monster.maxHp) * 100) : 0;

  return (
    <div className="app-shell">
      <div className="top-bar">
        {children.length > 1 ? (
          <select
            value={selectedChild.id}
            onChange={(e) => setSelectedChildId(e.target.value)}
            style={{ width: "auto" }}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <span />
        )}
        <span className="spacer" />
        <button className="gear-btn" onClick={() => navigate("/parent")} aria-label="家長模式">
          ⚙️
        </button>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        <div className="row">
          <ChildAvatar avatar={selectedChild.avatar} size={64} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{selectedChild.name}</div>
            <PointsDisplay points={selectedChild.pointsCache} />
          </div>
        </div>

        <div className="card stack" style={{ alignItems: "center", textAlign: "center" }}>
          {monster ? (
            <>
              <DialogueBubble monsterId={monster.avatar} />
              <MonsterRig monsterId={monster.avatar} size={96} />
              <h3>{monster.name}</h3>
              <div className="hp-bar-track" style={{ maxWidth: 260 }}>
                <div className="hp-bar-fill" style={{ width: `${hpPercent}%` }} />
              </div>
              <p className="text-muted">
                {monster.currentHp} / {monster.maxHp}
              </p>
              <button className="primary-btn" onClick={() => navigate("/child/battle")}>
                去戰鬥！
              </button>
            </>
          ) : (
            <p className="text-muted">目前沒有挑戰中的怪獸，請家長到「怪獸管理」新增。</p>
          )}
        </div>

        <div className="big-button-grid">
          <BigButton icon="⚔️" label="打怪獸" onClick={() => navigate("/child/battle")} />
          <BigButton icon="📝" label="每日測驗" onClick={() => navigate("/child/quiz")} />
          <BigButton icon="🦸" label="英雄商店" onClick={() => navigate("/child/heroes")} />
          <BigButton icon="🎁" label="獎品兌換" onClick={() => navigate("/child/prizes")} />
        </div>
      </div>

      <div className="bottom-info-bar">
        <span>今日獲得 🪙{todayPoints}</span>
        {countdown !== null && <span>{countdown === 0 ? "🎉 今天是兌獎日" : `兌獎倒數 ${countdown} 天`}</span>}
        <button className="link-btn" onClick={() => navigate("/child/tasks")}>
          我的任務
        </button>
        <button className="link-btn" onClick={() => navigate("/child/records")}>
          我的紀錄
        </button>
      </div>

      <PointsCelebration />
    </div>
  );
}
