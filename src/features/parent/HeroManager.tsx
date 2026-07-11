import { useEffect, useState } from "react";
import { listHeroes, listSkills, updateHero } from "../../db/repository";
import type { Hero, Skill } from "../../types";
import { HeroRig } from "../../components/HeroRig";

export function HeroManager() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);

  async function load() {
    const [heroList, skillList] = await Promise.all([listHeroes(), listSkills()]);
    setHeroes(heroList);
    setSkills(skillList);
    setPrices(Object.fromEntries(heroList.map((h) => [h.id, h.price])));
  }

  useEffect(() => {
    load();
  }, []);

  function skillName(hero: Hero): string {
    return skills.find((s) => s.id === hero.defaultSkillId)?.name ?? "";
  }

  async function savePrice(hero: Hero) {
    const price = Math.max(0, Math.round(prices[hero.id] ?? hero.price));
    await updateHero(hero.id, { price });
    await load();
    setToast(`已更新【${hero.name}】價格為 ${price} 點`);
    setTimeout(() => setToast(null), 2000);
  }

  async function toggleActive(hero: Hero) {
    await updateHero(hero.id, { active: hero.active === false });
    await load();
  }

  return (
    <div className="stack">
      <h3>英雄商店管理</h3>
      <p className="text-muted">
        調整每位英雄的購買價格，或暫時下架（孩子已擁有的英雄不受下架影響）。價格為 0 的英雄會自動送給每個孩子當初始英雄。
      </p>
      {toast && <div className="warning-banner">{toast}</div>}

      {heroes.map((h) => (
        <div key={h.id} className="card row" style={{ opacity: h.active === false ? 0.55 : 1 }}>
          <HeroRig heroId={h.avatar} size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>
              {h.name} {h.active === false && <span className="text-muted">（已下架）</span>}
            </div>
            <div className="text-muted">招式：{skillName(h)}</div>
          </div>
          <input
            type="number"
            min={0}
            value={prices[h.id] ?? h.price}
            onChange={(e) => setPrices({ ...prices, [h.id]: Number(e.target.value) })}
            style={{ width: 76 }}
          />
          <button className="secondary-btn" onClick={() => savePrice(h)}>
            存
          </button>
          <button className="secondary-btn" onClick={() => toggleActive(h)}>
            {h.active === false ? "上架" : "下架"}
          </button>
        </div>
      ))}
    </div>
  );
}
