/* ───────────── DESIGN TOKENS — marca Adentro (canônico) ─────────────
   Paleta única compartilhada pelo hub e pelas calculadoras. */
export const T = {
  /** Laranja de marca (UI, ícones, destaques). */
  orange: "#EB7342",
  /** Laranja forte para CTAs / ênfase. */
  orangeStrong: "#ED501D",
  /** Acento quente para gradientes. */
  amber: "#F2A24E",
  /** Azul quase-preto — títulos (Barlow). */
  ink: "#0B0D31",
  /** Azul profundo — acentos / hero. */
  inkDeep: "#040B52",
  navy: "#040B52",
  navyL: "#0A1660",
  /** Cinza-grafite — texto corrido (Poppins). */
  body: "#232627",
  bg: "#FFFFFF",
  off: "#FAFAFB",
  border: "#ECECEC",
  gray: "#6B7280",
  /** Tint claro do laranja de marca. */
  tint: "#FDF1EA",
  green: "#16A34A",
  blue: "#3B82F6",
  grad: "linear-gradient(135deg,#ED501D 0%,#EB7342 100%)",
  gradNavy: "linear-gradient(135deg,#040B52 0%,#0A1660 100%)",
} as const;
