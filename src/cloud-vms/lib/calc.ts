/* ============================================================
   CLOUD VMS — motor de cálculo (VMS na nuvem)
   Porte fiel da calculadora original (calc.js), validado contra
   o Digifort DesignTool. Mantém as mesmas premissas e constantes.
   ============================================================ */

/* ── CONFIGURAÇÕES EDITÁVEIS ── */
export const CONFIG = {
  custoServidorLinux: 650, // R$/servidor Linux/mês
  custoServidorWin: 850, // R$/servidor Windows/mês
  crescimentoAnual: 0.25, // 25% ao ano
  linkPrecoMotion: 2.64, // R$/Mbps/mês (gravação por movimento)
  linkPrecoContinuo: 4.95, // R$/Mbps/mês (gravação contínua)
} as const;

/* ── BITRATES BASE (Mbps) em H.264 a 30 FPS ──
   Calibrado com o Digifort DesignTool (720p@15fps=1.5 → @30fps=3.0). */
export const BITRATES: Record<string, number> = {
  // ── Resoluções principais (pill-group) ──
  d1: 1.5, // D1 / 480p
  "720p": 3.0, // HD 720p
  "1080p": 8.0, // Full HD 1080p
  "3mp": 12.0, // 3 MP
  "4mp": 16.0, // 4 MP
  "5mp": 20.0, // 5 MP
  "4k": 32.0, // 4K / 8 MP
  "12mp": 48.0, // 12 MP
  // ── Resoluções detalhadas (modal "Outros") ──
  "320x240": 0.5,
  "352x240": 0.6,
  "352x288": 0.7,
  "480x270": 0.8,
  "480x360": 0.9,
  "640x360": 1.2,
  "704x240": 1.0,
  "704x244": 1.0,
  "704x288": 1.1,
  "704x480": 1.4,
  "704x488": 1.4,
  "704x576": 1.6,
  "720x240": 1.0,
  "720x244": 1.0,
  "720x288": 1.1,
  "720x480": 1.4,
  "720x488": 1.4,
  "720x576": 1.6,
  "752x582": 1.7,
  "800x450": 1.8,
  "800x600": 2.0,
  "1024x720": 2.8,
  "1024x768": 3.0,
  "1280x720": 3.0,
  "1280x800": 3.5,
  "1280x960": 4.0,
  "1280x1024": 4.5,
  "1600x1200": 6.0,
  "1920x720": 4.0,
  "2048x1536": 12.0,
  "2240x1680": 15.0,
  "2560x1920": 20.0,
  "3032x2008": 28.0,
  "3072x2304": 30.0,
  "3264x2448": 32.0,
};

/* ── RESOLUÇÕES DETALHADAS (modal "Outros") ── */
export const RES_OUTROS: { val: string; label: string }[] = [
  { val: "320x240", label: "320x240" },
  { val: "352x240", label: "352x240" },
  { val: "352x288", label: "352x288" },
  { val: "480x270", label: "480x270" },
  { val: "480x360", label: "480x360" },
  { val: "640x360", label: "640x360" },
  { val: "704x240", label: "704x240" },
  { val: "704x244", label: "704x244" },
  { val: "704x288", label: "704x288" },
  { val: "704x480", label: "704x480" },
  { val: "704x488", label: "704x488" },
  { val: "704x576", label: "704x576" },
  { val: "720x240", label: "720x240" },
  { val: "720x244", label: "720x244" },
  { val: "720x288", label: "720x288" },
  { val: "720x480", label: "720x480" },
  { val: "720x488", label: "720x488" },
  { val: "720x576", label: "720x576" },
  { val: "752x582", label: "752x582" },
  { val: "800x450", label: "800x450" },
  { val: "800x600", label: "800x600" },
  { val: "1024x720", label: "1024x720" },
  { val: "1024x768", label: "1024x768 (1MP)" },
  { val: "1280x720", label: "1280x720 (HD)" },
  { val: "1280x800", label: "1280x800 (1MP)" },
  { val: "1280x960", label: "1280x960 (1.2MP)" },
  { val: "1280x1024", label: "1280x1024 (1.3MP)" },
  { val: "1600x1200", label: "1600x1200 (1.9MP)" },
  { val: "1920x720", label: "1920x720" },
  { val: "2048x1536", label: "2048x1536 (3.1MP)" },
  { val: "2240x1680", label: "2240x1680 (3.8MP)" },
  { val: "2560x1920", label: "2560x1920 (5MP)" },
  { val: "3032x2008", label: "3032x2008 (6.1MP)" },
  { val: "3072x2304", label: "3072x2304 (7.1MP)" },
  { val: "3264x2448", label: "3264x2448 (8MP)" },
];

/* ── FATORES DE CODEC ── */
export const CODEC_FACTORS: Record<string, number> = {
  h264: 1.0,
  h264plus: 0.75,
  h265: 0.5,
  h265plus: 0.35,
};

/* ── FATORES DE RECURSOS DE IA (multiplicadores adicionais de storage/link) ── */
export const RESOURCE_FACTORS: Record<string, { storage: number; link: number }> = {
  analytics: { storage: 0.05, link: 0.1 },
  facial: { storage: 0.08, link: 0.15 },
  lpr: { storage: 0.08, link: 0.2 },
  heatmap: { storage: 0.03, link: 0.05 },
  count: { storage: 0.03, link: 0.05 },
  search: { storage: 0.05, link: 0.08 },
  ai: { storage: 0.1, link: 0.2 },
};

export type OS = "windows" | "linux";

export interface VmsProfile {
  storageOverhead: number;
  linkOverhead: number;
  label: string;
  note: string;
  os: OS;
}

/* ── PERFIS DE VMS ── */
export const VMS_PROFILES: Record<string, VmsProfile> = {
  "segware-edge": { storageOverhead: 1.08, linkOverhead: 1.05, label: "Segware VMS Edge", note: "perfil Linux", os: "linux" },
  "segware-sigma": { storageOverhead: 1.08, linkOverhead: 1.05, label: "Segware Sigma Image", note: "perfil moderado", os: "windows" },
  "segware-egide": { storageOverhead: 1.08, linkOverhead: 1.05, label: "Segware Sigma Egide", note: "perfil Linux", os: "linux" },
  solutio: { storageOverhead: 1.1, linkOverhead: 1.08, label: "Solutio", note: "perfil intermediário", os: "linux" },
  dguard: { storageOverhead: 1.12, linkOverhead: 1.1, label: "D-Guard", note: "ambiente centralizado", os: "windows" },
  hikcentral: { storageOverhead: 1.15, linkOverhead: 1.1, label: "HikCentral Pro", note: "maior uso de metadados", os: "windows" },
  digifort: { storageOverhead: 1.15, linkOverhead: 1.12, label: "Digifort", note: "arquitetura robusta", os: "windows" },
  outro: { storageOverhead: 1.15, linkOverhead: 1.1, label: "Outro VMS", note: "perfil conservador", os: "windows" },
};

export type RecType = "continuous" | "motion" | "commercial" | "custom";

/* ── PLANOS ── */
export function getPlanName(tb: number): string {
  if (tb < 5) return "Cloud VMS Starter";
  if (tb < 20) return "Cloud VMS Business";
  if (tb < 80) return "Cloud VMS Enterprise";
  return "Cloud VMS Premium";
}

/* ── HELPERS ── */
function roundUp500(gb: number): number {
  return Math.ceil(gb / 500) * 500;
}

function calcStorageCost(tb: number): number {
  // Escalonado: R$150 0-5TB, R$130 5-10TB, R$120 10-25TB, R$110 25-50TB, R$100 >50TB
  const brackets = [
    { limit: 5, rate: 150 },
    { limit: 10, rate: 130 },
    { limit: 25, rate: 120 },
    { limit: 50, rate: 110 },
    { limit: Infinity, rate: 100 },
  ];
  let cost = 0;
  let remaining = tb;
  let prev = 0;
  for (const b of brackets) {
    const chunk = Math.min(remaining, b.limit - prev);
    if (chunk <= 0) break;
    cost += chunk * b.rate;
    remaining -= chunk;
    prev = b.limit;
    if (remaining <= 0) break;
  }
  return cost;
}

/* ── ENTRADA DA CALCULADORA ── */
export interface CalcInput {
  vms: string; // chave de VMS_PROFILES
  cameras: number;
  viewers: number;
  resolution: string; // chave de BITRATES
  codec: string; // chave de CODEC_FACTORS
  fps: number;
  retention: number; // dias
  recType: RecType;
  movement: number; // 0.10–1.00 (usado quando recType = motion)
}

/* ── RESULTADO ── */
export interface CalcResult {
  os: OS;
  storageUtilGB: number;
  storageServidorGB: number; // arredondado 500 GB
  linkMinMbps: number;
  linkIdealMbps: number;
  numServers: number;
  consumoMensalGB: number;
  growthTB: number;
  custoPorCamera: number;
  custoVisualizacao: number;
  custoTotal: number;
  planName: string;
}

export const DEFAULT_INPUT: CalcInput = {
  vms: "dguard",
  cameras: 40,
  viewers: 0,
  resolution: "1080p",
  codec: "h265",
  fps: 15,
  retention: 30,
  recType: "continuous",
  movement: 0.4,
};

/* ── CÁLCULO PRINCIPAL (idêntico ao calc.js validado) ── */
export function calculate(input: CalcInput): CalcResult {
  const cameras = Math.max(1, input.cameras || 1);
  const fps = input.fps || 15;
  const viewers = Math.max(0, input.viewers || 0);
  const profile = VMS_PROFILES[input.vms] || VMS_PROFILES.outro;
  const os = profile.os;

  // Bitrate real por câmera @ fps configurado
  const bitrateBase = BITRATES[input.resolution] || 8;
  const fpsFactor = fps / 30;
  const codecFactor = CODEC_FACTORS[input.codec] || 0.5;
  const bitrateCamera = bitrateBase * fpsFactor * codecFactor;

  // Fator de motion para STORAGE (% do tempo gravando)
  let recFactor: number;
  if (input.recType === "continuous") recFactor = 1.0;
  else if (input.recType === "motion") recFactor = input.movement; // 0.10–1.00
  else if (input.recType === "commercial") recFactor = 0.4;
  else recFactor = 0.5;

  // ── STORAGE ──
  const storageDiaGB = (bitrateCamera * recFactor * cameras * 86400) / 8 / 1024;
  const storageUtilGB = storageDiaGB * input.retention;
  const storageServidorGB = storageUtilGB * 1.2 * profile.storageOverhead;
  const storageServ500GB = roundUp500(storageServidorGB);
  const storageServ500TB = storageServ500GB / 1024;
  const storageParaCusto = storageServ500TB;

  // ── LINK (bidirecional) ──
  const linkUploadMbps = bitrateCamera * cameras;
  const linkGravMbps = linkUploadMbps * profile.linkOverhead;
  const linkViewMbps = bitrateCamera * viewers;
  const linkMinMbps = (linkGravMbps + linkViewMbps) * 2;
  const linkIdealMbps = linkMinMbps * 1.3;

  // ── Servidores VMS (até 800 câmeras por VM) ──
  const numServers = Math.max(1, Math.ceil(cameras / 800));

  // ── CUSTO ──
  const custoStorage = calcStorageCost(storageParaCusto);
  const custoServidores = numServers * (os === "linux" ? CONFIG.custoServidorLinux : CONFIG.custoServidorWin);

  // Preço base contínuo do link com desconto por volume de câmeras
  let linkPrecoCont: number;
  if (cameras > 5000) linkPrecoCont = 4.4;
  else if (cameras > 1000) linkPrecoCont = 4.675;
  else linkPrecoCont = CONFIG.linkPrecoContinuo;

  // Em movimento, interpola linearmente entre o preço de motion (0% atividade)
  // e o preço contínuo (100% atividade); demais modos usam o preço contínuo.
  let linkPrecoGrav: number;
  if (input.recType === "motion") {
    linkPrecoGrav = CONFIG.linkPrecoMotion + (linkPrecoCont - CONFIG.linkPrecoMotion) * input.movement;
  } else {
    linkPrecoGrav = linkPrecoCont;
  }

  const custoLinkGrav = Math.ceil(linkGravMbps) * linkPrecoGrav;
  const custoBase = (custoStorage + custoServidores + custoLinkGrav) * 1.25;
  const custoPorCamera = cameras > 0 ? custoBase / cameras : 0;

  // Visualização: R$/Mbps com mínimo de R$15 por usuário simultâneo
  const custoViewPorUsuario = Math.max(15, Math.ceil(linkViewMbps / (viewers || 1)) * linkPrecoGrav);
  const custoVisualizacao = viewers > 0 ? custoViewPorUsuario * viewers : 0;
  const custoTotal = custoBase + custoVisualizacao;

  // Crescimento e consumo mensal
  const growthTB = storageParaCusto * CONFIG.crescimentoAnual;
  const consumoMensalGB = storageDiaGB * 30;

  return {
    os,
    storageUtilGB,
    storageServidorGB: storageServ500GB,
    linkMinMbps,
    linkIdealMbps,
    numServers,
    consumoMensalGB,
    growthTB,
    custoPorCamera,
    custoVisualizacao,
    custoTotal,
    planName: getPlanName(storageParaCusto),
  };
}

/* ── FORMATADORES (pt-BR) ── */
export const fmtR = (n: number) => "R$ " + Math.round(n).toLocaleString("pt-BR");
// Custo por câmera: 2 casas decimais (idêntico ao fmtCam do calc.js de referência)
export const fmtCam = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtNum = (n: number, d = 2) => n.toFixed(d).replace(".", ",");
export const fmtGB = (gb: number) =>
  gb >= 1024 ? fmtNum(gb / 1024) + " TB" : Math.round(gb) + " GB";
export const fmtMbps = (m: number) => Math.ceil(m) + " Mbps";
