import { useEffect, useState } from "react";
import { useAppData } from "../../state/AppDataContext";
import { listLedger, listTasks, listQuizAttempts } from "../../db/repository";
import type { PointLedgerEntry, Task, QuizAttempt } from "../../types";

const RANGE_OPTIONS = [7, 30] as const;

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" });
}

export function StatsPage() {
  const { selectedChildId, selectedChild } = useAppData();
  const [ledger, setLedger] = useState<PointLedgerEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>(7);

  useEffect(() => {
    (async () => {
      if (!selectedChildId) return;
      const [l, t, q] = await Promise.all([
        listLedger(selectedChildId),
        listTasks(selectedChildId),
        listQuizAttempts(selectedChildId),
      ]);
      setLedger(l);
      setTasks(t);
      setQuizAttempts(q);
    })();
  }, [selectedChildId]);

  if (!selectedChild) {
    return <p className="text-muted">請先在「孩子管理」新增孩子。</p>;
  }

  // ---------- 折線圖：近 N 天每日淨得點 ----------
  const now = new Date();
  const days: { key: string; label: string; total: number }[] = [];
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    days.push({ key, label: dayKey(d.toISOString()), total: 0 });
  }
  const dayIndex = new Map(days.map((d, i) => [d.key, i]));
  for (const entry of ledger) {
    const key = new Date(entry.timestamp).toDateString();
    const idx = dayIndex.get(key);
    if (idx !== undefined) days[idx].total += entry.delta;
  }
  const maxVal = Math.max(1, ...days.map((d) => Math.abs(d.total)));
  const chartW = 320;
  const chartH = 120;
  const stepX = chartW / Math.max(1, days.length - 1);
  const points = days
    .map((d, i) => {
      const x = i * stepX;
      const y = chartH - ((d.total + maxVal) / (maxVal * 2)) * chartH;
      return `${x},${y}`;
    })
    .join(" ");

  // ---------- 任務達成排行 ----------
  const taskCounts = new Map<string, number>();
  for (const entry of ledger) {
    if (entry.refType === "task" && entry.refId) {
      taskCounts.set(entry.refId, (taskCounts.get(entry.refId) ?? 0) + 1);
    }
  }
  const taskRanking = tasks
    .map((t) => ({ task: t, count: taskCounts.get(t.id) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .filter((r) => r.count > 0)
    .slice(0, 8);

  // ---------- 測驗答對率（分科目） ----------
  const subjectStats = new Map<string, { correct: number; total: number }>();
  for (const attempt of quizAttempts) {
    const s = subjectStats.get(attempt.subject) ?? { correct: 0, total: 0 };
    s.total += 1;
    if (attempt.correct) s.correct += 1;
    subjectStats.set(attempt.subject, s);
  }

  return (
    <div className="stack">
      <h3>{selectedChild.name} 的統計報表</h3>

      <div className="card stack">
        <div className="row">
          <h4 style={{ flex: 1 }}>📈 每日得點趨勢</h4>
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r}
              className="secondary-btn"
              style={{
                background: range === r ? "var(--color-primary)" : "white",
                color: range === r ? "white" : "var(--color-text)",
                padding: "6px 12px",
                fontSize: 13,
              }}
              onClick={() => setRange(r)}
            >
              近{r}天
            </button>
          ))}
        </div>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height={chartH} style={{ overflow: "visible" }}>
          <line x1="0" y1={chartH / 2} x2={chartW} y2={chartH / 2} stroke="var(--color-border)" strokeWidth="1" />
          <polyline points={points} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
          {days.map((d, i) => {
            const x = i * stepX;
            const y = chartH - ((d.total + maxVal) / (maxVal * 2)) * chartH;
            return <circle key={d.key} cx={x} cy={y} r="2.5" fill="var(--color-primary-dark)" />;
          })}
        </svg>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="text-muted" style={{ fontSize: 12 }}>
            {days[0]?.label}
          </span>
          <span className="text-muted" style={{ fontSize: 12 }}>
            {days[days.length - 1]?.label}
          </span>
        </div>
      </div>

      <div className="card stack">
        <h4>🏆 任務達成排行</h4>
        {taskRanking.length === 0 && <p className="text-muted">還沒有任務達成紀錄。</p>}
        {taskRanking.map((r, i) => (
          <div key={r.task.id} className="row">
            <span style={{ width: 24, fontWeight: 700 }}>{i + 1}</span>
            <span style={{ flex: 1 }}>{r.task.title}</span>
            <span className="badge">{r.count} 次</span>
          </div>
        ))}
      </div>

      <div className="card stack">
        <h4>📝 測驗答對率（分科目）</h4>
        {subjectStats.size === 0 && <p className="text-muted">還沒有測驗紀錄。</p>}
        {Array.from(subjectStats.entries()).map(([subject, s]) => {
          const rate = Math.round((s.correct / s.total) * 100);
          return (
            <div key={subject} className="stack" style={{ gap: 4 }}>
              <div className="row">
                <span style={{ flex: 1 }}>{subject}</span>
                <span className="text-muted">
                  {s.correct} / {s.total}（{rate}%）
                </span>
              </div>
              <div className="hp-bar-track" style={{ height: 10 }}>
                <div className="hp-bar-fill" style={{ width: `${rate}%`, background: "var(--color-success)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
