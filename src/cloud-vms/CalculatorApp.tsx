import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { T } from "./theme/tokens";
import { StartScreen } from "./components/StartScreen";
import { saveVmsLeadOnly, type Lead } from "./lib/api";
import { TRACKING_KEYS } from "../lib/embed";

type View = "start" | "calculator";

/* No subdomínio próprio (VITE_DEPLOY_TARGET=vms) a calculadora é o site: não há
   "voltar ao site". No hub, o gate/calculadora volta para a landing. */
const VMS_STANDALONE =
  (import.meta.env.VITE_DEPLOY_TARGET ?? "").toLowerCase() === "vms";

/* Monta a query string passada ao HTML da calculadora: id do lead (correlação),
   contato já coletado no gate (pré-preenchimento) e tracking de campanha. */
function buildCalcQuery(lead: Lead): string {
  const p = new URLSearchParams();
  p.set("calc", "1"); // modo só-calculadora (esconde a landing do HTML)
  if (lead.id) p.set("lead_id", lead.id);
  const pass: (keyof Lead)[] = ["nome", "sobrenome", "empresa", "email", "whatsapp"];
  for (const k of pass) {
    const v = lead[k];
    if (v) p.set(k, String(v));
  }
  for (const k of TRACKING_KEYS) {
    const v = lead[k];
    if (v) p.set(k, String(v));
  }
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

/* ───────────── FLUXO DA CALCULADORA (rota /cloud-vms) ─────────────
   Gate (cadastro em 2 etapas) → calculadora.
   A calculadora é o HTML aprovado pelo cliente (public/calculadora-vms.html),
   servido via iframe; o gate React permanece como antes. */
export default function CalculatorApp() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("start");
  const [lead, setLead] = useState<Lead>({});

  // No standalone não existe "site" para voltar — esconde o botão (onHome vazio).
  const goHome = VMS_STANDALONE ? undefined : () => navigate("/cloud-vms");

  if (view === "calculator") {
    return (
      <iframe
        src={`/calculadora-vms.html${buildCalcQuery(lead)}`}
        title="Calculadora Cloud VMS"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none" }}
      />
    );
  }

  return (
    <div className="font-b" style={{ background: T.off, minHeight: "100vh" }}>
      <StartScreen
        onHome={goHome}
        onStart={async (l) => {
          // captura o lead já no cadastro; aguarda o id p/ correlacionar a
          // submissão final e montar a URL do iframe uma única vez (sem reload).
          // Degrada graciosamente: falha no save não bloqueia a calculadora.
          const r = await saveVmsLeadOnly(l);
          setLead(r.ok ? { ...l, id: r.id } : l);
          setView("calculator");
          window.scrollTo(0, 0);
        }}
      />
    </div>
  );
}
