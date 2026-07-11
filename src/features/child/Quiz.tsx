import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../state/AppDataContext";
import { getQuizStatus, startQuizRound, submitQuizResult, logQuizAttempt } from "../../db/repository";
import type { QuizStatus } from "../../db/repository";
import type { Question } from "../../types";
import { randomEncouragement, randomNoPointPraise } from "../../content/encouragements";

type Stage = "intro" | "playing" | "result";

export function Quiz() {
  const { selectedChild, pushCelebration } = useAppData();
  const navigate = useNavigate();
  const [status, setStatus] = useState<QuizStatus | null>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [awardedPoints, setAwardedPoints] = useState(0);

  useEffect(() => {
    (async () => {
      if (!selectedChild) return;
      setStatus(await getQuizStatus(selectedChild.id));
    })();
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

  async function startRound() {
    if (!selectedChild) return;
    const round = await startQuizRound(selectedChild.id);
    setQuestions(round);
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setStage("playing");
  }

  function choose(optionIndex: number) {
    if (selected !== null || !selectedChild) return;
    setSelected(optionIndex);
    const q = questions[index];
    const isCorrect = optionIndex === q.answerIndex;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    }
    logQuizAttempt(selectedChild.id, q.subject, isCorrect);
  }

  async function next() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      return;
    }
    if (!selectedChild) return;
    const result = await submitQuizResult(
      selectedChild.id,
      questions.map((q) => q.id),
      correctCount
    );
    setAwardedPoints(result.awardedPoints);
    setStage("result");
    setStatus(await getQuizStatus(selectedChild.id));

    if (result.awardedPoints > 0) {
      pushCelebration({
        childId: selectedChild.id,
        title: "每日小測驗",
        points: result.awardedPoints,
        encouragement: randomEncouragement(),
      });
    } else {
      pushCelebration({
        childId: selectedChild.id,
        title: "每日小測驗",
        points: 0,
        encouragement: randomNoPointPraise(),
      });
    }
  }

  if (stage === "intro" || questions.length === 0) {
    return (
      <div className="screen">
        <div className="row">
          <button className="link-btn" onClick={() => navigate("/")}>
            ← 返回
          </button>
        </div>
        <div className="card stack" style={{ alignItems: "center", textAlign: "center", marginTop: 24 }}>
          <div style={{ fontSize: 56 }}>📝</div>
          <h2>每日小測驗</h2>
          <p className="text-muted">隨機 5 題，答對可以獲得點數！</p>
          {status && (
            <p className="text-muted">
              今天已作答 {status.roundsUsedToday} / {status.roundsAllowed} 回合
            </p>
          )}
          {status && !status.canPlay ? (
            <div className="warning-banner">今天的測驗次數已經用完囉，明天再來挑戰！</div>
          ) : (
            <button className="primary-btn" onClick={startRound}>
              開始測驗
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === "playing") {
    const q = questions[index];
    return (
      <div className="screen">
        <div className="row">
          <span className="text-muted">
            第 {index + 1} / {questions.length} 題
          </span>
          <span className="spacer" />
          <span className="badge">{q.subject}</span>
        </div>

        <div className="card stack">
          <h3>{q.question}</h3>
        </div>

        <div className="stack">
          {q.options.map((opt, i) => {
            let variant = "";
            if (selected !== null) {
              if (i === q.answerIndex) variant = "quiz-correct";
              else if (i === selected) variant = "quiz-wrong";
            }
            return (
              <button key={i} className={`task-card quiz-option ${variant}`} onClick={() => choose(i)} disabled={selected !== null}>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="card stack">
            <p style={{ fontWeight: 700 }}>{selected === q.answerIndex ? "答對了！🎉" : "答錯了，沒關係～"}</p>
            <p className="text-muted">{q.explanation}</p>
            <button className="primary-btn" onClick={next}>
              {index + 1 < questions.length ? "下一題" : "看結果"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="card stack" style={{ alignItems: "center", textAlign: "center", marginTop: 24 }}>
        <div style={{ fontSize: 56 }}>{correctCount === 5 ? "🏆" : "📚"}</div>
        <h2>{correctCount === 5 ? "全對！太厲害了！" : "測驗結束！"}</h2>
        <p>
          答對 {correctCount} / {questions.length} 題
        </p>
        {awardedPoints > 0 ? <p className="gold">獲得 🪙 {awardedPoints} 點！</p> : <p className="text-muted">這次沒有獲得點數，再接再厲！</p>}
        <button className="primary-btn" onClick={() => navigate("/")}>
          回首頁
        </button>
      </div>
    </div>
  );
}
