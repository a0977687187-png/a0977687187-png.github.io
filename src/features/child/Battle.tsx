import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../state/AppDataContext";
import { listMonsters, getDeployedHero, ensureStarterHeroes, attackMonster } from "../../db/repository";
import type { Monster } from "../../types";
import type { DeployedHero } from "../../db/repository";
import { HeroRig } from "../../components/HeroRig";
import { MonsterRig } from "../../components/MonsterRig";
import { VictoryCelebration } from "../../components/VictoryCelebration";
import { AttackEffect } from "../../components/AttackEffect";
import { DialogueBubble } from "../../components/DialogueBubble";
import { playSwingSound, playHitSound, playCrySound, playVictorySound, playInsufficientSound } from "../../content/sound";
import type { HitVariant } from "../../content/sound";

// 小夜／凱爾偏斬擊刺擊，命中音效走高頻銳利版；阿秋是砲擊系，走低頻大爆炸版。
const HIT_VARIANT_BY_HERO: Record<string, HitVariant> = {
  "hero-yoru": "sharp",
  "hero-kyle": "sharp",
  "hero-chiu": "boom",
};

// 3. 攻擊狀態機時間軸（實作指南）：0.0s 蓄力 -> 0.4s 衝刺揮擊 -> 0.55s 受擊/結算血量
// -> 0.6s 血量 <=30% 進入哭泣 -> 0.9s 英雄回位。
type HeroPhase = "idle" | "prep" | "slash";
const T_SLASH = 400;
const T_HURT = 550;
const T_CRY = 600;
const T_IDLE = 900;
const T_ELIMINATE_DELAY = 250;
const T_ELIMINATE_TRANSITION = 500;

export function Battle() {
  const { selectedChild, settings, refreshChildren } = useAppData();
  const navigate = useNavigate();
  const [monster, setMonster] = useState<Monster | null>(null);
  const [deployedHero, setDeployedHero] = useState<DeployedHero | null>(null);
  const [heroPhase, setHeroPhase] = useState<HeroPhase>("idle");
  const [monsterHurt, setMonsterHurt] = useState(false);
  const [eliminating, setEliminating] = useState(false);
  const [damageNumber, setDamageNumber] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [victory, setVictory] = useState<{ monsterName: string; reward: string } | null>(null);

  const soundEnabled = settings?.soundEnabled ?? true;

  async function load() {
    if (!selectedChild) return;
    const monsters = await listMonsters(selectedChild.id);
    setMonster(monsters.find((m) => m.status === "挑戰中") ?? null);
    setEliminating(false);

    let hero = await getDeployedHero(selectedChild.id);
    if (!hero) {
      await ensureStarterHeroes(selectedChild.id);
      hero = await getDeployedHero(selectedChild.id);
    }
    setDeployedHero(hero);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChild]);

  if (!selectedChild) {
    return <BattleEmpty message="尚未建立孩子資料。" />;
  }

  if (!monster) {
    return <BattleEmpty message="目前沒有挑戰中的怪獸，請家長到「怪獸管理」新增或啟用。" />;
  }

  if (!deployedHero) {
    return <BattleEmpty message="英雄準備中，請稍後再試一次。" />;
  }

  const canAfford = selectedChild.pointsCache >= monster.costPerAttack;
  const hpPercent = Math.round((monster.currentHp / monster.maxHp) * 100);
  const isLowHp = hpPercent > 0 && hpPercent <= 30;

  async function handleAttack() {
    if (!monster || !selectedChild || !deployedHero || busy) return;
    if (!canAfford) {
      if (soundEnabled) playInsufficientSound();
      return;
    }

    setBusy(true);
    setHeroPhase("prep");

    const result = await attackMonster(selectedChild.id, monster.id);
    if (!result.ok || !result.monster) {
      setBusy(false);
      setHeroPhase("idle");
      return;
    }
    const updatedMonster = result.monster;
    const attackingHero = deployedHero;

    window.setTimeout(() => {
      setHeroPhase("slash");
      if (soundEnabled) playSwingSound();
    }, T_SLASH);

    window.setTimeout(() => {
      setMonster(updatedMonster);
      setMonsterHurt(true);
      setDamageNumber(1);
      refreshChildren();
      if (soundEnabled) playHitSound(HIT_VARIANT_BY_HERO[attackingHero.hero.avatar] ?? "default");
      if (result.defeated) {
        window.setTimeout(() => setEliminating(true), T_ELIMINATE_DELAY);
      }
    }, T_HURT);

    window.setTimeout(() => {
      const nextHpPercent = Math.round((updatedMonster.currentHp / updatedMonster.maxHp) * 100);
      if (!result.defeated && nextHpPercent > 0 && nextHpPercent <= 30 && soundEnabled) {
        playCrySound();
      }
    }, T_CRY);

    const idleDelay = T_IDLE + (result.defeated ? T_ELIMINATE_DELAY + T_ELIMINATE_TRANSITION : 0);
    window.setTimeout(() => {
      setHeroPhase("idle");
      setMonsterHurt(false);
      setDamageNumber(null);
      setBusy(false);
      if (result.defeated && result.coupon) {
        if (soundEnabled) playVictorySound();
        setVictory({ monsterName: result.coupon.monsterName, reward: result.coupon.reward });
      }
    }, idleDelay);
  }

  return (
    <div className="screen">
      <div className="row">
        <button className="link-btn" onClick={() => navigate("/")}>
          ← 返回
        </button>
      </div>

      {!busy && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <DialogueBubble monsterId={monster.avatar} />
        </div>
      )}

      <div className="battle-scene">
        <div className="parallax-cloud cloud-a" />
        <div className="parallax-cloud cloud-b" />

        <div className="battle-hero">
          <HeroRig heroId={deployedHero.hero.avatar} phase={heroPhase} size={110} />
          {heroPhase !== "idle" && (
            <div className="skill-card" style={{ borderColor: deployedHero.skill.effectColor }}>
              {deployedHero.skill.name}
            </div>
          )}
        </div>

        <div className={`battle-monster ${eliminating ? "monster-eliminated" : ""}`}>
          <MonsterRig monsterId={monster.avatar} hurt={monsterHurt} crying={isLowHp} size={100} />
          {damageNumber !== null && <div className="damage-number">-{damageNumber}</div>}
          {heroPhase === "slash" && (
            <>
              <AttackEffect particleShape={deployedHero.skill.particleShape} color={deployedHero.skill.effectColor} />
              {deployedHero.skill.burstText && <div className="burst-text">{deployedHero.skill.burstText}</div>}
            </>
          )}
        </div>
      </div>

      <div className="card stack" style={{ textAlign: "center" }}>
        <h3>{monster.name}</h3>
        <div className="hp-bar-track">
          <div className="hp-bar-fill" style={{ width: `${hpPercent}%` }} />
        </div>
        <p className="text-muted">
          {monster.currentHp} / {monster.maxHp}
        </p>
      </div>

      <div className="card stack" style={{ textAlign: "center" }}>
        <p>
          攻擊一次需要 ⭐{monster.costPerAttack} 點（目前 🪙{selectedChild.pointsCache} 點）
        </p>
        <button className="primary-btn" onClick={handleAttack} disabled={!canAfford || busy}>
          {canAfford ? "攻擊！" : `還差 ⭐${monster.costPerAttack - selectedChild.pointsCache} 點`}
        </button>
        {!canAfford && (
          <button className="link-btn" onClick={() => navigate("/child/tasks")}>
            看我的任務
          </button>
        )}
      </div>

      {victory && (
        <VictoryCelebration
          monsterName={victory.monsterName}
          reward={victory.reward}
          soundEnabled={soundEnabled}
          onContinue={() => {
            setVictory(null);
            load();
          }}
          onHome={() => navigate("/")}
        />
      )}
    </div>
  );
}

function BattleEmpty({ message }: { message: string }) {
  const navigate = useNavigate();
  return (
    <div className="screen" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ fontSize: 64 }}>⚔️</div>
      <p className="text-muted">{message}</p>
      <button className="secondary-btn" onClick={() => navigate("/")}>
        返回首頁
      </button>
    </div>
  );
}
