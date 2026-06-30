import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { T } from "./theme/tokens";
import { StartScreen } from "./components/StartScreen";
import { Calculator } from "./components/Calculator";
import { saveVmsLeadOnly, type Lead } from "./lib/api";

type View = "start" | "calculator";

/* No subdomínio próprio (VITE_DEPLOY_TARGET=vms) a calculadora é o site: não há
   "voltar ao site". No hub, o gate/calculadora volta para a landing. */
const VMS_STANDALONE =
  (import.meta.env.VITE_DEPLOY_TARGET ?? "").toLowerCase() === "vms";

/* ───────────── FLUXO DA CALCULADORA (rota /cloud-vms) ─────────────
   Gate (cadastro em 2 etapas) → calculadora React (design fiel ao HTML
   aprovado, com multi-grupo). */
export default function CalculatorApp() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("start");
  const [lead, setLead] = useState<Lead>({});

  // No standalone não existe "site" para voltar — esconde o botão (onHome vazio).
  const goHome = VMS_STANDALONE ? undefined : () => navigate("/cloud-vms");

  if (view === "calculator") {
    return <Calculator lead={lead} onHome={goHome} onBack={() => setView("start")} />;
  }

  return (
    <div className="font-b" style={{ background: T.off, minHeight: "100vh" }}>
      <StartScreen
        onHome={goHome}
        onStart={async (l) => {
          // captura o lead já no cadastro; aguarda o id p/ correlacionar a
          // submissão final. Degrada graciosamente: falha no save não bloqueia.
          const r = await saveVmsLeadOnly(l);
          setLead(r.ok ? { ...l, id: r.id } : l);
          setView("calculator");
          window.scrollTo(0, 0);
        }}
      />
    </div>
  );
}
