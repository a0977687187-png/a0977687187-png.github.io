import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../state/AppDataContext";
import { listTasks, listDeductionRules } from "../../db/repository";
import type { Task, DeductionRule } from "../../types";

export function TaskListReadonly() {
  const { selectedChild } = useAppData();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rules, setRules] = useState<DeductionRule[]>([]);

  useEffect(() => {
    (async () => {
      if (!selectedChild) return;
      setTasks((await listTasks(selectedChild.id)).filter((t) => t.active));
      setRules((await listDeductionRules(selectedChild.id)).filter((r) => r.active));
    })();
  }, [selectedChild]);

  return (
    <div className="screen">
      <div className="row">
        <button className="link-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>
      </div>
      <h2>📋 我的任務</h2>
      <div className="stack">
        {tasks.map((t) => (
          <div key={t.id} className="task-card" style={{ cursor: "default" }}>
            <span style={{ flex: 1 }}>{t.title}</span>
            <span className="badge">+{t.points} 點</span>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-muted">目前沒有任務。</p>}
      </div>

      <h2>⚠️ 扣點規則</h2>
      <div className="stack">
        {rules.map((r) => (
          <div key={r.id} className="task-card" style={{ cursor: "default" }}>
            <span style={{ flex: 1 }}>{r.title}</span>
            <span className="badge" style={{ background: "var(--color-danger)" }}>
              -{r.points} 點
            </span>
          </div>
        ))}
        {rules.length === 0 && <p className="text-muted">目前沒有扣點規則。</p>}
      </div>
    </div>
  );
}
