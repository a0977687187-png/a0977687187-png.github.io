import { useEffect, useState } from "react";
import { useAppData } from "../../state/AppDataContext";
import {
  listMonsters,
  createMonster,
  updateMonster,
  deleteMonster,
  activateMonster,
  listTasks,
  listRewardCoupons,
  redeemRewardCoupon,
} from "../../db/repository";
import type { Monster, RewardCoupon } from "../../types";
import { MONSTER_DESIGNS } from "../../content/monsterDesigns";
import { MonsterRig } from "../../components/MonsterRig";
import { Modal } from "../../components/Modal";

const emptyForm = {
  designId: MONSTER_DESIGNS[0].designId,
  name: MONSTER_DESIGNS[0].name,
  maxHp: 20,
  costPerAttack: 5,
  reward: "",
};

export function MonsterManager() {
  const { selectedChildId, selectedChild } = useAppData();
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [coupons, setCoupons] = useState<RewardCoupon[]>([]);
  const [avgDailyPoints, setAvgDailyPoints] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function refresh() {
    if (!selectedChildId) return;
    setMonsters(await listMonsters(selectedChildId));
    setCoupons(await listRewardCoupons(selectedChildId));
    const tasks = (await listTasks(selectedChildId)).filter((t) => t.active);
    const total = tasks.reduce((sum, t) => sum + t.points, 0);
    setAvgDailyPoints(total || 1);
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

  function openEditForm(monster: Monster) {
    const design = MONSTER_DESIGNS.find((d) => d.avatar === monster.avatar);
    setForm({
      designId: design?.designId ?? MONSTER_DESIGNS[0].designId,
      name: monster.name,
      maxHp: monster.maxHp,
      costPerAttack: monster.costPerAttack,
      reward: monster.reward,
    });
    setEditingId(monster.id);
    setShowForm(true);
  }

  async function submitForm() {
    if (!selectedChildId || !form.name.trim()) return;
    const design = MONSTER_DESIGNS.find((d) => d.designId === form.designId)!;
    // 夾住數字範圍：血量/攻擊點數至少為 1，避免出現血量 0 或 NaN 的怪獸
    const maxHp = Math.max(1, Math.round(Number(form.maxHp)) || 1);
    const costPerAttack = Math.max(1, Math.round(Number(form.costPerAttack)) || 1);
    if (editingId) {
      const existing = monsters.find((m) => m.id === editingId);
      await updateMonster(editingId, {
        name: form.name.trim(),
        avatar: design.avatar,
        maxHp,
        costPerAttack,
        reward: form.reward.trim() || "神秘小獎勵",
        currentHp: existing ? Math.min(existing.currentHp, maxHp) : maxHp,
      });
    } else {
      const hasActive = monsters.some((m) => m.status === "挑戰中");
      await createMonster({
        childId: selectedChildId,
        name: form.name.trim(),
        avatar: design.avatar,
        maxHp,
        costPerAttack,
        reward: form.reward.trim() || "神秘小獎勵",
        status: hasActive ? "排隊中" : "挑戰中",
      });
    }
    setShowForm(false);
    await refresh();
  }

  async function removeMonster(monster: Monster) {
    if (!confirm(`確定要刪除怪獸「${monster.name}」嗎？`)) return;
    await deleteMonster(monster.id);
    await refresh();
  }

  async function activate(monster: Monster) {
    if (!selectedChildId) return;
    await activateMonster(selectedChildId, monster.id);
    await refresh();
  }

  async function markCouponRedeemed(coupon: RewardCoupon) {
    await redeemRewardCoupon(coupon.id);
    await refresh();
  }

  if (!selectedChild) {
    return (
        <p className="text-muted">請先在「孩子管理」新增孩子。</p>
    );
  }

  const estimatedDays = Math.ceil((form.maxHp * form.costPerAttack) / avgDailyPoints);
  const active = monsters.filter((m) => m.status === "挑戰中");
  const queued = monsters.filter((m) => m.status === "排隊中").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const defeated = monsters
    .filter((m) => m.status === "已擊倒")
    .sort((a, b) => (b.defeatedAt ?? "").localeCompare(a.defeatedAt ?? ""));

  return (
    <div className="stack">
      <div className="row">
        <h3 style={{ flex: 1 }}>{selectedChild.name} 的怪獸</h3>
        <button className="primary-btn" onClick={openNewForm}>
          + 新增怪獸
        </button>
      </div>

      <h4>⚔️ 挑戰中</h4>
      {active.length === 0 && <p className="text-muted">目前沒有挑戰中的怪獸。</p>}
      {active.map((m) => (
        <MonsterCard key={m.id} monster={m} onEdit={openEditForm} onDelete={removeMonster} />
      ))}

      <h4>📋 排隊中</h4>
      {queued.length === 0 && <p className="text-muted">沒有排隊中的怪獸。</p>}
      {queued.map((m) => (
        <MonsterCard
          key={m.id}
          monster={m}
          onEdit={openEditForm}
          onDelete={removeMonster}
          onActivate={active.length === 0 ? () => activate(m) : undefined}
        />
      ))}

      <h4>📖 怪獸圖鑑（已擊倒）</h4>
      {defeated.length === 0 && <p className="text-muted">還沒有擊倒任何怪獸。</p>}
      {defeated.map((m) => (
        <div key={m.id} className="card row">
          <MonsterRig monsterId={m.avatar} size={48} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{m.name}</div>
            <div className="text-muted">
              擊倒於 {m.defeatedAt ? new Date(m.defeatedAt).toLocaleDateString() : "-"} · 獎勵：{m.reward}
            </div>
          </div>
        </div>
      ))}

      {coupons.length > 0 && (
        <>
          <h4>🎟️ 獎勵券匣</h4>
          {coupons.map((c) => (
            <div key={c.id} className="card row">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{c.reward}</div>
                <div className="text-muted">擊倒【{c.monsterName}】獲得</div>
              </div>
              <button className="primary-btn" onClick={() => markCouponRedeemed(c)}>
                標記兌現
              </button>
            </div>
          ))}
        </>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <div className="stack">
          <h3>{editingId ? "編輯怪獸" : "新增怪獸"}</h3>
          <label className="text-muted">造型</label>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            {MONSTER_DESIGNS.map((d) => (
              <button
                key={d.designId}
                type="button"
                onClick={() => setForm({ ...form, designId: d.designId, name: d.name })}
                className="stack"
                style={{
                  alignItems: "center",
                  width: 72,
                  padding: 6,
                  borderRadius: 12,
                  border:
                    d.designId === form.designId
                      ? "3px solid var(--color-primary)"
                      : "2px solid var(--color-border)",
                  background: "white",
                }}
              >
                <MonsterRig monsterId={d.avatar} size={40} />
                <span style={{ fontSize: 11 }}>{d.name}</span>
              </button>
            ))}
          </div>
          <label className="text-muted">名稱</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="text-muted">血量（越高越難打倒）</label>
          <input
            type="number"
            min={1}
            value={form.maxHp}
            onChange={(e) => setForm({ ...form, maxHp: Number(e.target.value) })}
          />
          <label className="text-muted">每次攻擊消耗點數</label>
          <input
            type="number"
            min={1}
            value={form.costPerAttack}
            onChange={(e) => setForm({ ...form, costPerAttack: Number(e.target.value) })}
          />
          <label className="text-muted">擊倒獎勵</label>
          <input
            placeholder="例如：麥當勞兒童餐一份"
            value={form.reward}
            onChange={(e) => setForm({ ...form, reward: e.target.value })}
          />
          <p className="text-muted">
            以孩子每天約得 {avgDailyPoints} 點估算，打倒這隻怪獸約需 {estimatedDays} 天。
          </p>
          {estimatedDays > 21 && (
            <div className="warning-banner">⚠️ 門檻可能太高，孩子容易放棄，建議降低血量或攻擊點數。</div>
          )}
          <div className="row">
            <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
              取消
            </button>
            <button className="primary-btn" style={{ flex: 1 }} onClick={submitForm} disabled={!form.name.trim()}>
              儲存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MonsterCard({
  monster,
  onEdit,
  onDelete,
  onActivate,
}: {
  monster: Monster;
  onEdit: (m: Monster) => void;
  onDelete: (m: Monster) => void;
  onActivate?: () => void;
}) {
  const hpPercent = Math.round((monster.currentHp / monster.maxHp) * 100);
  return (
    <div className="card stack">
      <div className="row">
        <MonsterRig monsterId={monster.avatar} size={48} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>{monster.name}</div>
          <div className="text-muted">
            ⭐{monster.costPerAttack} / 次 · 獎勵：{monster.reward}
          </div>
        </div>
      </div>
      <div className="hp-bar-track">
        <div className="hp-bar-fill" style={{ width: `${hpPercent}%` }} />
      </div>
      <div className="text-muted">
        {monster.currentHp} / {monster.maxHp}
      </div>
      <div className="row">
        {onActivate && (
          <button className="primary-btn" style={{ flex: 1 }} onClick={onActivate}>
            設為挑戰中
          </button>
        )}
        <button className="secondary-btn" style={{ flex: 1 }} onClick={() => onEdit(monster)}>
          編輯
        </button>
        <button className="danger-btn" onClick={() => onDelete(monster)}>
          刪除
        </button>
      </div>
    </div>
  );
}
