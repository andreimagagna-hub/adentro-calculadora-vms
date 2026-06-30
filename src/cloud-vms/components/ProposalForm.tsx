import { useState } from "react";
import { T } from "../theme/tokens";
import { IconCheck, IconSend, IconLock } from "./icons";
import { saveVmsLead, type Lead } from "../lib/api";
import { fmtR, fmtGB, fmtMbps, type GroupInput, type CalcResult } from "../lib/calc";

interface ProposalFormProps {
  lead: Lead;
  vms: string;
  groups: GroupInput[];
  result: CalcResult;
  onClose: () => void;
}

/* ───────────── PROPOSTA (envia lead + dimensionamento) ─────────────
   A qualificação (cargo, funcionários, cotando, previsão) e o contato já
   foram captados no gate / no formulário do site — aqui só confirmamos. */
export function ProposalForm({ lead, vms, groups, result, onClose }: ProposalFormProps) {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const temContato = Boolean(lead.nome || lead.empresa || lead.email || lead.whatsapp);
  const nomeCompleto = [lead.nome, lead.sobrenome].filter(Boolean).join(" ") || undefined;
  const totalCameras = groups.reduce((s, g) => s + Math.max(1, g.cameras || 1), 0);

  const submit = async () => {
    setSending(true);
    setError(null);
    const res = await saveVmsLead(lead, vms, groups, result);
    setSending(false);
    if (res.ok) setDone(true);
    else setError(res.error || "Não foi possível enviar agora. Tente novamente.");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(4,12,82,.55)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg p-7 md:p-9 fade-up"
        style={{ boxShadow: "0 32px 80px rgba(4,12,82,.35)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-4">
            <span className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: "#E8F5E9" }}>
              <IconCheck size={32} color={T.green} />
            </span>
            <h2 className="font-d font-bold text-2xl mt-5" style={{ color: T.ink }}>Proposta a caminho!</h2>
            <p className="font-b text-sm mt-2" style={{ color: T.gray, lineHeight: 1.6 }}>
              Recebemos seu dimensionamento{lead.nome ? `, ${lead.nome.split(" ")[0]}` : ""}. Um especialista da
              Adentro vai validar o projeto e falar com você em breve.
            </p>
            <button
              onClick={onClose}
              className="btn-p text-white border-0 rounded-xl px-6 py-3 font-ui font-semibold text-sm cursor-pointer mt-6"
            >
              Voltar à calculadora
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-d font-bold text-xl md:text-2xl" style={{ color: T.ink }}>Falar com o time comercial</h2>
            <p className="font-b text-sm mt-1.5" style={{ color: T.gray }}>
              Confirme o envio do seu dimensionamento. O time comercial valida e prepara a proposta final.
            </p>

            {/* contato (vindo do site) — só aparece quando existe */}
            {temContato && (
              <div className="mt-5 rounded-2xl border p-4 space-y-1.5" style={{ borderColor: T.border, background: T.off }}>
                <Row label="Nome" value={nomeCompleto} />
                <Row label="Empresa" value={lead.empresa} />
                {lead.email && <Row label="E-mail" value={lead.email} />}
                <Row label="Telefone" value={lead.whatsapp} />
              </div>
            )}

            {/* qualificação (captada no gate) */}
            <div className="mt-3 rounded-2xl border p-4 space-y-1.5" style={{ borderColor: T.border, background: T.off }}>
              <Row label="Cargo" value={lead.cargo} />
              <Row label="Funcionários" value={lead.funcionarios} />
              <Row label="Cotando com outras" value={lead.cotando} />
              <Row label="Início do projeto" value={lead.previsao} />
            </div>

            {/* resumo do dimensionamento */}
            <div className="mt-3 rounded-2xl p-4 space-y-1.5" style={{ background: T.tint, border: `1px solid ${T.orange}33` }}>
              <Row label="Plano" value={result.planName} strong />
              <Row label="Grupos de câmeras" value={`${groups.length}`} />
              <Row label="Câmeras (total)" value={`${totalCameras}`} />
              <Row label="Storage útil" value={fmtGB(result.storageUtilGB)} />
              <Row label="Link ideal" value={fmtMbps(result.linkIdealMbps)} />
              <Row label="Investimento" value={`${fmtR(result.custoTotal)}/mês`} strong />
            </div>

            {error && (
              <div
                className="mt-5 rounded-xl px-4 py-3 font-b text-xs"
                style={{ background: "#FCEBEB", color: "#B42318", border: "1px solid #F2B8B5" }}
              >
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={sending}
              className="btn-p text-white border-0 w-full rounded-xl px-5 py-3.5 font-ui font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer mt-6"
              style={sending ? { opacity: 0.6, pointerEvents: "none" } : {}}
            >
              {sending ? "Enviando…" : "Enviar e falar com especialista"}
              {!sending && <IconSend size={16} />}
            </button>
            <button
              onClick={onClose}
              className="w-full text-center font-b text-xs mt-3 cursor-pointer bg-transparent border-0"
              style={{ color: T.gray }}
            >
              Voltar e ajustar
            </button>
            <p className="font-b text-[11px] mt-3 flex items-center justify-center gap-1.5" style={{ color: "#9CA3AF" }}>
              <IconLock size={12} /> Seus dados ficam seguros e não são compartilhados.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value?: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-b text-xs" style={{ color: T.gray }}>{label}</span>
      <span className={`font-b text-xs ${strong ? "font-bold" : "font-semibold"} text-right`} style={{ color: strong ? T.orangeStrong : T.ink }}>
        {value || "—"}
      </span>
    </div>
  );
}
