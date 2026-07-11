import { useEffect } from "react";
import { useAppData } from "../../state/AppDataContext";

export function PointsCelebration() {
  const { celebration, clearCelebration, selectedChildId } = useAppData();

  const show = !!celebration && celebration.childId === selectedChildId;

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => clearCelebration(), 3200);
    return () => clearTimeout(timer);
  }, [show, clearCelebration]);

  if (!show || !celebration) return null;

  return (
    <div className="celebration-overlay" onClick={clearCelebration}>
      <div className="coin-burst">{celebration.points > 0 ? "🪙" : "🌟"}</div>
      <div className="celebration-title">因為你【{celebration.title}】</div>
      {celebration.points > 0 ? (
        <div className="celebration-points">獲得 {celebration.points} 點！</div>
      ) : (
        <div className="celebration-points" style={{ fontSize: 28 }}>
          太棒了！
        </div>
      )}
      <div className="celebration-quote">{celebration.encouragement}</div>
    </div>
  );
}
