import type { ReactNode } from "react";
import { T } from "../theme/tokens";
import type { IconComponent } from "./icons";

/* ───────────── UI COMPARTILHADA ───────────── */
interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  ghost?: boolean;
  className?: string;
  icon?: IconComponent;
}
export function Btn({ children, onClick, ghost, className = "", icon: Icon }: BtnProps) {
  return (
    <button
      onClick={onClick}
      className={`font-ui font-semibold tracking-wide rounded-xl px-6 py-3.5 text-sm inline-flex items-center gap-2 cursor-pointer ${
        ghost ? "border" : "btn-p text-white border-0"
      } ${className}`}
      style={ghost ? { borderColor: T.border, color: T.ink, background: "#fff" } : {}}
    >
      {children}
      {Icon && <Icon size={17} />}
    </button>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span
      className="font-ui font-semibold text-xs tracking-[.22em] uppercase"
      style={{ color: T.orange }}
    >
      {children}
    </span>
  );
}
