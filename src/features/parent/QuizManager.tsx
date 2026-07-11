import { useEffect, useState } from "react";
import { useAppData } from "../../state/AppDataContext";
import { listQuestions, createQuestion, updateQuestion, deleteQuestion, updateSettings } from "../../db/repository";
import type { AgeGroup, Question, QuizSubject } from "../../types";
import { Modal } from "../../components/Modal";

const AGE_GROUPS: AgeGroup[] = ["幼稚園", "小一小二", "小三小四", "小五小六"];
const SUBJECTS: QuizSubject[] = ["國語", "英語", "數學", "安全宣導", "禮貌品格"];

const emptyForm = {
  ageGroup: "小一小二" as AgeGroup,
  subject: "國語" as QuizSubject,
  question: "",
  options: ["", "", ""],
  answerIndex: 0,
  explanation: "",
};

export function QuizManager() {
  const { settings, refreshSettings } = useAppData();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filterAge, setFilterAge] = useState<AgeGroup>("小一小二");
  const [filterSubject, setFilterSubject] = useState<QuizSubject>("國語");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function refresh() {
    setQuestions(await listQuestions());
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!settings) return null;

  async function saveSetting(patch: Parameters<typeof updateSettings>[0]) {
    await updateSettings(patch);
    await refreshSettings();
  }

  async function toggleActive(q: Question) {
    await updateQuestion(q.id, { active: !q.active });
    await refresh();
  }

  async function removeQuestion(q: Question) {
    if (!confirm(`確定要刪除這題「${q.question}」嗎？`)) return;
    await deleteQuestion(q.id);
    await refresh();
  }

  async function submitForm() {
    if (!form.question.trim() || form.options.some((o) => !o.trim())) return;
    await createQuestion({
      ageGroup: form.ageGroup,
      subject: form.subject,
      question: form.question.trim(),
      options: form.options.map((o) => o.trim()),
      answerIndex: form.answerIndex,
      explanation: form.explanation.trim() || "答案正確！",
      active: true,
    });
    setForm(emptyForm);
    setShowForm(false);
    await refresh();
  }

  const filtered = questions.filter((q) => q.ageGroup === filterAge && q.subject === filterSubject);

  return (
    <div className="stack">
      <h3>測驗規則</h3>
      <div className="card stack">
        <label className="text-muted">每天可作答回合數（1~3）</label>
        <input
          type="number"
          min={1}
          max={3}
          value={settings.quizRoundsPerDay ?? 1}
          onChange={(e) =>
            // 夾住範圍：欄位被清空時 Number('')=0，會讓測驗永遠鎖死，一律修正回 1~3
            saveSetting({ quizRoundsPerDay: Math.min(3, Math.max(1, Math.round(Number(e.target.value)) || 1)) })
          }
        />
        <label className="text-muted">5 題全對的獎勵點數</label>
        <input
          type="number"
          min={0}
          value={settings.quizFullScorePoints ?? 5}
          onChange={(e) => saveSetting({ quizFullScorePoints: Math.max(0, Math.round(Number(e.target.value)) || 0) })}
        />
        <label className="text-muted">答對 3~4 題時，每題可得點數</label>
        <input
          type="number"
          min={0}
          value={settings.quizPerCorrectPoints ?? 1}
          onChange={(e) => saveSetting({ quizPerCorrectPoints: Math.max(0, Math.round(Number(e.target.value)) || 0) })}
        />
        <div className="row">
          <input
            type="checkbox"
            checked={settings.quizFullScoreOnly ?? false}
            onChange={(e) => saveSetting({ quizFullScoreOnly: e.target.checked })}
            style={{ width: "auto" }}
          />
          <span>只有 5 題全對才給點（關閉時，答對 3~4 題也能拿部分點數）</span>
        </div>
      </div>

      <div className="row">
        <h3 style={{ flex: 1 }}>題庫管理</h3>
        <button className="primary-btn" onClick={() => setShowForm(true)}>
          + 新增題目
        </button>
      </div>
      <div className="row" style={{ flexWrap: "wrap" }}>
        <select value={filterAge} onChange={(e) => setFilterAge(e.target.value as AgeGroup)} style={{ width: "auto" }}>
          {AGE_GROUPS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value as QuizSubject)} style={{ width: "auto" }}>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <span className="text-muted">共 {filtered.length} 題</span>
      </div>

      <div className="stack">
        {filtered.map((q) => (
          <div key={q.id} className="card stack" style={{ opacity: q.active ? 1 : 0.5 }}>
            <div className="row">
              <span style={{ flex: 1, fontWeight: 700 }}>{q.question}</span>
            </div>
            <div className="text-muted">正解：{q.options[q.answerIndex]}</div>
            <div className="row">
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => toggleActive(q)}>
                {q.active ? "停用" : "啟用"}
              </button>
              <button className="danger-btn" onClick={() => removeQuestion(q)}>
                刪除
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted">這個分類目前沒有題目。</p>}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <div className="stack">
          <h3>新增自訂題目</h3>
          <label className="text-muted">年齡層</label>
          <select value={form.ageGroup} onChange={(e) => setForm({ ...form, ageGroup: e.target.value as AgeGroup })}>
            {AGE_GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <label className="text-muted">科目</label>
          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value as QuizSubject })}>
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <label className="text-muted">題目</label>
          <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          <label className="text-muted">選項（勾選正確答案）</label>
          {form.options.map((opt, i) => (
            <div key={i} className="row">
              <input
                type="radio"
                checked={form.answerIndex === i}
                onChange={() => setForm({ ...form, answerIndex: i })}
                style={{ width: "auto" }}
              />
              <input
                placeholder={`選項 ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const options = [...form.options];
                  options[i] = e.target.value;
                  setForm({ ...form, options });
                }}
              />
            </div>
          ))}
          <label className="text-muted">答錯時的說明</label>
          <input value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
          <div className="row">
            <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
              取消
            </button>
            <button className="primary-btn" style={{ flex: 1 }} onClick={submitForm}>
              儲存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
