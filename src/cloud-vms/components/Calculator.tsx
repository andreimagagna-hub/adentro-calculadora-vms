import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import "../calc-html.css";
import { ProposalForm } from "./ProposalForm";
import {
  IconChevronLeft,
  IconCamera,
  IconVideo,
  IconWifi,
  IconGauge,
  IconServer,
  IconDatabase,
  IconClock,
  IconCheck,
  type IconComponent,
} from "./icons";
import {
  calculateGroups,
  groupMetrics,
  makeGroup,
  fmtR,
  fmtCam,
  fmtGB,
  fmtMbps,
  VMS_PROFILES,
  BITRATES,
  CODEC_FACTORS,
  RES_OUTROS,
  type GroupInput,
  type GroupMetrics,
  type CalcResult,
  type RecType,
} from "../lib/calc";
import type { Lead } from "../lib/api";

interface CalculatorProps {
  lead: Lead;
  onHome?: () => void;
  onBack?: () => void;
}

/* ── VMS (logos = texto estilizado, idêntico ao HTML) ── */
const VMS_OPTIONS: { id: string; name: string; logo: ReactNode }[] = [
  { id: "segware-edge", name: "VMS Edge", logo: <span style={{ fontSize: 13, fontWeight: 800, color: "#1565C0", letterSpacing: "-0.5px" }}>segware</span> },
  { id: "segware-sigma", name: "Sigma Image", logo: <span style={{ fontSize: 13, fontWeight: 800, color: "#1565C0", letterSpacing: "-0.5px" }}>segware</span> },
  { id: "solutio", name: "Solutio", logo: <span style={{ fontSize: 16, fontWeight: 800, color: "#EB7342", fontStyle: "italic" }}>solutio</span> },
  { id: "dguard", name: "D-Guard", logo: <span style={{ fontSize: 12, fontWeight: 800, color: "#1A1A2E", letterSpacing: "1px" }}>D-GUARD</span> },
  { id: "hikcentral", name: "HikCentral Pro", logo: <span style={{ fontSize: 11, fontWeight: 800, color: "#E51937" }}>HikCentral Pro</span> },
  { id: "digifort", name: "Digifort", logo: <span style={{ fontSize: 14, fontWeight: 800, color: "#E85D04", letterSpacing: "-0.5px" }}>digifort</span> },
  { id: "outro", name: "Outro VMS", logo: <IconCamera size={26} color="#6B7280" /> },
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

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

type RecModalState = { groupId: string; type: "commercial" | "custom" } | null;

/* ───────────── CALCULADORA ───────────── */
export function Calculator({ lead, onHome, onBack }: CalculatorProps) {
  const [vms, setVms] = useState("dguard");
  const [groups, setGroups] = useState<GroupInput[]>(() => [makeGroup({ name: "Grupo 1" })]);
  const [showProposal, setShowProposal] = useState(false);
  const [resModalGroup, setResModalGroup] = useState<string | null>(null);
  const [recModal, setRecModal] = useState<RecModalState>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const result = useMemo(() => calculateGroups(vms, groups), [vms, groups]);
  const profile = VMS_PROFILES[vms] || VMS_PROFILES.outro;
  const multiGroup = groups.length > 1;

  /* Métricas + custo por grupo. O custo é rateado a partir do custo standalone
     de cada grupo, normalizado para somar exatamente o custo total agregado
     (que tem descontos de volume), permitindo comparação e total coerentes. */
  const perGroup = useMemo(() => {
    const rows = groups.map((g) => ({ g, m: groupMetrics(g), standalone: calculateGroups(vms, [g]).custoTotal }));
    const sum = rows.reduce((s, r) => s + r.standalone, 0) || 1;
    return rows.map((r) => ({ ...r, share: r.standalone / sum, cost: result.custoTotal * (r.standalone / sum) }));
  }, [groups, vms, result.custoTotal]);
  const costById = (id: string) => perGroup.find((r) => r.g.id === id)?.cost ?? 0;

  const updateGroup = (id: string, patch: Partial<GroupInput>) =>
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const addGroup = () =>
    setGroups((gs) => {
      const last = gs[gs.length - 1];
      return [...gs, makeGroup({ ...last, name: `Grupo ${gs.length + 1}` })];
    });

  const removeGroup = (id: string) =>
    setGroups((gs) => (gs.length > 1 ? gs.filter((g) => g.id !== id) : gs));

  const toggleCollapse = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  const setAllCollapsed = (val: boolean) =>
    setCollapsed(Object.fromEntries(groups.map((g) => [g.id, val])));
  const allCollapsed = groups.length > 1 && groups.every((g) => collapsed[g.id]);

  const selectRec = (g: GroupInput, recType: RecType) => {
    updateGroup(g.id, { recType });
    if (recType === "commercial" || recType === "custom") setRecModal({ groupId: g.id, type: recType });
  };

  return (
    <div className="vmscalc">
      {/* HEADER */}
      <header className="vmscalc-header">
        <div className="vmscalc-header-inner">
          {onHome ? (
            <button onClick={onHome} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }} aria-label="Página inicial">
              <img src="/adentro-logo-horizontal.png" alt="Adentro Tecnologia" style={{ height: 26, display: "block" }} />
            </button>
          ) : (
            <img src="/adentro-logo-horizontal.png" alt="Adentro Tecnologia" style={{ height: 26, display: "block" }} />
          )}
          {onBack && (
            <button onClick={onBack} className="vmscalc-back">
              <IconChevronLeft size={14} /> Voltar
            </button>
          )}
        </div>
      </header>

      <div className="vmscalc-section">
        <div className="vmscalc-intro-title">Configure seu projeto de VMS</div>
        <div className="vmscalc-intro-sub">
          Olá{lead.nome ? `, ${lead.nome.split(" ")[0]}` : ""} — adicione um ou mais grupos de câmeras e veja o dimensionamento em tempo real.
        </div>

        {/* STEP 1 — VMS */}
        <div className="step-block">
          <div className="step-header">
            <div className="step-num">1</div>
            <div>
              <div className="step-title">Qual VMS você utiliza?</div>
              <div className="step-sub">Selecione a plataforma de gerenciamento de vídeo do seu projeto</div>
            </div>
          </div>
          <div className="vms-cards">
            {VMS_OPTIONS.map((v) => (
              <div key={v.id} className={`vms-card${vms === v.id ? " selected" : ""}`} onClick={() => setVms(v.id)}>
                <div className="vms-card-logo">{v.logo}</div>
                <div className="vms-card-name">{v.name}</div>
                <div className="check"><IconCheck size={12} color="#fff" /></div>
              </div>
            ))}
          </div>
          <div className="vms-msg">
            <IconCheck size={15} color="#1B5E20" />
            <span>Perfil <strong>{profile.label}</strong> ({profile.os === "linux" ? "Linux" : "Windows"}) — {profile.note}. O cálculo é ajustado ao perfil da plataforma.</span>
          </div>
        </div>

        {/* STEP 2 — grade */}
        <div className="step-block" style={{ marginBottom: 0 }}>
          <div className="step-header">
            <div className="step-num">2</div>
            <div>
              <div className="step-title">Dimensione seus grupos de câmeras</div>
              <div className="step-sub">Cada grupo tem sua própria configuração; o total é somado no painel ao lado.</div>
            </div>
          </div>

          <div className="calc-grid">
            {/* FORM */}
            <div>
              {multiGroup && (
                <div className="groups-toolbar">
                  <span>{groups.length} grupos</span>
                  <button type="button" onClick={() => setAllCollapsed(!allCollapsed)}>
                    {allCollapsed ? "Expandir todos" : "Recolher todos"}
                  </button>
                </div>
              )}

              <div>
                {groups.map((g, idx) => (
                  <GroupBlock
                    key={g.id}
                    group={g}
                    index={idx}
                    canRemove={multiGroup}
                    collapsed={!!collapsed[g.id]}
                    costMonthly={costById(g.id)}
                    onToggleCollapse={() => toggleCollapse(g.id)}
                    onChange={(patch) => updateGroup(g.id, patch)}
                    onRemove={() => removeGroup(g.id)}
                    onSelectRec={(rt) => selectRec(g, rt)}
                    onOpenResModal={() => setResModalGroup(g.id)}
                  />
                ))}
              </div>

              <button type="button" className="add-group-btn" onClick={addGroup}>
                + Adicionar Grupo de Câmeras
              </button>

              {multiGroup && <GroupsOverview rows={perGroup} result={result} onRemove={removeGroup} />}
            </div>

            {/* RESULTADO */}
            <div className="calc-result-panel">
              <div className="result-header">
                <div className="result-title"><span className="result-dot" /> Resultado em tempo real</div>
                <span className="result-badge">Tempo real</span>
              </div>

              <div className="result-metrics">
                <ResultMetric icon={IconDatabase} bg="rgba(235,115,66,.15)" color="#EB7342" label="Armazenamento útil calculado" value={fmtGB(result.storageUtilGB)} valClass="orange" />
                <ResultMetric icon={IconWifi} bg="rgba(56,160,255,.15)" color="#60AEFF" label="Link de internet (ideal)" value={fmtMbps(result.linkIdealMbps)} />
                <ResultMetric icon={IconServer} bg="rgba(93,202,165,.15)" color="#5DCAA5" label="Servidores VMS estimados" value={`${result.numServers} ${result.numServers > 1 ? "servidores" : "servidor"} (${result.os === "linux" ? "Linux" : "Windows"})`} valClass="green" />
              </div>

              <div className="result-divider" />

              <div className="plan-box">
                <div className="plan-label">Plano recomendado Adentro</div>
                <div className="plan-name">{result.planName}</div>
                <div className="plan-features">
                  <span className="plan-feat">SLA 24×7</span>
                  <span className="plan-feat">Datacenters Tier III</span>
                  <span className="plan-feat">Suporte especializado</span>
                </div>
              </div>

              <div className="price-box">
                <div className="price-label">Custo estimado por câmera</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span className="price-val">{fmtCam(result.custoPorCamera)}</span>
                  <span className="price-period">/câmera mês</span>
                </div>
                <div className="price-total">
                  <span className="price-total-lbl">Total mensal estimado</span>
                  <span className="price-total-val">{fmtR(result.custoTotal)}</span>
                </div>
                <div className="price-note">Os valores são estimativas técnicas e comerciais. O projeto final será validado por um especialista da Adentro.</div>
              </div>

              <div className="result-btns">
                <button className="result-btn-primary" onClick={() => setShowProposal(true)}>Quero proteger meu projeto</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showProposal && (
        <ProposalForm lead={lead} vms={vms} groups={groups} result={result} onClose={() => setShowProposal(false)} />
      )}

      {resModalGroup && (
        <ResModal
          current={groups.find((g) => g.id === resModalGroup)?.resolution ?? "1080p"}
          onSelect={(v) => { updateGroup(resModalGroup, { resolution: v }); setResModalGroup(null); }}
          onClose={() => setResModalGroup(null)}
        />
      )}

      {recModal?.type === "commercial" && (
        <CommercialModal onApply={(pct) => { updateGroup(recModal.groupId, { recPct: pct }); setRecModal(null); }} onClose={() => setRecModal(null)} />
      )}

      {recModal?.type === "custom" && (
        <CustomModal
          initial={Math.round((groups.find((g) => g.id === recModal.groupId)?.recPct ?? 0.5) * 100)}
          onApply={(pct) => { updateGroup(recModal.groupId, { recPct: pct / 100 }); setRecModal(null); }}
          onClose={() => setRecModal(null)}
        />
      )}
    </div>
  );
}

/* ───────────── BLOCO DE GRUPO ───────────── */
function GroupBlock({
  group: g, index, canRemove, collapsed, costMonthly, onToggleCollapse, onChange, onRemove, onSelectRec, onOpenResModal,
}: {
  group: GroupInput; index: number; canRemove: boolean; collapsed: boolean; costMonthly: number;
  onToggleCollapse: () => void;
  onChange: (patch: Partial<GroupInput>) => void; onRemove: () => void;
  onSelectRec: (rt: RecType) => void; onOpenResModal: () => void;
}) {
  const isMainRes = RESOLUTIONS.some((r) => r.id === g.resolution);
  const outrosLabel = RES_OUTROS.find((r) => r.val === g.resolution)?.label;
  const resLabel = RESOLUTIONS.find((r) => r.id === g.resolution)?.label ?? outrosLabel ?? g.resolution;
  const recLabel = REC_TYPES.find((r) => r.id === g.recType)?.label ?? "";

  return (
    <div className={`calc-form-panel${collapsed ? " is-collapsed" : ""}`}>
      <div className="group-head">
        <button className="group-toggle" onClick={onToggleCollapse} aria-label={collapsed ? "Expandir" : "Recolher"} aria-expanded={!collapsed}>
          <IconChevronLeft size={16} />
        </button>
        <div className="step-num" style={{ width: 28, height: 28, fontSize: 13 }}>{index + 1}</div>
        <input className="group-name-input" type="text" value={g.name} onChange={(e) => onChange({ name: e.target.value })} aria-label="Nome do grupo" />
        <span className="group-head-cost">{fmtR(costMonthly)}<small>/mês</small></span>
        {canRemove && <button className="group-remove" onClick={onRemove}>Remover</button>}
      </div>

      {collapsed && (
        <div className="group-collapsed-summary">
          <span><strong>{g.cameras}</strong> câm</span>
          <span>{resLabel}</span>
          <span>{recLabel}</span>
          <span>{g.fps} FPS · {g.retention} dias</span>
        </div>
      )}

      {!collapsed && (<>
      {/* 1 · Câmeras */}
      <div className="form-section">
        <div className="form-section-title"><span className="form-section-num">1</span><IconCamera size={14} color="#EB7342" /> Quantidade de câmeras</div>
        <div className="cam-counter">
          <button className="cam-btn" onClick={() => onChange({ cameras: Math.max(1, g.cameras - 10) })}>−</button>
          <input className="cam-input" type="number" min={1} max={9999} value={g.cameras} onChange={(e) => onChange({ cameras: Math.max(1, parseInt(e.target.value) || 1) })} />
          <button className="cam-btn" onClick={() => onChange({ cameras: g.cameras + 10 })}>+</button>
          <span className="cam-unit">câmeras</span>
        </div>
      </div>

      {/* 2 · Resolução */}
      <div className="form-section">
        <div className="form-section-title"><span className="form-section-num">2</span><IconVideo size={14} color="#EB7342" /> Resolução média</div>
        <div className="pill-group">
          {RESOLUTIONS.map((o) => (
            <div key={o.id} className={`pill-opt${g.resolution === o.id ? " active" : ""}`} onClick={() => onChange({ resolution: o.id })}>{o.label}</div>
          ))}
          <div className={`pill-opt${!isMainRes ? " active" : ""}`} onClick={onOpenResModal}>Outros ▾</div>
        </div>
        {!isMainRes && outrosLabel && (
          <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 8 }}>Resolução selecionada: <strong style={{ color: "var(--navy)" }}>{outrosLabel}</strong></div>
        )}
      </div>

      {/* 3 FPS + 4 Codec */}
      <div className="form-row">
        <div className="form-section">
          <div className="form-section-title"><span className="form-section-num">3</span><IconGauge size={14} color="#EB7342" /> Taxa de quadros (FPS)</div>
          <SliderInput value={g.fps} min={5} max={24} step={1} unit="FPS" onChange={(v) => onChange({ fps: v })} />
        </div>
        <div className="form-section">
          <div className="form-section-title"><span className="form-section-num">4</span><IconServer size={14} color="#EB7342" /> Codec de compressão</div>
          <div className="pill-group">
            {CODECS.map((o) => (
              <div key={o.id} className={`pill-opt${g.codec === o.id ? " active" : ""}`} onClick={() => onChange({ codec: o.id })}>{o.label}</div>
            ))}
          </div>
        </div>
      </div>

      {/* 5 Retenção */}
      <div className="form-section">
        <div className="form-section-title"><span className="form-section-num">5</span><IconClock size={14} color="#EB7342" /> Dias de retenção</div>
        <SliderInput value={g.retention} min={1} max={365} step={1} unit="dias" ticks={[1, 30, 90, 180, 365]} onChange={(v) => onChange({ retention: v })} />
      </div>

      {/* 6 Tipo de gravação */}
      <div className="form-section">
        <div className="form-section-title"><span className="form-section-num">6</span><IconVideo size={14} color="#EB7342" /> Tipo de gravação</div>
        <div className="rec-grid">
          {REC_TYPES.map((r) => (
            <div key={r.id} className={`rec-btn${g.recType === r.id ? " active" : ""}`} onClick={() => onSelectRec(r.id)}>
              <div className="rec-btn-icon-wrap"><r.icon size={22} color={g.recType === r.id ? "#EB7342" : "#6B7280"} /></div>
              <div className="rec-btn-label">{r.label}</div>
            </div>
          ))}
        </div>
        {g.recType === "motion" && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray)", marginBottom: 4 }}>Sensibilidade de movimento</div>
            <div className="slider-row">
              <input type="range" min={10} max={100} step={10} value={Math.round(g.movement * 100)} onChange={(e) => onChange({ movement: parseInt(e.target.value) / 100 })} />
              <div className="slider-val"><span style={{ width: 40, textAlign: "right", fontWeight: 700, color: "var(--navy)" }}>{Math.round(g.movement * 100)}</span><span className="unit">%</span></div>
            </div>
          </div>
        )}
        {(g.recType === "commercial" || g.recType === "custom") && (
          <div className="rec-note">Gravando <strong style={{ color: "var(--navy)" }}>{Math.round((g.recPct || 0) * 100)}%</strong> do tempo.</div>
        )}
      </div>
      </>)}
    </div>
  );
}

/* Slider editável (range + número) — idêntico ao HTML */
function SliderInput({ value, min, max, step, unit, ticks, onChange }: { value: number; min: number; max: number; step: number; unit: string; ticks?: number[]; onChange: (v: number) => void }) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div>
      <div className="slider-row">
        <input type="range" min={min} max={max} step={step} value={clamp(value)} onChange={(e) => onChange(clamp(parseInt(e.target.value)))} />
        <div className="slider-val">
          <input
            type="number" min={min} max={max} value={value}
            onChange={(e) => { const n = parseInt(e.target.value); if (!Number.isNaN(n)) onChange(Math.min(max, n)); }}
            onBlur={(e) => onChange(clamp(parseInt(e.target.value) || min))}
          />
          <span className="unit">{unit}</span>
        </div>
      </div>
      {ticks && <div className="slider-ticks">{ticks.map((t) => <span key={t}>{t}</span>)}</div>}
    </div>
  );
}

/* ───────────── RESUMO / COMPARATIVO DOS GRUPOS ───────────── */
interface OverviewRow { g: GroupInput; m: GroupMetrics; standalone: number; share: number; cost: number }
function GroupsOverview({ rows, result, onRemove }: { rows: OverviewRow[]; result: CalcResult; onRemove: (id: string) => void }) {
  const totalCameras = rows.reduce((s, r) => s + r.m.cameras, 0);
  return (
    <div className="summary-card">
      <h3>Resumo dos grupos</h3>
      <div style={{ overflowX: "auto" }}>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Grupo</th><th>Câmeras</th><th>Storage útil</th><th>Custo/mês</th><th>% do total</th><th className="act">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ g, m, share, cost }) => (
              <tr key={g.id}>
                <td className="name">{g.name}</td>
                <td>{m.cameras} câm</td>
                <td>{fmtGB(m.storageUtilGB)}</td>
                <td className="cost">{fmtR(cost)}</td>
                <td>
                  <div className="share-cell">
                    <div className="share-bar"><span style={{ width: `${Math.round(share * 100)}%` }} /></div>
                    <span className="share-pct">{Math.round(share * 100)}%</span>
                  </div>
                </td>
                <td className="act"><button onClick={() => onRemove(g.id)} aria-label={`Remover ${g.name}`}>×</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>{totalCameras} câm</td>
              <td>{fmtGB(result.storageUtilGB)}</td>
              <td className="cost">{fmtR(result.custoTotal)}</td>
              <td>100%</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="summary-note">Custo por grupo é um rateio proporcional; o total reflete os descontos de volume do projeto.</div>
    </div>
  );
}

/* ───────────── MODAIS ───────────── */
function ModalShell({ title, sub, children, onClose }: { title: string; sub?: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="vmscalc-modal" onClick={onClose}>
      <div className="vmscalc-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="vmscalc-modal-close" onClick={onClose} aria-label="Fechar">×</button>
        <div className="vmscalc-modal-title">{title}</div>
        {sub && <div className="vmscalc-modal-sub">{sub}</div>}
        {children}
      </div>
    </div>
  );
}

function CommercialModal({ onApply, onClose }: { onApply: (pct: number) => void; onClose: () => void }) {
  const [days, setDays] = useState<boolean[]>([true, true, true, true, true, false, false]);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("18:00");
  const apply = () => {
    const daysCount = days.filter(Boolean).length;
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    const hoursPerDay = Math.max(0, h2 + m2 / 60 - (h1 + m1 / 60));
    onApply((daysCount * hoursPerDay) / (24 * 7));
  };
  return (
    <ModalShell title="Horário comercial" sub="Defina os dias e o horário de gravação." onClose={onClose}>
      <div className="hc-days">
        {WEEKDAYS.map((d, i) => (
          <button key={d} className={`hc-day${days[i] ? " on" : ""}`} onClick={() => setDays((p) => p.map((v, idx) => (idx === i ? !v : v)))}>{d}</button>
        ))}
      </div>
      <div className="hc-times">
        <div><label>Início</label><input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div>
        <div><label>Fim</label><input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
      </div>
      <button className="modal-apply" onClick={apply}>Aplicar</button>
    </ModalShell>
  );
}

function CustomModal({ initial, onApply, onClose }: { initial: number; onApply: (pct: number) => void; onClose: () => void }) {
  const [pct, setPct] = useState(initial);
  return (
    <ModalShell title="Percentual personalizado" sub="Percentual do tempo em que as câmeras gravam." onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <input
          type="number" min={0} max={100} value={pct}
          onChange={(e) => setPct(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
          style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1.5px solid var(--lgray)", fontFamily: "inherit", fontSize: 16, fontWeight: 700, color: "var(--navy)", outline: "none" }}
        />
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--orange)" }}>%</span>
      </div>
      <button className="modal-apply" onClick={() => onApply(pct)}>Aplicar</button>
    </ModalShell>
  );
}

function ResModal({ current, onSelect, onClose }: { current: string; onSelect: (v: string) => void; onClose: () => void }) {
  return (
    <ModalShell title="Resolução personalizada" sub="Selecione uma resolução específica do seu projeto" onClose={onClose}>
      <div className="res-grid">
        {RES_OUTROS.map((r) => (
          <button key={r.val} className={current === r.val ? "on" : ""} onClick={() => onSelect(r.val)}>{r.label}</button>
        ))}
      </div>
    </ModalShell>
  );
}

/* Métrica do painel de resultado */
function ResultMetric({ icon: Icon, bg, color, label, value, valClass }: { icon: IconComponent; bg: string; color: string; label: string; value: string; valClass?: "orange" | "green" }) {
  const iconStyle: CSSProperties = { background: bg, color };
  return (
    <div className="result-metric">
      <div className="rm-left">
        <div className="rm-icon" style={iconStyle}><Icon size={16} color={color} /></div>
        <div className="rm-label">{label}</div>
      </div>
      <div className={`rm-val${valClass ? " " + valClass : ""}`}>{value}</div>
    </div>
  );
}
