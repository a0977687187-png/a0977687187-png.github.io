import type { ReactNode } from "react";

interface BigButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function BigButton({ icon, label, onClick, disabled }: BigButtonProps) {
  return (
    <button className="big-button" onClick={onClick} disabled={disabled}>
      <span className="icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
