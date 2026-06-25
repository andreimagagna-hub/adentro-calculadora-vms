import { T } from "../theme/tokens";

/** Logo oficial da Adentro (servida de `public/`) + selo opcional do produto. */
export function Logo({ badge, height = 26 }: { badge?: string; height?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src="/adentro-logo.png"
        alt="Adentro"
        height={height}
        style={{ height, width: "auto", display: "block" }}
      />
      {badge && (
        <span
          className="font-b font-medium text-xs px-2 py-0.5 rounded-md"
          style={{ background: T.tint, color: T.orange }}
        >
          {badge}
        </span>
      )}
    </span>
  );
}
