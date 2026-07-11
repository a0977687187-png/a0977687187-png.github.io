import { useEffect, useState } from "react";
import { useAppData } from "../../state/AppDataContext";
import { listPrizes, createPrize, updatePrize, deletePrize } from "../../db/repository";
import type { Prize } from "../../types";
import { Modal } from "../../components/Modal";

const emptyForm = { name: "", cost: 20, stock: "" as number | "", immediateRedeem: false };

export function PrizeManager() {
  const { selectedChildId, selectedChild, settings } = useAppData();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function refresh() {
    if (!selectedChildId) return;
    setPrizes(await listPrizes(selectedChildId));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(p: Prize) {
    setEditingId(p.id);
    setForm({ name: p.name, cost: p.cost, stock: p.stock ?? "", immediateRedeem: p.immediateRedeem ?? false });
    setShowForm(true);
  }

  async function submit() {
    if (!selectedChildId || !form.name.trim()) return;
    const data = {
      childId: selectedChildId,
      name: form.name.trim(),
      // 夾住數字範圍：避免存進 0/NaN 的點數或負庫存
      cost: Math.max(1, Math.round(Number(form.cost)) || 1),
      stock: form.stock === "" ? undefined : Math.max(0, Math.round(Number(form.stock)) || 0),
      immediateRedeem: form.immediateRedeem,
      active: true,
    };
    if (editingId) {
      await updatePrize(editingId, data);
    } else {
      await createPrize(data);
    }
    setShowForm(false);
    await refresh();
  }

  async function toggleActive(p: Prize) {
    await updatePrize(p.id, { active: !p.active });
    await refresh();
  }

  async function removePrize(p: Prize) {
    if (!confirm(`確定要刪除獎品「${p.name}」嗎？`)) return;
    await deletePrize(p.id);
    await refresh();
  }

  if (!selectedChild) {
    return (
        <p className="text-muted">請先在「孩子管理」新增孩子。</p>
    );
  }

  const redemptionWeekday = selectedChild.redemptionWeekday ?? settings?.redemptionWeekday ?? null;
  const weekdayNames = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

  return (
    <div className="stack">
      <div className="row">
        <h3 style={{ flex: 1 }}>{selectedChild.name} 的獎品</h3>
        <button className="primary-btn" onClick={openNew}>
          + 新增獎品
        </button>
      </div>
      <p className="text-muted">
        建議規劃三個價位帶：小獎 10~30 點、中獎 50~100 點、大獎 150 點以上。
        {redemptionWeekday !== null
          ? `目前固定兌獎日是「${weekdayNames[redemptionWeekday]}」，非兌獎日只有勾選「立即兌換」的獎品可以兌換。`
          : "尚未設定固定兌獎日（在「設定」頁可調整），所有獎品目前都可隨時兌換。"}
      </p>

      {prizes.length === 0 && <p className="text-muted">尚無獎品，請新增。</p>}
      {prizes.map((p) => (
        <div key={p.id} className="card row" style={{ opacity: p.active ? 1 : 0.5 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>
              {p.name} {p.immediateRedeem && <span className="badge">可立即兌換</span>}
            </div>
            <div className="text-muted">
              🪙 {p.cost} 點{p.stock !== undefined && ` · 剩餘 ${p.stock} 份`}
            </div>
          </div>
          <button className="secondary-btn" onClick={() => openEdit(p)}>
            編輯
          </button>
          <button className="secondary-btn" onClick={() => toggleActive(p)}>
            {p.active ? "下架" : "上架"}
          </button>
          <button className="danger-btn" onClick={() => removePrize(p)}>
            刪除
          </button>
        </div>
      ))}

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <div className="stack">
          <h3>{editingId ? "編輯獎品" : "新增獎品"}</h3>
          <label className="text-muted">獎品名稱</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="text-muted">需要點數</label>
          <input
            type="number"
            min={1}
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
          />
          <label className="text-muted">庫存（留空 = 不限數量）</label>
          <input
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value === "" ? "" : Number(e.target.value) })}
          />
          <div className="row">
            <input
              type="checkbox"
              checked={form.immediateRedeem}
              onChange={(e) => setForm({ ...form, immediateRedeem: e.target.checked })}
              style={{ width: "auto" }}
            />
            <span>不受固定兌獎日限制，隨時可兌換（例如點心、小貼紙這類小獎）</span>
          </div>
          <div className="row">
            <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
              取消
            </button>
            <button className="primary-btn" style={{ flex: 1 }} onClick={submit} disabled={!form.name.trim()}>
              儲存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
