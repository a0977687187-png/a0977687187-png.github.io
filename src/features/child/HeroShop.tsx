import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../state/AppDataContext";
import {
  listHeroes,
  listSkills,
  listHeroOwnership,
  purchaseHero,
  deployHero,
  ensureStarterHeroes,
} from "../../db/repository";
import type { Hero, Skill, HeroOwnership } from "../../types";
import { HeroRig } from "../../components/HeroRig";
import { Modal } from "../../components/Modal";
import { PointsDisplay } from "../../components/PointsDisplay";
import { playGiftOpenSound, playInsufficientSound } from "../../content/sound";
import { getHeroDialogue } from "../../content/heroDialogue";

export function HeroShop() {
  const { selectedChild, settings, refreshChildren } = useAppData();
  const navigate = useNavigate();
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [ownership, setOwnership] = useState<HeroOwnership[]>([]);
  const [confirmHero, setConfirmHero] = useState<Hero | null>(null);
  const [unboxHero, setUnboxHero] = useState<Hero | null>(null);

  const soundEnabled = settings?.soundEnabled ?? true;

  async function load() {
    if (!selectedChild) return;
    await ensureStarterHeroes(selectedChild.id);
    const [heroList, skillList, owned] = await Promise.all([
      listHeroes(),
      listSkills(),
      listHeroOwnership(selectedChild.id),
    ]);
    setHeroes(heroList);
    setSkills(skillList);
    setOwnership(owned);
  }

  useEffect(() => {
    load();
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

  const ownedIds = new Set(ownership.map((o) => o.heroId));
  const deployedHeroId = ownership.find((o) => o.isDeployed)?.heroId;
  const ownedHeroes = heroes.filter((h) => ownedIds.has(h.id));
  const shopHeroes = heroes.filter((h) => !ownedIds.has(h.id) && h.active !== false);
  const deployedHero = ownedHeroes.find((h) => h.id === deployedHeroId);
  const deployedDialogue = deployedHero ? getHeroDialogue(deployedHero.avatar) : null;

  function skillName(hero: Hero): string {
    return skills.find((s) => s.id === hero.defaultSkillId)?.name ?? "";
  }

  async function handleDeploy(hero: Hero) {
    if (!selectedChild) return;
    await deployHero(selectedChild.id, hero.id);
    await load();
  }

  async function handlePurchase() {
    if (!selectedChild || !confirmHero) return;
    const result = await purchaseHero(selectedChild.id, confirmHero);
    if (!result.ok) {
      if (soundEnabled) playInsufficientSound();
      setConfirmHero(null);
      return;
    }
    await refreshChildren();
    await load();
    if (soundEnabled) playGiftOpenSound();
    setUnboxHero(confirmHero);
    setConfirmHero(null);
  }

  return (
    <div className="screen">
      <div className="row">
        <button className="link-btn" onClick={() => navigate("/")}>
          ← 返回
        </button>
        <span className="spacer" />
        <PointsDisplay points={selectedChild.pointsCache} />
      </div>

      <h2>🦸 我的英雄（出戰設定）</h2>
      <div className="hero-grid">
        {ownedHeroes.map((h) => {
          const isDeployed = h.id === deployedHeroId;
          return (
            <button
              key={h.id}
              className={`hero-card ${isDeployed ? "deployed" : ""}`}
              onClick={() => handleDeploy(h)}
            >
              {isDeployed && <span className="deployed-badge">出戰中</span>}
              <HeroRig heroId={h.avatar} size={84} />
              <span className="hero-name">{h.name}</span>
              <span className="hero-skill">{skillName(h)}</span>
            </button>
          );
        })}
      </div>
      {deployedDialogue && <div className="dialogue-bubble">{deployedDialogue.idle}</div>}
      <p className="text-muted">點一下英雄，讓他出戰打怪獸！</p>

      {shopHeroes.length > 0 && (
        <>
          <h2>🛒 英雄商店</h2>
          <div className="hero-grid">
            {shopHeroes.map((h) => {
              const affordable = selectedChild.pointsCache >= h.price;
              return (
                <button
                  key={h.id}
                  className="hero-card shop"
                  onClick={() => {
                    if (affordable) {
                      setConfirmHero(h);
                    } else if (soundEnabled) {
                      playInsufficientSound();
                    }
                  }}
                >
                  <div className="hero-silhouette">
                    <HeroRig heroId={h.avatar} size={84} />
                  </div>
                  <span className="hero-name">{h.name}</span>
                  <span className={`badge ${affordable ? "" : "badge-dim"}`}>🪙 {h.price} 點</span>
                  {!affordable && (
                    <span className="hero-skill">還差 {h.price - selectedChild.pointsCache} 點</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* 購買二次確認（防誤觸） */}
      <Modal open={!!confirmHero} onClose={() => setConfirmHero(null)}>
        {confirmHero && (
          <div className="stack" style={{ alignItems: "center", textAlign: "center" }}>
            <h3>要迎接新夥伴嗎？</h3>
            <HeroRig heroId={confirmHero.avatar} size={110} />
            <p>
              <strong>{confirmHero.name}</strong>
              <br />
              <span className="text-muted">招式：{skillName(confirmHero)}</span>
            </p>
            <p>
              需要 🪙 <strong>{confirmHero.price}</strong> 點（你有 {selectedChild.pointsCache} 點）
            </p>
            <div className="row" style={{ width: "100%" }}>
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setConfirmHero(null)}>
                再想想
              </button>
              <button className="primary-btn" style={{ flex: 1 }} onClick={handlePurchase}>
                確定購買！
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 新英雄登場開箱動畫 */}
      {unboxHero && (
        <div className="celebration-overlay victory-overlay" onClick={() => setUnboxHero(null)}>
          <div className="celebration-title">✨ 新英雄登場！</div>
          <div className="reward-reveal">
            <HeroRig heroId={unboxHero.avatar} size={150} />
            <div className="reward-card">
              {unboxHero.name}
              <div style={{ fontSize: 15, fontWeight: 600, color: "#8a7a68", marginTop: 4 }}>
                招式：{skillName(unboxHero)}
              </div>
            </div>
          </div>
          <div className="row" style={{ marginTop: 20, gap: 12 }}>
            <button
              className="primary-btn"
              onClick={async (e) => {
                e.stopPropagation();
                await handleDeploy(unboxHero);
                setUnboxHero(null);
              }}
            >
              立刻出戰！
            </button>
            <button className="secondary-btn" onClick={() => setUnboxHero(null)}>
              先收下
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
