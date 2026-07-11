import { useState } from "react";
import { useAppData } from "../../state/AppDataContext";
import { createChild, updateChild, ensureStarterHeroes } from "../../db/repository";
import type { AgeGroup, Child, QuizSubject } from "../../types";
import { Modal } from "../../components/Modal";
import { ChildAvatar } from "../../components/ChildAvatar";

const AVATAR_OPTIONS = ["🦁", "🐯", "🐰", "🐻", "🐼", "🐨", "🦊", "🐶", "🐱", "🦄", "🐸", "🐵"];
const AGE_GROUPS: AgeGroup[] = ["幼稚園", "小一小二", "小三小四", "小五小六"];
const QUIZ_SUBJECTS: QuizSubject[] = ["國語", "英語", "數學", "安全宣導", "禮貌品格"];

export function ChildManager() {
  const { children, refreshChildren, setSelectedChildId, selectedChildId } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Child | null>(null);
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("小一小二");
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [quizSubjects, setQuizSubjects] = useState<QuizSubject[]>(QUIZ_SUBJECTS);

  function openNew() {
    setEditing(null);
    setName("");
    setAgeGroup("小一小二");
    setAvatar(AVATAR_OPTIONS[0]);
    setQuizSubjects(QUIZ_SUBJECTS);
    setShowForm(true);
  }

  function openEdit(child: Child) {
    setEditing(child);
    setName(child.name);
    setAgeGroup(child.ageGroup);
    setAvatar(child.avatar);
    setQuizSubjects(child.quizSubjects ?? QUIZ_SUBJECTS);
    setShowForm(true);
  }

  function toggleSubject(subject: QuizSubject) {
    setQuizSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  }

  async function submit() {
    if (!name.trim()) return;
    if (editing) {
      await updateChild(editing.id, { name: name.trim(), ageGroup, avatar, quizSubjects });
    } else {
      const child = await createChild({ name: name.trim(), ageGroup, avatar, redemptionWeekday: 0, quizSubjects });
      await ensureStarterHeroes(child.id);
      setSelectedChildId(child.id);
    }
    await refreshChildren();
    setShowForm(false);
  }

  return (
    <div className="stack">
      <div className="row">
        <h3 style={{ flex: 1 }}>孩子管理</h3>
        <button className="primary-btn" onClick={openNew}>
          + 新增孩子
        </button>
      </div>
      {children.map((c) => (
        <div key={c.id} className="card row">
          <ChildAvatar avatar={c.avatar} size={48} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>
              {c.name} {c.id === selectedChildId && <span className="text-muted">（目前選擇）</span>}
            </div>
            <div className="text-muted">
              {c.ageGroup} · 🪙 {c.pointsCache} 點
            </div>
          </div>
          <button className="secondary-btn" onClick={() => setSelectedChildId(c.id)}>
            選擇
          </button>
          <button className="secondary-btn" onClick={() => openEdit(c)}>
            編輯
          </button>
        </div>
      ))}

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <div className="stack">
          <h3>{editing ? "編輯孩子" : "新增孩子"}</h3>
          <input placeholder="孩子的名字" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="text-muted">年齡層</label>
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}>
            {AGE_GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <label className="text-muted">頭像</label>
          <div className="row" style={{ flexWrap: "wrap" }}>
            {AVATAR_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                style={{
                  fontSize: 26,
                  padding: 6,
                  borderRadius: 10,
                  border: a === avatar ? "3px solid var(--color-primary)" : "2px solid var(--color-border)",
                  background: "white",
                }}
              >
                {a}
              </button>
            ))}
          </div>
          <label className="text-muted">每日測驗要出的科目</label>
          <div className="row" style={{ flexWrap: "wrap" }}>
            {QUIZ_SUBJECTS.map((s) => (
              <button
                key={s}
                type="button"
                className="secondary-btn"
                onClick={() => toggleSubject(s)}
                style={{
                  background: quizSubjects.includes(s) ? "var(--color-primary)" : "white",
                  color: quizSubjects.includes(s) ? "white" : "var(--color-text)",
                  padding: "8px 12px",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="row">
            <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
              取消
            </button>
            <button className="primary-btn" style={{ flex: 1 }} onClick={submit} disabled={!name.trim()}>
              儲存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
