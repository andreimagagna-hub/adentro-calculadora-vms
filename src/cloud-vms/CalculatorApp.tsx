import { useState } from "react";
import { T } from "./theme/tokens";
import { StartScreen } from "./components/StartScreen";
import { Calculator } from "./components/Calculator";
import { saveVmsLeadOnly, type Lead } from "./lib/api";

type View = "start" | "calculator";

/* ───────────── FLUXO DA CALCULADORA (raiz "/") ─────────────
   App dedicado: a calculadora é o próprio site, então não há "voltar ao site"
   (onHome fica indefinido e o header esconde o botão). cadastro (gate) → ferramenta. */
export default function CalculatorApp() {
  const [view, setView] = useState<View>("start");
  const [lead, setLead] = useState<Lead>({});

  return (
    <div className="font-b" style={{ background: T.off, minHeight: "100vh" }}>
      {view === "start" && (
        <StartScreen
          onStart={(l) => {
            setLead(l);
            // captura o lead já no cadastro (não bloqueia o acesso à calculadora);
            // guarda o id retornado para correlacionar com a submissão final.
            void saveVmsLeadOnly(l).then((r) => {
              if (r.ok) setLead((prev) => ({ ...prev, id: r.id }));
            });
            setView("calculator");
            window.scrollTo(0, 0);
          }}
        />
      )}
      {view === "calculator" && (
        <Calculator
          lead={lead}
          onBack={() => {
            setView("start");
            window.scrollTo(0, 0);
          }}
        />
      )}
    </div>
  );
}
