import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AgeGroup, TaskType } from "../../types";
import { TASK_TEMPLATES } from "../../content/taskTemplates";
import { MONSTER_DESIGNS } from "../../content/monsterDesigns";
import { updateSettings, createChild, createTask, createMonster, ensureStarterHeroes } from "../../db/repository";
import { useAppData } from "../../state/AppDataContext";
import { ChildAvatar } from "../../components/ChildAvatar";
import { MonsterRig } from "../../components/MonsterRig";

const AVATAR_OPTIONS = ["🦁", "🐯", "🐰", "🐻", "🐼", "🐨", "🦊", "🐶", "🐱", "🦄", "🐸", "🐵"];
const AGE_GROUPS: AgeGroup[] = ["幼稚園", "小一小二", "小三小四", "小五小六"];

type Step = "welcome" | "pin" | "security" | "child" | "tasks" | "monster" | "done";

interface SelectedTemplate {
  title: string;
  type: TaskType;
  points: number;
  checked: boolean;
}

export function SetupWizard() {
  const navigate = useNavigate();
  const { refreshChildren, refreshSettings, setSelectedChildId } = useAppData();
  const [step, setStep] = useState<Step>("welcome");

  // PIN
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");

  // security question
  const [question, setQuestion] = useState("你最喜歡的顏色是？");
  const [answer, setAnswer] = useState("");

  // child
  const [childName, setChildName] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("小一小二");
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [childId, setChildId] = useState<string | null>(null);

  // tasks
  const [templates, setTemplates] = useState<SelectedTemplate[]>([]);

  // monster
  const [monsterDesignId, setMonsterDesignId] = useState(MONSTER_DESIGNS[0].designId);
  const [maxHp, setMaxHp] = useState(20);
  const [costPerAttack, setCostPerAttack] = useState(5);
  const [reward, setReward] = useState("");

  const avgDailyPoints = useMemo(() => {
    const checked = templates.filter((t) => t.checked);
    const total = checked.reduce((sum, t) => sum + t.points, 0);
    return total || 1;
  }, [templates]);

  const estimatedDays = useMemo(() => {
    const totalNeeded = maxHp * costPerAttack;
    return Math.ceil(totalNeeded / avgDailyPoints);
  }, [maxHp, costPerAttack, avgDailyPoints]);

  function goWelcomeNext() {
    setStep("pin");
  }

  async function submitPin() {
    if (!/^\d{4}$/.test(pin)) {
      setPinError("請輸入 4 位數字");
      return;
    }
    if (pin !== pinConfirm) {
      setPinError("兩次輸入的 PIN 不一致");
      return;
    }
    await updateSettings({ parentPin: pin });
    setPinError("");
    setStep("security");
  }

  async function submitSecurity() {
    await updateSettings({ securityQuestion: { question, answer } });
    setStep("child");
  }

  async function submitChild() {
    if (!childName.trim()) return;
    const child = await createChild({ name: childName.trim(), ageGroup, avatar, redemptionWeekday: 0 });
    await ensureStarterHeroes(child.id);
    setChildId(child.id);
    setSelectedChildId(child.id);
    setTemplates(
      TASK_TEMPLATES[ageGroup].map((t) => ({ ...t, checked: true }))
    );
    await refreshChildren();
    setStep("tasks");
  }

  function toggleTemplate(index: number) {
    setTemplates((prev) =>
      prev.map((t, i) => (i === index ? { ...t, checked: !t.checked } : t))
    );
  }

  function updateTemplatePoints(index: number, points: number) {
    setTemplates((prev) => prev.map((t, i) => (i === index ? { ...t, points } : t)));
  }

  async function submitTasks() {
    if (!childId) return;
    const checked = templates.filter((t) => t.checked);
    for (const t of checked) {
      await createTask({
        childId,
        title: t.title,
        type: t.type,
        points: Math.min(20, Math.max(1, Math.round(Number(t.points)) || 1)),
        reinforceMode: "連續",
        intermittentRate: 0.6,
        dailyLimit: 1,
        active: true,
      });
    }
    setStep("monster");
  }

  async function submitMonster() {
    if (!childId) return;
    const design = MONSTER_DESIGNS.find((d) => d.designId === monsterDesignId)!;
    await createMonster({
      childId,
      name: design.name,
      avatar: design.avatar,
      maxHp: Math.max(1, Math.round(Number(maxHp)) || 1),
      costPerAttack: Math.max(1, Math.round(Number(costPerAttack)) || 1),
      reward: reward.trim() || "神秘小獎勵",
      status: "挑戰中",
    });
    setStep("done");
  }

  async function finish() {
    await updateSettings({ setupCompleted: true });
    await refreshSettings();
    navigate("/");
  }

  return (
    <div className="screen">
      <div className="wizard-step-dots">
        {["welcome", "pin", "security", "child", "tasks", "monster", "done"].map((s) => (
          <span key={s} className={`dot ${s === step ? "active" : ""}`} />
        ))}
      </div>

      {step === "welcome" && (
        <div className="stack card" style={{ textAlign: "center", marginTop: 40 }}>
          <h1>🍊 柚子集點大冒險</h1>
          <p className="text-muted">歡迎使用！讓我們花幾分鐘完成初始設定。</p>
          <button className="primary-btn" onClick={goWelcomeNext}>
            開始設定
          </button>
        </div>
      )}

      {step === "pin" && (
        <div className="stack card">
          <h2>設定家長 PIN 碼</h2>
          <p className="text-muted">用來進入家長模式，請設定 4 位數字。</p>
          <input
            inputMode="numeric"
            maxLength={4}
            placeholder="輸入 4 位數 PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          />
          <input
            inputMode="numeric"
            maxLength={4}
            placeholder="再輸入一次確認"
            value={pinConfirm}
            onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))}
          />
          {pinError && <p style={{ color: "var(--color-danger)" }}>{pinError}</p>}
          <button className="primary-btn" onClick={submitPin}>
            下一步
          </button>
        </div>
      )}

      {step === "security" && (
        <div className="stack card">
          <h2>設定安全問題</h2>
          <p className="text-muted">萬一忘記 PIN，可以用這個問題重設。</p>
          <select value={question} onChange={(e) => setQuestion(e.target.value)}>
            <option>你最喜歡的顏色是？</option>
            <option>家裡養的寵物叫什麼名字？</option>
            <option>孩子出生的醫院名稱？</option>
          </select>
          <input placeholder="答案" value={answer} onChange={(e) => setAnswer(e.target.value)} />
          <button className="primary-btn" onClick={submitSecurity} disabled={!answer.trim()}>
            下一步
          </button>
        </div>
      )}

      {step === "child" && (
        <div className="stack card">
          <h2>新增第一個孩子</h2>
          <input placeholder="孩子的名字" value={childName} onChange={(e) => setChildName(e.target.value)} />
          <label className="text-muted">年齡層</label>
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}>
            {AGE_GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <label className="text-muted">選一個頭像</label>
          <div className="row" style={{ flexWrap: "wrap" }}>
            {AVATAR_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                style={{
                  fontSize: 28,
                  padding: 8,
                  borderRadius: 12,
                  border: a === avatar ? "3px solid var(--color-primary)" : "2px solid var(--color-border)",
                  background: "white",
                }}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="row" style={{ justifyContent: "center" }}>
            <ChildAvatar avatar={avatar} size={72} />
          </div>
          <button className="primary-btn" onClick={submitChild} disabled={!childName.trim()}>
            下一步
          </button>
        </div>
      )}

      {step === "tasks" && (
        <div className="stack card">
          <h2>挑選任務範本</h2>
          <p className="text-muted">越難做到的行為，建議給越多點。之後仍可在家長模式調整。</p>
          <div className="stack">
            {templates.map((t, i) => (
              <div key={t.title} className="row task-card" style={{ cursor: "default" }}>
                <input type="checkbox" checked={t.checked} onChange={() => toggleTemplate(i)} />
                <span style={{ flex: 1 }}>{t.title}</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={t.points}
                  onChange={(e) => updateTemplatePoints(i, Number(e.target.value))}
                  style={{ width: 64 }}
                />
                <span className="text-muted">點</span>
              </div>
            ))}
          </div>
          <button className="primary-btn" onClick={submitTasks}>
            下一步
          </button>
        </div>
      )}

      {step === "monster" && (
        <div className="stack card">
          <h2>挑選第一隻怪獸</h2>
          <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
            {MONSTER_DESIGNS.map((d) => (
              <button
                key={d.designId}
                type="button"
                onClick={() => setMonsterDesignId(d.designId)}
                className="stack"
                style={{
                  alignItems: "center",
                  width: 84,
                  padding: 8,
                  borderRadius: 12,
                  border:
                    d.designId === monsterDesignId
                      ? "3px solid var(--color-primary)"
                      : "2px solid var(--color-border)",
                  background: "white",
                }}
              >
                <MonsterRig monsterId={d.avatar} size={48} />
                <span style={{ fontSize: 12 }}>{d.name}</span>
              </button>
            ))}
          </div>
          <label className="text-muted">血量（越高越難打倒）</label>
          <input type="number" min={1} value={maxHp} onChange={(e) => setMaxHp(Number(e.target.value))} />
          <label className="text-muted">每次攻擊消耗點數</label>
          <input
            type="number"
            min={1}
            value={costPerAttack}
            onChange={(e) => setCostPerAttack(Number(e.target.value))}
          />
          <label className="text-muted">擊倒獎勵</label>
          <input placeholder="例如：麥當勞兒童餐一份" value={reward} onChange={(e) => setReward(e.target.value)} />
          <p className="text-muted">
            以孩子每天約得 {avgDailyPoints} 點估算，打倒這隻怪獸約需 {estimatedDays} 天。
          </p>
          {estimatedDays > 21 && (
            <div className="warning-banner">⚠️ 門檻可能太高，孩子容易放棄，建議降低血量或攻擊點數。</div>
          )}
          <button className="primary-btn" onClick={submitMonster}>
            完成設定
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="stack card" style={{ textAlign: "center", marginTop: 40 }}>
          <h1>🎉 設定完成！</h1>
          <p className="text-muted">現在就去看看孩子的冒險世界吧！</p>
          <button className="primary-btn" onClick={finish}>
            進入 App
          </button>
        </div>
      )}
    </div>
  );
}
