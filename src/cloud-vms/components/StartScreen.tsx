import { useEffect, useState } from "react";
import { T } from "../theme/tokens";
import { Btn } from "./ui";
import { Logo } from "./Logo";
import {
  IconArrowRight,
  IconChevronLeft,
  IconCamera,
  IconWifi,
  IconCoins,
  IconLock,
  IconCheck,
  type IconComponent,
} from "./icons";
import { useEmbeddedContact, mergeContact, readTrackingFromUrl, TRACKING_KEYS } from "../../lib/embed";
import { findLeadByEmail, type Lead } from "../lib/api";

interface StartScreenProps {
  onStart: (lead: Lead) => void;
  onHome?: () => void;
}

/* ─── Picklists oficiais do Salesforce — tudo "só clique", sem digitação ─── */
const CARGOS = [
  "CEO / Sócio / VP",
  "C-Level / Diretor",
  "Gerente / Head",
  "Coordenador / Supervisor",
  "Analista / Assistente / Técnico / Desenvolvedor",
  "Consultor Externo",
];
const FUNCIONARIOS = [
  "1–9 funcionários",
  "10–49 funcionários",
  "50–199 funcionários",
  "200–499 funcionários",
  "500–999 funcionários",
  "Mais de 1000 funcionários",
];
const PREVISOES = [
  "Em até 30 dias / 1 mês",
  "Em até 3 meses",
  "Em até 6 meses",
  "Em até 12 meses / 1 ano",
  "Sem previsão",
];

const PERKS: { i: IconComponent; t: string; d: string }[] = [
  { i: IconCamera, t: "Storage dimensionado", d: "Armazenamento útil e do servidor calculados pelo seu número de câmeras e retenção." },
  { i: IconWifi, t: "Link recomendado", d: "Banda mínima e ideal para gravação e visualização simultânea sem perda de frame." },
  { i: IconCoins, t: "Custo mensal estimado", d: "Investimento previsível por câmera e total — validado depois por um especialista." },
];

/* ───────────── QUALIFICAÇÃO (gate da calculadora /cloud-vms/calcular) ─────────────
   Contato (nome, e-mail, empresa, WhatsApp) já vem do formulário do site (Elementor),
   correlacionado por um ID oculto na URL. Aqui captamos só a qualificação. */
export function StartScreen({ onStart }: StartScreenProps) {
  const [lead, setLead] = useState<Lead>({
    nome: "",
    sobrenome: "",
    empresa: "",
    email: "",
    whatsapp: "",
    cargo: "",
    funcionarios: "",
    cotando: "",
    previsao: "",
  });
  const [step, setStep] = useState<1 | 2>(1);
  const [loginMode, setLoginMode] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  useEffect(() => {
    document.title = "Calculadora de VMS na Nuvem — Adentro Tecnologia";
    // captura tracking de campanha (UTMs + gclid) da URL → campos ocultos
    const tracking = readTrackingFromUrl();
    if (Object.keys(tracking).length) setLead((p) => ({ ...p, ...tracking }));
  }, []);
  // Contato pode vir do site (URL/postMessage do iframe) quando embedada;
  // no domínio próprio (seg.adentro.com.br) é preenchido aqui mesmo.
  useEmbeddedContact((c) => setLead((p) => mergeContact(p, c)));

  const set = (k: keyof Lead) => (v: string) => setLead((p) => ({ ...p, [k]: v }));
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((lead.email ?? "").trim());
  const step1Ready = Boolean(
    lead.nome?.trim() &&
      lead.sobrenome?.trim() &&
      lead.empresa?.trim() &&
      emailValido &&
      lead.whatsapp?.trim(),
  );
  const step2Ready = Boolean(lead.cargo && lead.funcionarios && lead.cotando && lead.previsao);
  const loginEmailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim());

  const handleLogin = async () => {
    if (!loginEmailValido) return;
    setLoginLoading(true);
    setLoginError(null);
    const result = await findLeadByEmail(loginEmail);
    setLoginLoading(false);
    if (result.ok) {
      onStart(result.lead);
    } else {
      setLoginError("E-mail não encontrado. Faça seu cadastro para acessar a calculadora.");
    }
  };

  const goNext = () => {
    setStep(2);
    window.scrollTo(0, 0);
  };
  const goPrev = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.off }}>
      <header className="border-b" style={{ borderColor: T.border, background: "#fff" }}>
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-center">
          <span className="inline-flex"><Logo height={24} /></span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-10 md:py-16 grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">
        {/* Lado esquerdo — contexto */}
        <div className="fade-up">
          <span className="font-ui font-semibold text-xs tracking-[.22em] uppercase" style={{ color: T.orange }}>
            Calculadora Cloud VMS
          </span>
          <h1
            className="font-d font-semibold mt-4"
            style={{ color: T.ink, fontSize: "clamp(1.7rem,3vw,2.3rem)", lineHeight: 1.12, letterSpacing: "-.01em" }}
          >
            Dimensione seu VMS na nuvem em segundos
          </h1>
          <p className="font-b mt-4 text-base max-w-md" style={{ color: T.body, lineHeight: 1.6 }}>
            Storage, link e custo mensal calculados em tempo real conforme suas câmeras, resolução,
            codec e política de retenção. Sem HD para falhar, sem surpresa no orçamento.
          </p>

          <ul className="mt-8 space-y-4" style={{ listStyle: "none", padding: 0 }}>
            {PERKS.map((p) => (
              <li key={p.t} className="flex gap-3.5">
                <span className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center" style={{ background: T.tint }}>
                  <p.i size={18} color={T.orange} />
                </span>
                <div>
                  <p className="font-b font-semibold text-sm" style={{ color: T.ink, margin: 0 }}>{p.t}</p>
                  <p className="font-b text-sm" style={{ color: T.gray, margin: "2px 0 0" }}>{p.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Lado direito — wizard (2 etapas) */}
        <div className="fade-up" style={{ animationDelay: ".1s" }}>
          <div className="rounded-3xl border bg-white p-7 md:p-9" style={{ borderColor: T.border, boxShadow: "0 24px 64px rgba(4,12,82,.08)" }}>
            {loginMode ? (
              /* ── LOGIN POR E-MAIL ── */
              <div className="fade-up">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.tint }}>
                    <IconArrowRight size={18} color={T.orange} />
                  </span>
                  <div>
                    <h2 className="font-d font-semibold text-xl md:text-2xl" style={{ color: T.ink }}>Acesso rápido</h2>
                    <p className="font-b text-sm mt-0.5" style={{ color: T.gray }}>Entre com o e-mail que você já cadastrou.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Input label="E-mail cadastrado" value={loginEmail} onChange={(v) => { setLoginEmail(v.trim()); setLoginError(null); }} placeholder="voce@empresa.com.br" inputMode="email" autoComplete="email" />
                  {loginError && (
                    <div className="rounded-xl px-4 py-3 font-b text-xs flex items-center gap-2" style={{ background: "#FCEBEB", color: "#B42318", border: "1px solid #F2B8B5" }}>{loginError}</div>
                  )}
                </div>
                <div className="mt-7">
                  <Btn icon={IconArrowRight} className={`w-full justify-center ${loginEmailValido && !loginLoading ? "" : "opacity-50 pointer-events-none"}`} onClick={handleLogin}>
                    {loginLoading ? "Buscando…" : "Acessar calculadora"}
                  </Btn>
                </div>
                <div className="mt-5 text-center">
                  <button type="button" onClick={() => { setLoginMode(false); setLoginError(null); }} className="font-b text-sm cursor-pointer bg-transparent border-0 underline" style={{ color: T.gray }}>← Voltar ao cadastro</button>
                </div>
              </div>
            ) : (
              /* ── CADASTRO ORIGINAL (2 etapas) ── */
              <>
            <Stepper step={step} />

            {step === 1 ? (
              <div className="fade-up">
                <h2 className="font-d font-semibold text-xl md:text-2xl" style={{ color: T.ink }}>
                  Seus dados
                </h2>
                <p className="font-b text-sm mt-1.5 mb-6" style={{ color: T.gray }}>
                  Para liberar a calculadora e o especialista falar com você.
                </p>

                <div className="space-y-4">
                  {/* campos ocultos — tracking de campanha (UTMs + gclid) */}
                  {TRACKING_KEYS.map((k) => (
                    <input key={k} type="hidden" name={k} value={(lead[k] as string) ?? ""} readOnly />
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Nome" value={lead.nome ?? ""} onChange={set("nome")} placeholder="Seu nome" autoComplete="given-name" />
                    <Input label="Sobrenome" value={lead.sobrenome ?? ""} onChange={set("sobrenome")} placeholder="Seu sobrenome" autoComplete="family-name" />
                  </div>
                  <Input label="Empresa" value={lead.empresa ?? ""} onChange={set("empresa")} placeholder="Nome da empresa" autoComplete="organization" />
                  <Input
                    label="E-mail"
                    value={lead.email ?? ""}
                    onChange={(v) => set("email")(v.trim())}
                    placeholder="voce@empresa.com.br"
                    inputMode="email"
                    autoComplete="email"
                  />
                  <Input
                    label="Telefone"
                    value={lead.whatsapp ?? ""}
                    onChange={(v) => set("whatsapp")(maskPhone(v))}
                    placeholder="(00) 00000-0000"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>

                <div className="mt-7">
                  <Btn
                    icon={IconArrowRight}
                    className={`w-full justify-center ${step1Ready ? "" : "opacity-50 pointer-events-none"}`}
                    onClick={goNext}
                  >
                    Continuar
                  </Btn>
                  <p className="font-b text-xs mt-3 flex items-center gap-1.5" style={{ color: "#9CA3AF" }}>
                    <IconLock size={12} /> Seus dados ficam seguros e não são compartilhados.
                  </p>
                </div>

                {/* Link para login direto */}
                <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: T.border }}>
                  <button type="button" onClick={() => setLoginMode(true)} className="font-b text-sm cursor-pointer bg-transparent border-0" style={{ color: T.orange }}>
                    Já acessou antes? <span className="underline font-semibold">Entrar com seu e-mail</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="fade-up">
                <h2 className="font-d font-semibold text-xl md:text-2xl" style={{ color: T.ink }}>
                  Sobre o seu projeto
                </h2>
                <p className="font-b text-sm mt-1.5 mb-6" style={{ color: T.gray }}>
                  Quatro toques para o especialista preparar a proposta certa.
                </p>

                <div className="space-y-4">
                  <Select label="Qual o seu cargo" value={lead.cargo ?? ""} onChange={set("cargo")} options={CARGOS} />
                  <Select
                    label="Quantidade de funcionários"
                    value={lead.funcionarios ?? ""}
                    onChange={set("funcionarios")}
                    options={FUNCIONARIOS}
                  />
                  <Toggle
                    label="Você já está cotando com outras empresas?"
                    value={lead.cotando ?? ""}
                    onChange={set("cotando")}
                    options={["Sim", "Não"]}
                  />
                  <Select
                    label="Tempo estimado para iniciar o projeto"
                    value={lead.previsao ?? ""}
                    onChange={set("previsao")}
                    options={PREVISOES}
                  />
                </div>

                <div className="mt-7 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="font-ui font-semibold text-sm rounded-xl border px-4 py-3 cursor-pointer flex items-center gap-1.5 shrink-0"
                    style={{ borderColor: T.border, color: T.body, background: "#fff" }}
                  >
                    <IconChevronLeft size={15} /> Voltar
                  </button>
                  <Btn
                    icon={IconArrowRight}
                    className={`flex-1 justify-center ${step2Ready ? "" : "opacity-50 pointer-events-none"}`}
                    onClick={() => onStart(lead)}
                  >
                    Acessar a calculadora
                  </Btn>
                </div>
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* Indicador de progresso das 2 etapas do gate. */
function Stepper({ step }: { step: 1 | 2 }) {
  const items = [
    { n: 1, label: "Contato" },
    { n: 2, label: "Projeto" },
  ];
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2">
        {items.map((it, i) => {
          const done = step > it.n;
          const active = step === it.n;
          return (
            <div key={it.n} className="flex items-center gap-2 flex-1">
              <span
                className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-ui font-semibold text-xs transition-colors"
                style={{
                  background: active || done ? T.grad : T.tint,
                  color: active || done ? "#fff" : T.gray,
                }}
              >
                {done ? <IconCheck size={14} color="#fff" /> : it.n}
              </span>
              <span
                className="font-ui font-semibold text-xs uppercase tracking-wide"
                style={{ color: active ? T.ink : T.gray }}
              >
                {it.label}
              </span>
              {i === 0 && (
                <span className="flex-1 h-px ml-1" style={{ background: step > 1 ? T.orange : T.border }} />
              )}
            </div>
          );
        })}
      </div>
      <p className="font-b text-xs mt-2.5" style={{ color: "#9CA3AF" }}>
        Etapa {step} de 2
      </p>
    </div>
  );
}

/* Máscara simples de telefone BR: (00) 00000-0000 */
function maskPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.replace(/^(\d{0,2})/, "($1");
  if (d.length <= 6) return d.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "tel" | "email";
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="font-b text-xs font-semibold" style={{ color: T.gray }}>
        {label}<span style={{ color: T.orange }}> *</span>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="font-b mt-1.5 w-full rounded-xl border px-4 py-3 text-sm bg-white"
        style={{ borderColor: T.border, color: T.ink }}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="font-b text-xs font-semibold" style={{ color: T.gray }}>
        {label}<span style={{ color: T.orange }}> *</span>
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-b mt-1.5 w-full rounded-xl border px-4 py-3 text-sm bg-white"
        style={{ borderColor: T.border, color: value ? T.ink : T.gray }}
      >
        <option value="" disabled>Selecione uma opção</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <span className="font-b text-xs font-semibold" style={{ color: T.gray }}>
        {label}<span style={{ color: T.orange }}> *</span>
      </span>
      <div className="mt-1.5 grid grid-cols-2 gap-2.5">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              className="font-ui font-semibold text-sm rounded-xl border px-4 py-3 cursor-pointer transition-colors"
              style={{
                borderColor: on ? T.orange : T.border,
                background: on ? T.tint : "#fff",
                color: on ? T.orangeStrong : T.body,
              }}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
