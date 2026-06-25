import type { CSSProperties, ReactNode } from "react";

/* ───────────── ICONS (SVG inline, sem dependências) ───────────── */
export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

const mkIcon =
  (children: ReactNode) =>
  ({ size = 16, color = "currentColor", className = "", style }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {children}
    </svg>
  );

export const IconCheck = mkIcon(<path d="M20 6 9 17l-5-5" />);
export const IconChevronLeft = mkIcon(<path d="m15 18-6-6 6-6" />);
export const IconChevronRight = mkIcon(<path d="m9 18 6-6-6-6" />);
export const IconArrowRight = mkIcon(
  <g>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </g>,
);
export const IconAlert = mkIcon(
  <g>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </g>,
);
export const IconClock = mkIcon(
  <g>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </g>,
);
export const IconZap = mkIcon(<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />);
export const IconDownload = mkIcon(
  <g>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </g>,
);
export const IconRefresh = mkIcon(
  <g>
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </g>,
);
export const IconLock = mkIcon(
  <g>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </g>,
);
export const IconDatabase = mkIcon(
  <g>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </g>,
);
export const IconShield = mkIcon(
  <g>
    <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3 8 3Z" />
    <path d="m9 12 2 2 4-4" />
  </g>,
);
export const IconCloud = mkIcon(
  <g>
    <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
    <path d="M12 12v9" />
    <path d="m8 17 4-4 4 4" />
  </g>,
);
export const IconServer = mkIcon(
  <g>
    <rect x="2" y="2" width="20" height="8" rx="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" />
    <path d="M6 6h.01" />
    <path d="M6 18h.01" />
  </g>,
);
export const IconCpu = mkIcon(
  <g>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
  </g>,
);
export const IconTrendDown = mkIcon(
  <g>
    <path d="m22 17-8.5-8.5-5 5L2 7" />
    <path d="M16 17h6v-6" />
  </g>,
);
export const IconActivity = mkIcon(<path d="M22 12h-4l-3 9L9 3l-3 9H2" />);
export const IconSparkles = mkIcon(
  <g>
    <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    <path d="M19 17v4M17 19h4" />
  </g>,
);
export const IconTarget = mkIcon(
  <g>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </g>,
);

/* ── Específicos Cloud VMS ── */
export const IconCamera = mkIcon(
  <g>
    <path d="M5 7H3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
    <rect x="5" y="3" width="14" height="8" rx="1" />
    <circle cx="12" cy="13" r="3" />
  </g>,
);
export const IconVideo = mkIcon(
  <g>
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="m16 10 5-3v10l-5-3" />
  </g>,
);
export const IconWifi = mkIcon(
  <g>
    <path d="M2 8c5.5-5.3 14.5-5.3 20 0M6 12c3.3-3.2 8.7-3.2 12 0M10 16c1.1-1 2.9-1 4 0" />
    <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
  </g>,
);
export const IconGauge = mkIcon(
  <g>
    <path d="M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0" />
    <path d="m9 15 3-6" />
    <circle cx="12" cy="12" r="1" />
  </g>,
);
export const IconBuilding = mkIcon(
  <g>
    <path d="M3 21h18M5 21V9l7-6 7 6v12" />
    <path d="M9 21v-6h6v6M9 9h1M14 9h1M9 13h1M14 13h1" />
  </g>,
);
export const IconTrendUp = mkIcon(
  <g>
    <path d="M3 17 9 11l4 4 8-8" />
    <path d="M14 7h7v7" />
  </g>,
);
export const IconEye = mkIcon(
  <g>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </g>,
);
export const IconUsers = mkIcon(
  <g>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </g>,
);
export const IconSend = mkIcon(<path d="m10 14 11-11M21 3l-7 21-4-8-8-4 19-9z" />);
export const IconMessage = mkIcon(
  <g>
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9z" />
    <path d="M9 10c0 .6.2 1 1 1.5s2 1 2 2-.5 1.5-1.5 1.5-2-.5-2.5-1M14 10h.01" />
  </g>,
);
export const IconCoins = mkIcon(
  <g>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1M12 7v1M12 16v1" />
  </g>,
);

/* ── Selos de validação ── */
export const IconAward = mkIcon(
  <g>
    <circle cx="12" cy="8" r="6" />
    <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
  </g>,
);
export const IconMapPin = mkIcon(
  <g>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </g>,
);
export const IconHeadset = mkIcon(
  <g>
    <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
    <path d="M18 19a2 2 0 1 0 0-4h-1v4h1z" />
    <path d="M4 15a2 2 0 0 0 2 2h1v-4H6a2 2 0 0 0-2 2z" />
    <path d="M20 18a4 4 0 0 1-4 4h-2" />
  </g>,
);
export const IconLockShield = mkIcon(
  <g>
    <path d="M12 3 5 6v5c0 5 3.5 8.4 7 9.5 3.5-1.1 7-4.5 7-9.5V6l-7-3z" />
    <rect x="9.5" y="10.5" width="5" height="4" rx="1" />
    <path d="M10.5 10.5V9a1.5 1.5 0 0 1 3 0v1.5" />
  </g>,
);
export const IconEyeOff = mkIcon(
  <g>
    <path d="M3 3l18 18" />
    <path d="M10.6 10.7a3 3 0 0 0 4 4M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4 10 7a13 13 0 0 1-2.2 3.2M6.1 6.6C3.8 8 2.3 9.9 2 12c1 3 5 7 10 7 1 0 2-.2 2.9-.5" />
  </g>,
);

export type IconComponent = ReturnType<typeof mkIcon>;
