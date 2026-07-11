import { useEffect, useState } from "react";
import { getMonsterLines } from "../content/monsterDialogue";

interface DialogueBubbleProps {
  monsterId: string;
  intervalMs?: number;
}

// 怪獸台詞輪播氣泡：每隔一段時間換一句符合該怪獸壞習慣的台詞。
export function DialogueBubble({ monsterId, intervalMs = 4000 }: DialogueBubbleProps) {
  const lines = getMonsterLines(monsterId);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % lines.length);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, intervalMs);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monsterId, intervalMs]);

  return (
    <div className="dialogue-bubble">
      {lines[index]}
    </div>
  );
}
