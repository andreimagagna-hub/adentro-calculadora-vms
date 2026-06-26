import { useMemo, useState } from "react";
import { T } from "../theme/tokens";
import { Logo } from "./Logo";
import { ProposalForm } from "./ProposalForm";
import {
  IconChevronLeft,
  IconCamera,
  IconVideo,
  IconWifi,
  IconGauge,
  IconTrendUp,
  IconServer,
  IconDatabase,
  IconClock,
  IconShield,
  IconCheck,
  IconEye,
  type IconComponent,
} from "./icons";
import {
  calculate,
  fmtR,
  fmtCam,
  fmtGB,
  fmtMbps,
  fmtNum,
  VMS_PROFILES,
  BITRATES,
  CODEC_FACTORS,
  RES_OUTROS,
  DEFAULT_INPUT,
  type CalcInput,
  type RecType,
} from "../lib/calc";
import type { Lead } from "../lib/api";

interface CalculatorProps {
  lead: Lead;
  onHome?: () => void;
  onBack?: () => void;
}

/* ── Opções de UI ── */
const VMS_OPTIONS: { id: string; brand: string; name: string }[] = [
  { id: "segware-edge", brand: "segware", name: "VMS Edge" },
  { id: "segware-sigma", brand: "segware", name: "Sigma Image" },
  { id: "segware-egide", brand: "segware", name: "Sigma Egide" },
  { id: "solutio", brand: "solutio", name: "Solutio" },
  { id: "dguard", brand: "D-GUARD", name: "D-Guard" },
  { id: "hikcentral", brand: "HikCentral", name: "HikCentral Pro" },
  { id: "digifort", brand: "digifort", name: "Digifort" },
  { id: "outro", brand: "—", name: "Outro VMS" },
];

const RESOLUTIONS: { id: keyof typeof BITRATES; label: string }[] = [
  { id: "d1", label: "D1 480p" },
  { id: "720p", label: "HD 720p" },
  { id: "1080p", label: "Full HD 1080p" },
  { id: "3mp", label: "3 MP" },
  { id: "4mp", label: "4 MP" },
  { id: "5mp", label: "5 MP" },
  { id: "4k", label: "8 MP / 4K" },
  { id: "12mp", label: "12 MP" },
];

const CODECS: { id: keyof typeof CODEC_FACTORS; label: string }[] = [
  { id: "h264", label: "H.264" },
  { id: "h264plus", label: "H.264+" },
  { id: "h265", label: "H.265" },
  { id: "h265plus", label: "H.265+" },
];

const REC_TYPES: { id: RecType; label: string; icon: IconComponent }[] = [
  { id: "continuous", label: "24×7 contínuo", icon: IconClock },
  { id: "motion", label: "Por movimento", icon: IconGauge },
  { id: "commercial", label: "Horário comercial", icon: IconVideo },
  { id: "custom", label: "Personalizado", icon: IconCamera },
];

/* ───────────── CALCULADORA ───────────── */
export function Calculator({ lead, onHome, onBack }: CalculatorProps) {
  const [input, setInput] = useState<CalcInput>(DEFAULT_INPUT);
  const [showProposal, setShowProposal] = useState(false);
  const [resModalOpen, setResModalOpen] = useState(false);

  const result = useMemo(() => calculate(input), [input]);
  const set = <K extends keyof CalcInput>(k: K, v: CalcInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const profile = VMS_PROFILES[input.vms] || VMS_PROFILES.outro;

  // Resolução "Outros": ativa quando a resolução escolhida não está nas pills principais
  const isMainRes = RESOLUTIONS.some((r) => r.id === input.resolution);
  const outrosLabel = RES_OUTROS.find((r) => r.val === input.resolution)?.label;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.off }}>
      {/* HEADER */}
      <header className="border-b sticky top-0 z-20" style={{ borderColor: T.border, background: "#fff" }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          {onHome ? (
            <button onClick={onHome} className="bg-transparent border-0 p-0 cursor-pointer" aria-label="Página inicial">
              <Logo height={24} badge="Cloud VMS" />
            </button>
          ) : (
            <span className="inline-flex"><Logo height={24} badge="Cloud VMS" /></span>
          )}
          <button
            onClick={onBack}
            className="font-ui font-semibold text-xs flex items-center gap-1 cursor-pointer bg-transparent border-0"
            style={{ color: T.gray }}
          >
            <IconChevronLeft size={14} /> Voltar
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-5 py-4 md:py-6">
        <div className="fade-up">
          <h1 className="font-d font-semibold" style={{ color: T.ink, fontSize: "clamp(1.25rem,2.2vw,1.6rem)", letterSpacing: "-.01em" }}>
            Configure seu projeto de VMS
          </h1>
          <p className="font-b mt-1 text-sm" style={{ color: T.gray }}>
            Olá{lead.nome ? `, ${lead.nome.split(" ")[0]}` : ""} — ajuste os parâmetros e veja o dimensionamento em tempo real.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-4 lg:gap-5 items-start">
          {/* ── PAINEL DE CONFIGURAÇÃO (compacto: 3 blocos) ── */}
          <div className="space-y-3 min-w-0">
            {/* 1 · VMS */}
            <Card>
              <SectionTitle n={1} icon={IconShield}>Qual VMS você utiliza?</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {VMS_OPTIONS.map((v) => {
                  const active = input.vms === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => set("vms", v.id)}
                      className="relative rounded-xl border px-2 py-2 text-center cursor-pointer transition"
                      style={{
                        borderColor: active ? T.orange : T.border,
                        background: active ? T.tint : "#fff",
                        boxShadow: active ? "0 4px 14px rgba(242,97,48,.14)" : "none",
                      }}
                    >
                      {active && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: T.orange }}>
                          <IconCheck size={10} color="#fff" />
                        </span>
                      )}
                      <div className="font-d font-bold text-sm" style={{ color: T.ink }}>{v.brand}</div>
                      <div className="font-b text-[11px] mt-0.5" style={{ color: T.gray }}>{v.name}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 rounded-xl px-3 py-2 flex items-start gap-2 text-xs font-b" style={{ background: "#E8F5E9", color: "#1B5E20" }}>
                <IconCheck size={14} />
                <span>
                  Perfil <strong>{profile.label}</strong> ({profile.os === "linux" ? "Linux" : "Windows"}) — {profile.note}.
                </span>
              </div>
            </Card>

            {/* 2 · Câmeras e qualidade de imagem */}
            <Card>
              <SectionTitle n={2} icon={IconCamera}>Câmeras e qualidade de imagem</SectionTitle>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 mt-3">
                <Field label="Quantidade de câmeras">
                  <Counter value={input.cameras} onChange={(v) => set("cameras", Math.max(1, v))} step={10} min={1} />
                </Field>
                <Field label="Dias de retenção">
                  <Counter value={input.retention} onChange={(v) => set("retention", v)} step={5} min={0} max={365} />
                </Field>
              </div>

              <Field label="Resolução média" className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {RESOLUTIONS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => set("resolution", o.id)}
                      className={`pill font-b text-xs font-semibold rounded-lg border px-3 py-2 ${input.resolution === o.id ? "active" : ""}`}
                      style={input.resolution === o.id ? {} : { borderColor: T.border, color: T.body, background: "#fff" }}
                    >
                      {o.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setResModalOpen(true)}
                    className={`pill font-b text-xs font-semibold rounded-lg border px-3 py-2 ${!isMainRes ? "active" : ""}`}
                    style={!isMainRes ? {} : { borderColor: T.border, color: T.body, background: "#fff" }}
                  >
                    Outros ▾
                  </button>
                </div>
                {!isMainRes && outrosLabel && (
                  <div className="font-b text-xs mt-2" style={{ color: T.gray }}>
                    Personalizada: <strong style={{ color: T.ink }}>{outrosLabel}</strong>
                  </div>
                )}
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 mt-3">
                <Field label="Frames por segundo (FPS)">
                  <Counter value={input.fps} onChange={(v) => set("fps", v)} step={1} min={3} max={30} />
                </Field>
                <Field label="Codec">
                  <Pills options={CODECS} value={input.codec} onChange={(v) => set("codec", v)} />
                </Field>
              </div>
            </Card>

            {/* 3 · Gravação e acesso */}
            <Card>
              <SectionTitle n={3} icon={IconVideo}>Gravação e acesso</SectionTitle>

              <Field label="Tipo de gravação" className="mt-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {REC_TYPES.map((r) => {
                    const active = input.recType === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => set("recType", r.id)}
                        className="rounded-xl border px-2 py-2 flex flex-col items-center gap-1 cursor-pointer transition"
                        style={{
                          borderColor: active ? T.orange : T.border,
                          background: active ? T.tint : "#fff",
                          color: active ? T.orangeStrong : T.gray,
                        }}
                      >
                        <r.icon size={18} color={active ? T.orange : T.gray} />
                        <span className="font-b text-[11px] font-semibold text-center leading-tight" style={{ color: active ? T.ink : T.gray }}>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
                {input.recType === "motion" && (
                  <div className="mt-3">
                    <div className="font-b text-xs font-semibold mb-1" style={{ color: T.gray }}>Sensibilidade de movimento</div>
                    <Slider
                      value={Math.round(input.movement * 100)}
                      min={10}
                      max={100}
                      step={10}
                      onChange={(v) => set("movement", v / 100)}
                      display={`${Math.round(input.movement * 100)}%`}
                    />
                  </div>
                )}
              </Field>

              <Field label="Visualização de câmeras" className="mt-3">
                <Counter value={input.viewers} onChange={(v) => set("viewers", Math.max(0, v))} step={1} min={0} />
              </Field>
            </Card>
          </div>

          {/* ── PAINEL DE RESULTADO (fixo, com preço sempre visível) ── */}
          <div className="lg:sticky lg:top-20 min-w-0">
            <div
              className="rounded-3xl overflow-hidden border bg-white flex flex-col lg:max-h-[calc(100vh-6rem)]"
              style={{ borderColor: T.border, boxShadow: "0 24px 64px rgba(4,12,82,.1)" }}
            >
              {/* topo escuro — sempre visível */}
              <div className="px-6 py-4 shrink-0" style={{ background: T.gradNavy }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-ui font-semibold text-sm" style={{ color: "#fff" }}>
                    <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: "#5dca80", boxShadow: "0 0 0 3px rgba(93,202,165,.25)" }} />
                    Resultado em tempo real
                  </div>
                  <span className="font-b text-[11px] px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>
                    {result.planName}
                  </span>
                </div>
              </div>

              {/* PREÇO — por câmera em destaque, total menor embaixo — sempre visível */}
              <div className="px-6 pt-5 pb-4 shrink-0" style={{ background: T.tint, borderBottom: `1px solid ${T.orange}22` }}>
                <div className="font-b text-xs font-semibold" style={{ color: T.gray }}>Investimento por câmera</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-d font-bold leading-none" style={{ color: T.orangeStrong, fontSize: "clamp(2.4rem,4vw,3rem)" }}>
                    {fmtCam(result.custoPorCamera)}
                  </span>
                  <span className="font-b text-sm" style={{ color: T.gray }}>/câm·mês</span>
                </div>
                <div className="font-b text-sm mt-1.5" style={{ color: T.body }}>
                  Total estimado{" "}
                  <strong className="font-d font-bold" style={{ color: T.ink }}>{fmtR(result.custoTotal)}</strong>
                  <span style={{ color: T.gray }}>/mês</span>
                </div>
              </div>

              {/* MÉTRICAS — rola internamente, sem empurrar o preço pra fora */}
              <div className="bg-white px-6 py-4 space-y-2 overflow-y-auto flex-1 min-h-0">
                <Metric icon={IconDatabase} color={T.orange} label="Armazenamento útil" value={fmtGB(result.storageUtilGB)} />
                <Metric icon={IconServer} color={T.orange} label="Storage do servidor (com overhead)" value={fmtGB(result.storageServidorGB)} />
                <Metric icon={IconWifi} color={T.blue} label="Link ideal recomendado" value={fmtMbps(result.linkIdealMbps)} />
                <Metric icon={IconWifi} color={T.gray} label="Link mínimo" value={fmtMbps(result.linkMinMbps)} />
                <Metric icon={IconServer} color={T.green} label="Servidores VMS estimados" value={`${result.numServers} ${result.numServers > 1 ? "servidores" : "servidor"} (${result.os === "linux" ? "Linux" : "Windows"})`} />
                <Metric icon={IconDatabase} color={T.blue} label="Consumo mensal" value={`${fmtGB(result.consumoMensalGB)}/mês`} />
                <Metric icon={IconTrendUp} color={T.amber} label="Crescimento anual" value={`${fmtNum(result.growthTB)} TB/ano`} />
                {input.viewers > 0 && (
                  <Metric icon={IconEye} color={T.green} label={`Visualização (${input.viewers} câmeras)`} value={`${fmtR(result.custoVisualizacao)}/mês`} highlight />
                )}
                <p className="font-b text-[11px] pt-1" style={{ color: T.gray, lineHeight: 1.5 }}>
                  Estimativa técnica e comercial. O projeto final é validado por um especialista da Adentro conforme ambiente, VMS, retenção e disponibilidade.
                </p>
              </div>

              {/* CTA — sempre visível */}
              <div className="px-6 py-4 shrink-0 border-t" style={{ borderColor: T.border }}>
                <button
                  onClick={() => setShowProposal(true)}
                  className="btn-p text-white border-0 w-full rounded-xl px-5 py-3.5 font-ui font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  Falar com o time comercial
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showProposal && (
        <ProposalForm
          lead={lead}
          input={input}
          result={result}
          onClose={() => setShowProposal(false)}
        />
      )}

      {resModalOpen && (
        <ResModal
          current={input.resolution}
          onSelect={(v) => {
            set("resolution", v);
            setResModalOpen(false);
          }}
          onClose={() => setResModalOpen(false)}
        />
      )}
    </div>
  );
}

/* ── MODAL: resolução personalizada (detalhada) ── */
function ResModal({ current, onSelect, onClose }: { current: string; onSelect: (v: string) => void; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[900] flex items-center justify-center"
      style={{ background: "rgba(4,12,82,.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl p-7 w-[92%] max-w-[540px] max-h-[80vh] flex flex-col"
        style={{ boxShadow: "0 20px 60px rgba(4,12,82,.25)" }}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3.5 right-3.5 w-[30px] h-[30px] rounded-lg border-0 cursor-pointer flex items-center justify-center text-lg"
          style={{ background: T.off, color: T.gray }}
        >
          ×
        </button>
        <div className="font-d font-bold text-sm" style={{ color: T.navy }}>Resolução personalizada</div>
        <div className="font-b text-xs mt-1 mb-4" style={{ color: T.gray }}>Selecione uma resolução específica do seu projeto</div>
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-2">
            {RES_OUTROS.map((r) => {
              const active = current === r.val;
              return (
                <button
                  key={r.val}
                  onClick={() => onSelect(r.val)}
                  className="font-b text-xs font-medium rounded-lg border px-3 py-2.5 text-left cursor-pointer transition"
                  style={{
                    borderColor: active ? T.orange : T.border,
                    background: active ? T.tint : T.off,
                    color: active ? T.orangeStrong : T.body,
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── SUBCOMPONENTES ───────────── */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4 md:p-5" style={{ borderColor: T.border, boxShadow: "0 2px 8px rgba(4,12,82,.04)" }}>
      {children}
    </div>
  );
}

function SectionTitle({ n, icon: Icon, children }: { n: number; icon: IconComponent; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-6 h-6 rounded-lg flex items-center justify-center font-d font-bold text-xs shrink-0" style={{ background: T.navy, color: "#fff" }}>{n}</span>
      <Icon size={16} color={T.orange} />
      <span className="font-d font-semibold text-sm" style={{ color: T.ink }}>{children}</span>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="font-b text-xs font-semibold mb-1.5" style={{ color: T.gray }}>{label}</div>
      {children}
    </div>
  );
}

function Counter({ value, onChange, step, min, max, unit }: { value: number; onChange: (v: number) => void; step: number; min: number; max?: number; unit?: string }) {
  const clamp = (v: number) => Math.min(max ?? Infinity, Math.max(min, v));
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(clamp(value - step))} className="w-9 h-9 shrink-0 rounded-xl border font-d font-bold text-lg cursor-pointer" style={{ borderColor: T.border, color: T.ink, background: "#fff" }}>−</button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(parseInt(e.target.value) || min))}
        className="font-d font-bold text-center flex-1 min-w-0 rounded-xl border px-2 py-2 text-base"
        style={{ borderColor: T.border, color: T.ink }}
      />
      <button onClick={() => onChange(clamp(value + step))} className="w-9 h-9 shrink-0 rounded-xl border font-d font-bold text-lg cursor-pointer" style={{ borderColor: T.border, color: T.ink, background: "#fff" }}>+</button>
      {unit && <span className="font-b text-sm shrink-0" style={{ color: T.gray }}>{unit}</span>}
    </div>
  );
}

function Slider({ value, min, max, step, onChange, display }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void; display: string }) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="flex-1" />
      <span
        className="font-d font-bold text-sm text-right whitespace-nowrap rounded-lg px-2.5 py-1"
        style={{ minWidth: 64, color: T.navy, background: T.tint, border: `1px solid ${T.orange}4d` }}
      >
        {display}
      </span>
    </div>
  );
}

function Pills<V extends string>({ options, value, onChange }: { options: { id: V; label: string }[]; value: V; onChange: (v: V) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`pill font-b text-xs font-semibold rounded-lg border px-3 py-2 ${value === o.id ? "active" : ""}`}
          style={value === o.id ? {} : { borderColor: T.border, color: T.body, background: "#fff" }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Metric({ icon: Icon, color, label, value, highlight }: { icon: IconComponent; color: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5"
      style={highlight ? { background: `${color}14`, border: `1px solid ${color}33` } : {}}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}26`, color }}>
          <Icon size={16} color={color} />
        </span>
        <span className="font-b text-xs" style={{ color: T.gray }}>{label}</span>
      </div>
      <span className="font-d font-bold text-sm text-right whitespace-nowrap" style={{ color: T.ink }}>{value}</span>
    </div>
  );
}
