import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { T } from "../theme/tokens";
import { Eyebrow } from "../components/ui";
import { Logo } from "../components/Logo";
import {
  IconArrowRight,
  IconCheck,
  IconCamera,
  IconWifi,
  IconServer,
  IconDatabase,
  IconCoins,
  IconTrendUp,
  IconShield,
  IconAlert,
  IconBuilding,
  IconGauge,
  IconAward,
  IconMapPin,
  IconHeadset,
  IconLockShield,
  IconEyeOff,
  IconRefresh,
  type IconComponent,
} from "../components/icons";

/* selos de validação (igual referência das certificações) */
const SEALS: { i: IconComponent; t: string; d: string; bg: string; fg: string }[] = [
  { i: IconLockShield, t: "LGPD", d: "Conformidade auditada — dados de clientes protegidos por lei e por contrato.", bg: "#E8F5E9", fg: "#2E7D32" },
  { i: IconAward, t: "ISO 27001", d: "Padrão global de segurança da informação, renovado anualmente por auditoria.", bg: "#E3F2FD", fg: "#0D47A1" },
  { i: IconEyeOff, t: "ISO 27701", d: "Privacidade de dados como processo — não como política de papel.", bg: "#EDE7F6", fg: "#4527A0" },
  { i: IconBuilding, t: "Datacenter Tier III", d: "99,982% de disponibilidade de infraestrutura — dados em solo brasileiro.", bg: "#FFF4EF", fg: "#D94F1E" },
  { i: IconCheck, t: "SOC 2 Type II", d: "Auditoria externa rigorosa dos controles de segurança e disponibilidade.", bg: "#E8EAF6", fg: "#283593" },
  { i: IconHeadset, t: "Suporte 24×7", d: "Pessoa real, resposta em minutos. Sem fila de ticket, sem horário comercial.", bg: "#FFF4EF", fg: "#D94F1E" },
  { i: IconRefresh, t: "Backup + Disaster Recovery", d: "Se um datacenter cai, outro assume. Suas gravações nunca somem.", bg: "#E8F5E9", fg: "#2E7D32" },
  { i: IconMapPin, t: "100% Brasil", d: "Latência mínima, soberania de dados e conformidade com a legislação nacional.", bg: "#FFFBEB", fg: "#B45309" },
];

const CALC = "/cloud-vms/calcular";

/* ───────────── BOTÃO QUE NAVEGA PARA A CALCULADORA ───────────── */
function CtaButton({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Link
      to={CALC}
      className={`font-ui font-semibold tracking-wide rounded-xl px-5 py-3 text-sm inline-flex items-center gap-2 cursor-pointer btn-p text-white border-0 ${className}`}
      style={{ textDecoration: "none" }}
    >
      {children}
      <IconArrowRight size={16} />
    </Link>
  );
}

/* ───────────── PAINEL VISUAL DO HERO ───────────── */
function HeroPanel() {
  return (
    <div className="relative">
      <div
        className="rounded-3xl p-5"
        style={{ background: T.gradNavy, boxShadow: "0 30px 70px rgba(4,11,82,.28)" }}
      >
        {/* grid de câmeras */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md flex items-center justify-center"
              style={{ background: T.navyL, aspectRatio: "16/9", border: i === 4 ? `1.5px solid ${T.orange}` : "none" }}
            >
              <IconCamera size={16} color={i === 4 ? T.orange : "rgba(255,255,255,.35)"} />
            </div>
          ))}
        </div>
        {/* card de resultado */}
        <div className="rounded-2xl bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: "#5dca80" }} />
            <span className="font-ui font-semibold text-[11px]" style={{ color: T.gray }}>Resultado em tempo real</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Mock label="Armazenamento útil" value="24,7 TB" color={T.orange} />
            <Mock label="Link ideal" value="255 Mbps" color={T.blue} />
            <Mock label="Plano" value="Cloud VMS Enterprise" color={T.ink} small />
            <Mock label="Investimento/mês" value="R$ 6.696" color={T.orange} />
          </div>
          <div className="mt-3 rounded-lg px-3 py-2.5 flex items-center gap-2" style={{ background: "#E8F5E9" }}>
            <IconShield size={15} color={T.green} />
            <span className="font-b text-[11px] font-medium" style={{ color: "#1B5E20" }}>
              SLA 99,93% · ISO 27001 · Tier III Brasil
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mock({ label, value, color, small }: { label: string; value: string; color: string; small?: boolean }) {
  return (
    <div>
      <div className="font-b text-[10px]" style={{ color: T.gray }}>{label}</div>
      <div className="font-d font-bold mt-0.5" style={{ color, fontSize: small ? "0.8rem" : "1.1rem" }}>{value}</div>
    </div>
  );
}

/* ───────────── LANDING (rota /cloud-vms) ───────────── */
export function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);
  useEffect(() => {
    document.title = "Calculadora de VMS na Nuvem — Adentro Tecnologia";
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const stats = [
    { k: "85", l: "Índice de recomendação (NPS)" },
    { k: "13", l: "anos provendo soluções" },
    { k: "99,93%", l: "SLA de disponibilidade" },
    { k: "1.590", l: "clientes em todo o Brasil" },
    { k: "4", l: "data centers no Brasil" },
  ];

  const pains = [
    { i: IconAlert, t: "“O HD vai falhar — só não sei quando”", d: "Cada disco local é uma bomba-relógio: troca imprevisível e gravação perdida no pior dia." },
    { i: IconCamera, t: "“Cadê a imagem que o cliente pediu?”", d: "Sem retenção garantida, a câmera certa estava fora do ar exatamente na hora crítica." },
    { i: IconTrendUp, t: "“Subdimensionei o storage de novo”", d: "Errar o cálculo de armazenamento e link custa caro — em retrabalho e em credibilidade." },
  ];

  const calcula = [
    { i: IconDatabase, t: "Armazenamento", d: "Storage útil e do servidor, com overhead do VMS e da política de retenção." },
    { i: IconWifi, t: "Link recomendado", d: "Banda mínima e ideal para gravação e visualização simultânea sem perder frame." },
    { i: IconServer, t: "Servidores VMS", d: "Quantidade estimada de servidores conforme o número de câmeras e plataforma." },
    { i: IconCoins, t: "Custo mensal", d: "Investimento previsível por câmera e total, com storage escalonado por TB." },
    { i: IconGauge, t: "Crescimento", d: "Projeção anual de armazenamento para o projeto não estourar no futuro." },
    { i: IconShield, t: "Plano Adentro", d: "Recomendação do plano (Starter a Premium) adequado ao seu dimensionamento." },
  ];

  const deliver = [
    { i: IconDatabase, t: "Storage dimensionado", d: "Armazenamento útil e do servidor calculados em tempo real." },
    { i: IconWifi, t: "Link ideal e mínimo", d: "A banda que o projeto exige para gravar e visualizar com folga." },
    { i: IconCoins, t: "Custo por câmera", d: "Investimento previsível, sem surpresa no orçamento do cliente." },
    { i: IconShield, t: "Plano recomendado", d: "O plano Adentro certo para o tamanho do seu VMS." },
    { i: IconBuilding, t: "Compatível com seu VMS", d: "Segware, Solutio, D-Guard, HikCentral, Digifort e outros." },
    { i: IconCheck, t: "Proposta validada", d: "Um especialista confere o projeto e fecha a proposta final." },
  ];

  const steps = [
    { t: "Você configura", d: "Câmeras, resolução, codec, FPS e retenção do projeto — em segundos." },
    { t: "A gente calcula", d: "Storage, link, servidores e custo aparecem na hora, calibrados contra o Digifort." },
    { t: "Você recebe a proposta", d: "Um especialista da Adentro valida o dimensionamento e prepara a proposta." },
  ];

  const vmsList = ["Segware Sigma", "Solutio", "Fulltime", "D-Guard", "HikCentral", "Digifort"];

  const faqs = [
    { q: "A calculadora é gratuita?", a: "É, de ponta a ponta. Você configura o projeto, vê o dimensionamento completo e decide o que fazer com ele. Sem cartão, sem pegadinha." },
    { q: "O cálculo é confiável?", a: "Sim. O motor é calibrado contra o Digifort DesignTool e considera bitrate por resolução, codec, FPS, overhead do VMS e política de retenção." },
    { q: "Funciona com o VMS que eu já uso?", a: "Funciona. Suportamos Segware, Solutio, Fulltime, D-Guard, HikCentral, Digifort e outros — sem retrabalho de projeto." },
    { q: "E depois que eu calculo?", a: "O resultado é seu. Se quiser, um especialista da Adentro valida o dimensionamento e transforma a estimativa em proposta." },
  ];

  const titleStyle = { color: T.ink, letterSpacing: "-.01em" } as const;

  return (
    <div className="font-b" style={{ background: T.bg, minHeight: "100vh" }}>
      {/* ─────────── HEADER ─────────── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b transition-shadow"
        style={{ background: "#FFFFFFE6", borderColor: T.border, boxShadow: scrolled ? "0 8px 24px rgba(11,13,49,.06)" : "none" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" aria-label="Início" style={{ display: "inline-flex" }}>
            <Logo height={24} />
          </Link>
          <nav className="hidden md:flex items-center gap-7 font-b text-sm" style={{ color: T.gray }}>
            <a href="#como-funciona" style={{ textDecoration: "none", color: "inherit" }}>Como funciona</a>
            <a href="#o-que-calcula" style={{ textDecoration: "none", color: "inherit" }}>O que calcula</a>
            <a href="#faq" style={{ textDecoration: "none", color: "inherit" }}>Dúvidas</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="font-ui font-semibold tracking-wide text-xs px-3 py-2.5 rounded-xl border cursor-pointer hidden sm:inline-flex items-center gap-1.5"
              style={{ borderColor: T.border, color: T.ink, background: "#fff", textDecoration: "none" }}
            >
              Calculadoras
            </Link>
            <CtaButton className="!text-xs">CALCULAR PROJETO</CtaButton>
          </div>
        </div>
      </header>

      {/* ─────────── HERO ─────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-32 -right-20 w-[560px] h-[560px] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(235,115,66,.18), transparent)" }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-28 w-[460px] h-[460px] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(11,13,49,.05), transparent)" }} />
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center relative">
          <div className="fade-up">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-ui font-semibold text-xs uppercase tracking-widest"
              style={{ borderColor: T.border, background: "#fff", color: T.orange }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: T.orange, animation: "pulseDot 1.6s infinite" }} />
              Calculadora gratuita de VMS na nuvem
            </span>

            <h1 className="font-d font-semibold mt-6" style={{ color: T.ink, fontSize: "clamp(2.3rem,4.2vw,3.5rem)", lineHeight: 1.04, letterSpacing: "-.025em" }}>
              Seu DVR vai falhar.
              <span className="block mt-1" style={{ position: "relative", width: "fit-content" }}>
                <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Só não sabemos quando.
                </span>
                <span aria-hidden className="absolute left-0 right-0 -bottom-1 h-[3px] rounded-full" style={{ background: T.grad, opacity: 0.35 }} />
              </span>
            </h1>

            <p className="font-b mt-7 max-w-lg" style={{ color: T.body, fontSize: "1.0625rem", lineHeight: 1.7 }}>
              Cada HD local é uma bomba-relógio. Em <strong style={{ color: T.ink, fontWeight: 600 }}>segundos</strong>,
              descubra o armazenamento, o link e o custo mensal do seu VMS na nuvem — com SLA de 99,93%
              e retenção garantida em contrato.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CtaButton className="!px-6 !py-3.5 !text-sm">Calcular meu projeto</CtaButton>
              <a href="#como-funciona" className="font-ui font-semibold text-sm" style={{ color: T.ink, textDecoration: "none" }}>
                Como funciona →
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
              {["100% gratuita", "Cálculo na hora", "Sem compromisso"].map((b) => (
                <span key={b} className="font-b text-xs flex items-center gap-1.5" style={{ color: T.gray }}>
                  <IconCheck size={13} color={T.orange} />
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="fade-up" style={{ animationDelay: ".15s" }}>
            <HeroPanel />
          </div>
        </div>
      </section>

      {/* ─────────── STATS ─────────── */}
      <section className="border-y py-10" style={{ borderColor: T.border, background: "#FAFAFB" }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-8">
          {stats.map((s) => (
            <div key={s.l} className="text-center md:text-left">
              <div className="font-d font-semibold text-3xl md:text-4xl" style={{ color: T.ink }}>{s.k}</div>
              <p className="font-b text-xs mt-1" style={{ color: T.gray, lineHeight: 1.4 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── PROBLEMA ─────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <Eyebrow>Por que isso importa</Eyebrow>
          <h2 className="font-d font-semibold text-2xl md:text-[2rem] mt-3" style={titleStyle}>
            O fim do HD que falha às 3h da manhã
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {pains.map((p) => (
            <div key={p.t} className="card-h rounded-2xl bg-white p-7" style={{ border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.orange}` }}>
              <p.i size={22} color={T.orange} />
              <h3 className="font-d font-semibold text-lg mt-4" style={{ color: T.ink, lineHeight: 1.3 }}>{p.t}</h3>
              <p className="font-b text-sm mt-2" style={{ color: T.gray, lineHeight: 1.6 }}>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── COMO FUNCIONA ─────────── */}
      <section id="como-funciona" className="py-20" style={{ background: "#FAFAFB" }}>
        <div className="max-w-7xl mx-auto px-6">
          <Eyebrow>Como funciona</Eyebrow>
          <h2 className="font-d font-semibold text-2xl md:text-[2rem] mt-3 mb-14" style={titleStyle}>
            Configurar, calcular, fechar
          </h2>
          <div className="grid md:grid-cols-3 gap-10 md:gap-6 relative">
            <div aria-hidden className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px" style={{ background: `linear-gradient(90deg, ${T.border}, ${T.orange}66, ${T.border})` }} />
            {steps.map((s, i) => (
              <div key={s.t} className="relative text-center md:text-left">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-d font-semibold text-xl text-white relative z-10 mx-auto md:mx-0" style={{ background: T.grad, boxShadow: "0 10px 24px rgba(237,80,29,.28)" }}>
                  {i + 1}
                </div>
                <h3 className="font-d font-semibold text-lg mt-5" style={{ color: T.ink }}>{s.t}</h3>
                <p className="font-b text-sm mt-1.5 max-w-xs mx-auto md:mx-0" style={{ color: T.gray, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── O QUE CALCULA ─────────── */}
      <section id="o-que-calcula" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
          <div>
            <Eyebrow>O que calcula</Eyebrow>
            <h2 className="font-d font-semibold text-2xl md:text-[2rem] mt-3" style={titleStyle}>
              Tudo que seu projeto precisa, dimensionado
            </h2>
            <p className="font-b text-base mt-4" style={{ color: T.body, lineHeight: 1.7 }}>
              Em tempo real, o cálculo cruza câmeras, resolução, codec e retenção com o perfil do seu
              VMS — e devolve o dimensionamento real, não um chute de planilha.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-7">
            {calcula.map((b) => (
              <div key={b.t} className="flex gap-4">
                <span className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center" style={{ background: T.tint }}>
                  <b.i size={20} color={T.orange} />
                </span>
                <div>
                  <h3 className="font-d font-semibold text-base" style={{ color: T.ink }}>{b.t}</h3>
                  <p className="font-b text-sm mt-1" style={{ color: T.gray, lineHeight: 1.55 }}>{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── SEÇÃO ESCURA (segurança) ─────────── */}
      <section style={{ background: T.ink }}>
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <span className="font-ui font-semibold text-xs uppercase tracking-widest" style={{ color: T.orange }}>
              Segurança auditada, não prometida
            </span>
            <h2 className="font-d font-semibold text-2xl md:text-[2rem] mt-3 text-white" style={{ letterSpacing: "-.01em" }}>
              Sua imagem em datacenter Tier III no Brasil
            </h2>
            <p className="font-b text-base mt-4 max-w-lg" style={{ color: "#B9BCD8", lineHeight: 1.7 }}>
              Sem HD para falhar, com retenção garantida em contrato e conformidade auditada. LGPD,
              ISO 27001 e ISO 27701 renovadas por auditoria independente — dados em solo brasileiro.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {["LGPD", "ISO 27001", "ISO 27701", "SOC 2 Type II"].map((tag) => (
                <span key={tag} className="font-b text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: "#FFFFFF12", color: "#fff" }}>
                  <IconCheck size={13} color={T.orange} /> {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { k: "99,93%", l: "uptime contratual" },
              { k: "Tier III", l: "infra 100% Brasil" },
              { k: "24×7", l: "suporte humano, sem chatbot" },
              { k: "0 HD", l: "para falhar ou substituir" },
            ].map((m) => (
              <div key={m.l} className="rounded-2xl p-5" style={{ background: "#FFFFFF0A", border: "1px solid #FFFFFF14" }}>
                <div className="font-d font-semibold text-2xl md:text-3xl text-white">{m.k}</div>
                <p className="font-b text-xs mt-1" style={{ color: "#9A9DBE", lineHeight: 1.4 }}>{m.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── SELOS DE VALIDAÇÃO (certificações) ─────────── */}
      <section className="py-20" style={{ background: "#FAFAFB" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-ui font-semibold text-xs uppercase tracking-widest" style={{ color: T.orange }}>
              Não acredite na nossa palavra — veja os documentos
            </p>
            <h2 className="font-d font-semibold text-2xl md:text-[2rem] mt-3" style={titleStyle}>
              Certificações que provam o que prometemos
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {SEALS.map((s) => (
              <div key={s.t} className="card-h rounded-2xl border bg-white p-6 text-center" style={{ borderColor: T.border }}>
                <span className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: s.bg, color: s.fg }}>
                  <s.i size={26} color={s.fg} />
                </span>
                <h3 className="font-d font-bold text-base mt-4" style={{ color: T.ink }}>{s.t}</h3>
                <p className="font-b text-xs mt-2" style={{ color: T.gray, lineHeight: 1.55 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── O QUE VOCÊ RECEBE ─────────── */}
      <section className="py-20" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <Eyebrow>O que você recebe</Eyebrow>
          <h2 className="font-d font-semibold text-2xl md:text-[2rem] mt-3 mb-10" style={titleStyle}>
            Não é só um número. É a proposta pronta para fechar.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {deliver.map((b) => (
              <div key={b.t} className="card-h rounded-2xl border bg-white p-6" style={{ borderColor: T.border }}>
                <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: T.tint }}>
                  <b.i size={20} color={T.orange} />
                </span>
                <h3 className="font-d font-semibold text-base mt-4" style={{ color: T.ink }}>{b.t}</h3>
                <p className="font-b text-sm mt-1.5" style={{ color: T.gray, lineHeight: 1.55 }}>{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── VMS COMPATÍVEIS ─────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="font-ui font-semibold text-xs uppercase tracking-widest mb-7" style={{ color: "#9CA3AF" }}>
          Compatível com os VMS que você já vende
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {vmsList.map((p) => (
            <span key={p} className="font-d font-semibold text-xl" style={{ color: "#C3C6CF" }}>{p}</span>
          ))}
        </div>
      </section>

      {/* ─────────── FAQ ─────────── */}
      <section id="faq" className="py-20" style={{ background: "#FAFAFB" }}>
        <div className="max-w-3xl mx-auto px-6">
          <Eyebrow>Dúvidas frequentes</Eyebrow>
          <h2 className="font-d font-semibold text-2xl md:text-[2rem] mt-3 mb-7" style={titleStyle}>
            Antes de calcular
          </h2>
          <div className="space-y-3">
            {faqs.map((f, i) => {
              const open = faq === i;
              return (
                <div key={f.q} className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: T.border }}>
                  <button onClick={() => setFaq(open ? null : i)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer bg-transparent border-0">
                    <span className="font-d font-semibold text-base" style={{ color: T.ink }}>{f.q}</span>
                    <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center transition-transform font-b" style={{ background: T.tint, color: T.orange, transform: open ? "rotate(45deg)" : "none" }}>
                      +
                    </span>
                  </button>
                  {open && <p className="font-b text-sm px-5 pb-4 -mt-0.5" style={{ color: T.gray, lineHeight: 1.7 }}>{f.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── CTA FINAL ─────────── */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden" style={{ background: T.grad }}>
          <h2 className="font-d font-semibold text-2xl md:text-4xl" style={{ margin: 0, letterSpacing: "-.01em" }}>
            Descubra quanto custa proteger seu projeto
          </h2>
          <p className="font-b text-base md:text-lg mt-4 opacity-95 max-w-xl mx-auto" style={{ lineHeight: 1.6 }}>
            Leva segundos, é gratuito e o dimensionamento sai na hora.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to={CALC} className="font-ui font-semibold text-sm rounded-xl px-8 py-4 cursor-pointer inline-flex items-center gap-2" style={{ background: "#fff", color: T.orangeStrong, textDecoration: "none" }}>
              CALCULAR MEU PROJETO <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer style={{ background: T.ink }}>
        <div className="max-w-7xl mx-auto px-6 py-12 text-white">
          <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-8">
            <div>
              <Logo height={26} />
              <p className="font-b text-sm mt-4 max-w-xs" style={{ color: "#A9ACC9", lineHeight: 1.6 }}>
                VMS na nuvem com SLA garantido, segurança auditada e custo previsível — sem HD para
                falhar.
              </p>
            </div>
            <div>
              <p className="font-ui font-semibold text-xs uppercase tracking-widest mb-3" style={{ color: "#7C7FA6" }}>Endereços</p>
              <p className="font-b text-sm" style={{ color: "#D6D8EC", lineHeight: 1.7 }}>
                Av. Cristóvão Colombo, 2240, Porto Alegre/RS
                <br />
                Av. Paulista, 2202, São Paulo/SP
              </p>
            </div>
            <div>
              <p className="font-ui font-semibold text-xs uppercase tracking-widest mb-3" style={{ color: "#7C7FA6" }}>Contato</p>
              <p className="font-b text-sm" style={{ color: "#D6D8EC", lineHeight: 1.7 }}>
                (51) 3103-9603
                <br />
                contato@adentro.com.br
              </p>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t text-center" style={{ borderColor: "#FFFFFF1A" }}>
            <p className="font-b text-xs" style={{ color: "#7C7FA6" }}>
              © {new Date().getFullYear()} Adentro Tecnologia LTDA · CNPJ 16.515.656/0001-87
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
