import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../state/AppDataContext";
import { listLedger, listMonsters } from "../../db/repository";
import type { PointLedgerEntry, Monster } from "../../types";
import { MonsterRig } from "../../components/MonsterRig";

export function MyRecords() {
  const { selectedChild } = useAppData();
  const navigate = useNavigate();
  const [ledger, setLedger] = useState<PointLedgerEntry[]>([]);
  const [defeated, setDefeated] = useState<Monster[]>([]);

  useEffect(() => {
    (async () => {
      if (!selectedChild) return;
      const [l, monsters] = await Promise.all([listLedger(selectedChild.id), listMonsters(selectedChild.id)]);
      setLedger(l.slice(0, 30));
      setDefeated(
        monsters
          .filter((m) => m.status === "已擊倒")
          .sort((a, b) => (b.defeatedAt ?? "").localeCompare(a.defeatedAt ?? ""))
      );
    })();
  }, [selectedChild]);

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

  return (
    <div className="screen">
      <div className="row">
        <button className="link-btn" onClick={() => navigate("/")}>
          ← 返回
        </button>
      </div>
      <h2>📖 我的紀錄</h2>

      <h3>怪獸圖鑑</h3>
      {defeated.length === 0 && <p className="text-muted">還沒有擊倒任何怪獸，快去打怪獸吧！</p>}
      <div className="hero-grid">
        {defeated.map((m) => (
          <div key={m.id} className="hero-card">
            <MonsterRig monsterId={m.avatar} size={64} />
            <span className="hero-name">{m.name}</span>
            <span className="text-muted" style={{ fontSize: 12 }}>
              {m.defeatedAt ? new Date(m.defeatedAt).toLocaleDateString() : ""}
            </span>
          </div>
        ))}
      </div>

      <h3>點數紀錄</h3>
      <div className="stack">
        {ledger.map((entry) => (
          <div key={entry.id} className="task-card" style={{ cursor: "default" }}>
            <div style={{ flex: 1 }}>
              <div>{entry.reason}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                {new Date(entry.timestamp).toLocaleString("zh-TW")}
              </div>
            </div>
            <span className="badge" style={{ background: entry.delta >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
              {entry.delta >= 0 ? "+" : ""}
              {entry.delta} 點
            </span>
          </div>
        ))}
        {ledger.length === 0 && <p className="text-muted">還沒有任何點數紀錄。</p>}
      </div>
    </div>
  );
}
