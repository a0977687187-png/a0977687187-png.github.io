import { useEffect, useState } from "react";
import { useAppData } from "../../state/AppDataContext";
import {
  listTasks,
  listDeductionRules,
  givePointsForTask,
  applyDeduction,
  createDeductionRule,
} from "../../db/repository";
import type { Task, DeductionRule } from "../../types";
import { randomEncouragement, randomNoPointPraise } from "../../content/encouragements";
import { Modal } from "../../components/Modal";
import { ChildAvatar } from "../../components/ChildAvatar";

export function ParentHome() {
  const { children, selectedChildId, setSelectedChildId, refreshChildren, pushCelebration } = useAppData();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rules, setRules] = useState<DeductionRule[]>([]);
  const [confirmTask, setConfirmTask] = useState<Task | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [bonusReason, setBonusReason] = useState("");
  const [confirmRule, setConfirmRule] = useState<DeductionRule | null>(null);
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRulePoints, setNewRulePoints] = useState(2);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!selectedChildId) return;
      setTasks(await listTasks(selectedChildId));
      setRules(await listDeductionRules(selectedChildId));
    })();
  }, [selectedChildId]);

  async function confirmGivePoints() {
    if (!confirmTask || !selectedChildId) return;
    const isBonus = multiplier !== 1;
    const result = await givePointsForTask(
      selectedChildId,
      confirmTask,
      multiplier,
      isBonus ? `${confirmTask.title}（${bonusReason || "額外表現加點"}）` : undefined
    );
    await refreshChildren();
    if (result.limitReached) {
      // 已達今日上限：不給點也不播慶祝動畫，避免孩子誤以為有得點
      setToast(`「${confirmTask.title}」今天已達給點上限（${confirmTask.dailyLimit} 次），明天再繼續吧！`);
    } else {
      pushCelebration({
        childId: selectedChildId,
        title: confirmTask.title,
        points: result.awarded ? result.entry.delta : 0,
        encouragement: result.awarded ? randomEncouragement() : randomNoPointPraise(),
      });
      setToast(result.awarded ? `已給予 ${result.entry.delta} 點！` : "本次為間歇模式，這次沒有給點（但已鼓勵孩子）");
    }
    setConfirmTask(null);
    setMultiplier(1);
    setBonusReason("");
    setTimeout(() => setToast(null), 3000);
  }

  async function confirmApplyDeduction() {
    if (!confirmRule || !selectedChildId) return;
    await applyDeduction(selectedChildId, confirmRule);
    await refreshChildren();
    setToast(`已扣除 ${confirmRule.points} 點`);
    setConfirmRule(null);
    setTimeout(() => setToast(null), 2500);
  }

  async function addRule() {
    if (!selectedChildId || !newRuleTitle.trim()) return;
    await createDeductionRule({
      childId: selectedChildId,
      title: newRuleTitle.trim(),
      points: Math.min(20, Math.max(1, Math.round(Number(newRulePoints)) || 1)),
      active: true,
    });
    setRules(await listDeductionRules(selectedChildId));
    setNewRuleTitle("");
    setNewRulePoints(2);
  }

  const selectedChild = children.find((c) => c.id === selectedChildId);

  return (
    <div className="stack">
      {children.length > 1 && (
        <div className="row" style={{ flexWrap: "wrap" }}>
          {children.map((c) => (
            <button
              key={c.id}
              className="secondary-btn"
              style={{
                background: c.id === selectedChildId ? "var(--color-primary)" : "white",
                color: c.id === selectedChildId ? "white" : "var(--color-text)",
              }}
              onClick={() => setSelectedChildId(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {selectedChild && (
        <div className="card row">
          <ChildAvatar avatar={selectedChild.avatar} size={48} />
          <div>
            <div>{selectedChild.name}</div>
            <div className="gold">🪙 {selectedChild.pointsCache} 點</div>
          </div>
        </div>
      )}

      {toast && <div className="warning-banner">{toast}</div>}

      <div className="card stack">
        <h3>✅ 給點（選任務）</h3>
        {tasks.length === 0 && <p className="text-muted">尚無任務，請先到「任務管理」新增。</p>}
        {tasks
          .filter((t) => t.active)
          .map((t) => (
            <button key={t.id} className="task-card" onClick={() => setConfirmTask(t)}>
              <span style={{ flex: 1 }}>{t.title}</span>
              <span className="badge">+{t.points} 點</span>
            </button>
          ))}
      </div>

      <div className="card stack">
        <h3>⚠️ 扣點（選規則）</h3>
        {rules.length === 0 && <p className="text-muted">尚無扣點規則。</p>}
        {rules
          .filter((r) => r.active)
          .map((r) => (
            <button key={r.id} className="task-card" onClick={() => setConfirmRule(r)}>
              <span style={{ flex: 1 }}>{r.title}</span>
              <span className="badge" style={{ background: "var(--color-danger)" }}>
                -{r.points} 點
              </span>
            </button>
          ))}
        <div className="row">
          <input placeholder="新規則名稱，如：頂嘴" value={newRuleTitle} onChange={(e) => setNewRuleTitle(e.target.value)} />
          <input
            type="number"
            min={1}
            max={20}
            value={newRulePoints}
            onChange={(e) => setNewRulePoints(Number(e.target.value))}
            style={{ width: 70 }}
          />
          <button className="secondary-btn" onClick={addRule}>
            新增
          </button>
        </div>
      </div>

      <Modal open={!!confirmTask} onClose={() => setConfirmTask(null)}>
        {confirmTask && (
          <div className="stack">
            <h3>確認給點</h3>
            <p>
              因為 <strong>{confirmTask.title}</strong>，給予 {Math.round(confirmTask.points * multiplier)} 點
            </p>
            <label className="text-muted">額外表現加點（今天特別認真？）</label>
            <select value={multiplier} onChange={(e) => setMultiplier(Number(e.target.value))}>
              <option value={1}>一般（1 倍）</option>
              <option value={1.5}>加倍努力（1.5 倍）</option>
              <option value={2}>非常認真（2 倍）</option>
              <option value={3}>超乎預期（3 倍）</option>
            </select>
            {multiplier !== 1 && (
              <input
                placeholder="加點原因，例如：今天特別認真"
                value={bonusReason}
                onChange={(e) => setBonusReason(e.target.value)}
              />
            )}
            <p className="text-muted">記得給孩子一個擁抱或口頭讚美 💛</p>
            <div className="row">
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setConfirmTask(null)}>
                取消
              </button>
              <button className="primary-btn" style={{ flex: 1 }} onClick={confirmGivePoints}>
                確認送出
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirmRule} onClose={() => setConfirmRule(null)}>
        {confirmRule && (
          <div className="stack">
            <h3>確認扣點</h3>
            <p>
              因為 <strong>{confirmRule.title}</strong>，扣除 {confirmRule.points} 點
            </p>
            <div className="row">
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setConfirmRule(null)}>
                取消
              </button>
              <button className="danger-btn" style={{ flex: 1 }} onClick={confirmApplyDeduction}>
                確認扣點
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
