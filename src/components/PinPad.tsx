import { useEffect } from "react";

interface PinPadProps {
  value: string;
  length?: number;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
}

export function PinPad({ value, length = 4, onChange, onComplete }: PinPadProps) {
  useEffect(() => {
    if (value.length === length) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  function press(digit: string) {
    if (value.length >= length) return;
    onChange(value + digit);
  }

  function backspace() {
    onChange(value.slice(0, -1));
  }

  return (
    <div className="stack">
      <div className="pin-dots">
        {Array.from({ length }).map((_, i) => (
          <span key={i} className={`dot ${i < value.length ? "filled" : ""}`} />
        ))}
      </div>
      <div className="pin-pad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} onClick={() => press(d)} type="button">
            {d}
          </button>
        ))}
        <button onClick={backspace} type="button" aria-label="刪除">
          ⌫
        </button>
        <button onClick={() => press("0")} type="button">
          0
        </button>
        <span />
      </div>
    </div>
  );
}
