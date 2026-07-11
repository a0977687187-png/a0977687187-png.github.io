import { useEffect, useState } from "react";
import { useAppData } from "../../state/AppDataContext";
import { listTasks, createTask, updateTask, deleteTask, listLedger } from "../../db/repository";
import type { Task, TaskType, ReinforceMode } from "../../types";
import { TASK_TEMPLATES } from "../../content/taskTemplates";
import { Modal } from "../../components/Modal";

const TASK_TYPES: TaskType[] = ["改掉壞習慣", "培養好習慣", "學習愛好", "家事協助"];

const emptyForm = {
  title: "",
  type: "培養好習慣" as TaskType,
  points: 3,
  reinforceMode: "連續" as ReinforceMode,
  intermittentRate: 0.6,
  dailyLimit: 1,
};

export function TaskManager() {
  const { selectedChildId, selectedChild } = useAppData();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showTemplates, setShowTemplates] = useState(false);
  const [achievementRates, setAchievementRates] = useState<Record<string, number>>({});

  async function refresh() {
    if (!selectedChildId) return;
    const list = await listTasks(selectedChildId);
    setTasks(list);

    const ledger = await listLedger(selectedChildId);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const rates: Record<string, number> = {};
    for (const t of list) {
      const entries = ledger.filter(
        (e) => e.refType === "task" && e.refId === t.id && new Date(e.timestamp).getTime() >= thirtyDaysAgo
      );
      rates[t.id] = entries.length;
    }
    setAchievementRates(rates);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]);

  function openNewForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(task: Task) {
    setForm({
      title: task.title,
      type: task.type,
      points: task.points,
      reinforceMode: task.reinforceMode,
      intermittentRate: task.intermittentRate,
      dailyLimit: task.dailyLimit,
    });
    setEditingId(task.id);
    setShowForm(true);
  }

  async function submitForm() {
    if (!selectedChildId || !form.title.trim()) return;
    // 夾住數字範圍：number input 清空時會變 0/NaN，避免存進非法值
    const sanitized = {
      ...form,
      title: form.title.trim(),
      points: Math.min(20, Math.max(1, Math.round(Number(form.points)) || 1)),
      intermittentRate: Math.min(1, Math.max(0.05, Number(form.intermittentRate) || 0.6)),
      dailyLimit: Math.max(1, Math.round(Number(form.dailyLimit)) || 1),
    };
    if (editingId) {
      await updateTask(editingId, sanitized);
    } else {
      await createTask({ ...sanitized, childId: selectedChildId, active: true });
    }
    setShowForm(false);
    await refresh();
  }

  async function toggleActive(task: Task) {
    await updateTask(task.id, { active: !task.active });
    await refresh();
  }

  async function removeTask(task: Task) {
    if (!confirm(`確定要刪除任務「${task.title}」嗎？`)) return;
    await deleteTask(task.id);
    await refresh();
  }

  async function applyTemplate(title: string, type: TaskType, points: number) {
    if (!selectedChildId) return;
    await createTask({
      childId: selectedChildId,
      title,
      type,
      points,
      reinforceMode: "連續",
      intermittentRate: 0.6,
      dailyLimit: 1,
      active: true,
    });
    await refresh();
  }

  if (!selectedChild) {
    return (
        <p className="text-muted">請先在「孩子管理」新增孩子。</p>
    );
  }

  return (
    <div className="stack">
      <div className="row">
        <h3 style={{ flex: 1 }}>{selectedChild.name} 的任務</h3>
        <button className="secondary-btn" onClick={() => setShowTemplates(true)}>
          範本庫
        </button>
        <button className="primary-btn" onClick={openNewForm}>
          + 新增
        </button>
      </div>

      <div className="stack">
        {tasks.map((t) => (
          <div key={t.id} className="card stack" style={{ opacity: t.active ? 1 : 0.5 }}>
            <div className="row">
              <span style={{ flex: 1, fontWeight: 700 }}>{t.title}</span>
              <span className="badge">+{t.points} 點</span>
            </div>
            <div className="text-muted">
              {t.type} · {t.reinforceMode === "間歇" ? `間歇（${Math.round(t.intermittentRate * 100)}%）` : "連續"} ·
              近 30 天達成 {achievementRates[t.id] ?? 0} 次
            </div>
            {achievementRates[t.id] >= 12 && t.reinforceMode === "連續" && (
              <div className="warning-banner">這個習慣快養成了！建議改為間歇給點或調降點數。</div>
            )}
            <div className="row">
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => openEditForm(t)}>
                編輯
              </button>
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => toggleActive(t)}>
                {t.active ? "停用" : "啟用"}
              </button>
              <button className="danger-btn" onClick={() => removeTask(t)}>
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <div className="stack">
          <h3>{editingId ? "編輯任務" : "新增任務"}</h3>
          <label className="text-muted">具體行為（例如「自己整理書包」，避免「當個乖寶寶」這種籠統說法）</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label className="text-muted">類型</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TaskType })}>
            {TASK_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <label className="text-muted">點數（1~20，越難改越建議給高點）</label>
          <input
            type="number"
            min={1}
            max={20}
            value={form.points}
            onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
          />
          <label className="text-muted">增強模式</label>
          <select
            value={form.reinforceMode}
            onChange={(e) => setForm({ ...form, reinforceMode: e.target.value as ReinforceMode })}
          >
            <option value="連續">連續（每次都給點）</option>
            <option value="間歇">間歇（依機率給點）</option>
          </select>
          {form.reinforceMode === "間歇" && (
            <>
              <label className="text-muted">給點機率</label>
              <input
                type="number"
                min={1}
                max={100}
                value={Math.round(form.intermittentRate * 100)}
                onChange={(e) => setForm({ ...form, intermittentRate: Number(e.target.value) / 100 })}
              />
            </>
          )}
          <label className="text-muted">每日最多可得次數</label>
          <input
            type="number"
            min={1}
            value={form.dailyLimit}
            onChange={(e) => setForm({ ...form, dailyLimit: Number(e.target.value) })}
          />
          <div className="row">
            <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
              取消
            </button>
            <button className="primary-btn" style={{ flex: 1 }} onClick={submitForm} disabled={!form.title.trim()}>
              儲存
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={showTemplates} onClose={() => setShowTemplates(false)}>
        <div className="stack">
          <h3>任務範本庫（{selectedChild.ageGroup}）</h3>
          {TASK_TEMPLATES[selectedChild.ageGroup].map((t) => (
            <div key={t.title} className="row task-card" style={{ cursor: "default" }}>
              <span style={{ flex: 1 }}>{t.title}</span>
              <span className="badge">{t.points} 點</span>
              <button className="secondary-btn" onClick={() => applyTemplate(t.title, t.type, t.points)}>
                套用
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
