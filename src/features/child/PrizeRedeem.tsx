import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../state/AppDataContext";
import { useParentAuth } from "../../state/ParentAuthContext";
import { listPrizes, redeemPrize, listRewardCoupons, redeemRewardCoupon } from "../../db/repository";
import type { Prize, RewardCoupon } from "../../types";
import { PinPad } from "../../components/PinPad";
import { Modal } from "../../components/Modal";
import { playGiftOpenSound, playInsufficientSound } from "../../content/sound";

const WEEKDAY_NAMES = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

function daysUntilWeekday(target: number): number {
  const now = new Date();
  let diff = target - now.getDay();
  if (diff < 0) diff += 7;
  return diff;
}

export function PrizeRedeem() {
  const { selectedChild, settings, refreshChildren } = useAppData();
  const { verifyPin } = useParentAuth();
  const navigate = useNavigate();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [coupons, setCoupons] = useState<RewardCoupon[]>([]);
  const [pendingPrize, setPendingPrize] = useState<Prize | null>(null);
  const [pendingCoupon, setPendingCoupon] = useState<RewardCoupon | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [redeemedName, setRedeemedName] = useState<string | null>(null);

  const soundEnabled = settings?.soundEnabled ?? true;

  async function refresh() {
    if (!selectedChild) return;
    setPrizes((await listPrizes(selectedChild.id)).filter((p) => p.active));
    setCoupons(await listRewardCoupons(selectedChild.id));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const redemptionWeekday = selectedChild.redemptionWeekday ?? settings?.redemptionWeekday ?? null;
  const isRedemptionDay = redemptionWeekday === null || new Date().getDay() === redemptionWeekday;

  function canRedeemNow(prize: Prize): boolean {
    return isRedemptionDay || !!prize.immediateRedeem;
  }

  function openConfirm(prize: Prize) {
    if (!canRedeemNow(prize)) return;
    if (selectedChild!.pointsCache < prize.cost) {
      if (soundEnabled) playInsufficientSound();
      return;
    }
    setPendingPrize(prize);
    setPendingCoupon(null);
    setPinInput("");
    setPinError("");
  }

  function openCouponConfirm(coupon: RewardCoupon) {
    setPendingCoupon(coupon);
    setPendingPrize(null);
    setPinInput("");
    setPinError("");
  }

  async function handlePinComplete(value: string) {
    if (!selectedChild || (!pendingPrize && !pendingCoupon)) return;
    const ok = verifyPin(value);
    if (!ok) {
      setPinError("PIN 不正確，請請家長協助輸入");
      setPinInput("");
      return;
    }

    if (pendingCoupon) {
      await redeemRewardCoupon(pendingCoupon.id);
      await refresh();
      if (soundEnabled) playGiftOpenSound();
      setRedeemedName(pendingCoupon.reward);
      setPendingCoupon(null);
      return;
    }

    const result = await redeemPrize(selectedChild.id, pendingPrize!);
    if (!result.ok) {
      setPinError(result.reason === "out-of-stock" ? "獎品庫存不足" : "點數不足");
      return;
    }
    await refreshChildren();
    await refresh();
    if (soundEnabled) playGiftOpenSound();
    setRedeemedName(pendingPrize!.name);
    setPendingPrize(null);
  }

  return (
    <div className="screen">
      <div className="row">
        <button className="link-btn" onClick={() => navigate("/")}>
          ← 返回
        </button>
      </div>
      <h2>🎁 獎品兌換</h2>

      {redemptionWeekday !== null && !isRedemptionDay && (
        <div className="warning-banner">
          今天不是兌獎日喔，{WEEKDAY_NAMES[redemptionWeekday]}才能兌換一般獎品（還有 {daysUntilWeekday(redemptionWeekday)} 天）。標示「可立即兌換」的獎品不受此限制。
        </div>
      )}

      {coupons.length > 0 && (
        <>
          <h3>🎟️ 怪獸獎勵券</h3>
          <div className="stack">
            {coupons.map((c) => (
              <button key={c.id} className="task-card" onClick={() => openCouponConfirm(c)}>
                <span style={{ flex: 1 }}>
                  {c.reward}
                  <span className="text-muted"> · 擊倒【{c.monsterName}】獲得</span>
                </span>
                <span className="badge" style={{ background: "var(--color-success)" }}>
                  去兌換
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <h3>🛍️ 一般獎品</h3>
      <div className="stack">
        {prizes.map((p) => {
          const affordable = selectedChild.pointsCache >= p.cost;
          const outOfStock = p.stock !== undefined && p.stock <= 0;
          const redeemable = canRedeemNow(p) && affordable && !outOfStock;
          return (
            <button
              key={p.id}
              className="task-card"
              style={{ cursor: redeemable ? "pointer" : "default", opacity: redeemable ? 1 : 0.6 }}
              onClick={() => openConfirm(p)}
              disabled={!redeemable}
            >
              <span style={{ flex: 1 }}>
                {p.name}
                {p.immediateRedeem && <span className="text-muted"> · 可立即兌換</span>}
                {outOfStock && <span className="text-muted"> · 已兌完</span>}
              </span>
              <span className="badge">🪙 {p.cost} 點</span>
            </button>
          );
        })}
        {prizes.length === 0 && <p className="text-muted">還沒有可兌換的獎品，請家長到「獎品管理」新增。</p>}
      </div>

      <Modal
        open={!!pendingPrize || !!pendingCoupon}
        onClose={() => {
          setPendingPrize(null);
          setPendingCoupon(null);
        }}
      >
        {(pendingPrize || pendingCoupon) && (
          <div className="stack" style={{ alignItems: "center", textAlign: "center" }}>
            <h3>請家長輸入 PIN 確認兌換</h3>
            {pendingCoupon ? (
              <p>
                兌換獎勵券 <strong>{pendingCoupon.reward}</strong>
              </p>
            ) : (
              <p>
                兌換 <strong>{pendingPrize!.name}</strong>，扣除 🪙 {pendingPrize!.cost} 點
              </p>
            )}
            <PinPad value={pinInput} onChange={setPinInput} onComplete={handlePinComplete} />
            {pinError && <p style={{ color: "var(--color-danger)" }}>{pinError}</p>}
            <button
              className="link-btn"
              onClick={() => {
                setPendingPrize(null);
                setPendingCoupon(null);
              }}
            >
              取消
            </button>
          </div>
        )}
      </Modal>

      {redeemedName && (
        <div className="celebration-overlay" onClick={() => setRedeemedName(null)}>
          <div className="coin-burst">🎁</div>
          <div className="celebration-title">兌換成功！</div>
          <div className="celebration-points" style={{ fontSize: 24 }}>
            {redeemedName}
          </div>
          <div className="celebration-quote">請跟家長領取你的獎品吧！</div>
          <button className="primary-btn" style={{ marginTop: 24 }} onClick={() => setRedeemedName(null)}>
            回獎品清單
          </button>
        </div>
      )}
    </div>
  );
}
