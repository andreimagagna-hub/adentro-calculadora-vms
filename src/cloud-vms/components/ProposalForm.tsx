import { useState, type ReactNode } from "react";
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
   Mesmo design da calculadora (.vmscalc). A qualificação e o contato já
   foram captados no gate — aqui só confirmamos o envio. */
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
    <div className="vmscalc-modal" onClick={onClose}>
      <div className="vmscalc-modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <button className="vmscalc-modal-close" onClick={onClose} aria-label="Fechar">×</button>

        {done ? (
          <div className="pf-success">
            <span className="pf-success-ico"><IconCheck size={32} color="#16A34A" /></span>
            <h2>Proposta a caminho!</h2>
            <p>
              Recebemos seu dimensionamento{lead.nome ? `, ${lead.nome.split(" ")[0]}` : ""}. Um especialista da
              Adentro vai validar o projeto e falar com você em breve.
            </p>
            <button className="pf-send" style={{ marginTop: 22 }} onClick={onClose}>Voltar à calculadora</button>
          </div>
        ) : (
          <>
            <div className="pf-title">Falar com o time comercial</div>
            <div className="pf-sub">Confirme o envio do seu dimensionamento. O time comercial valida e prepara a proposta final.</div>

            {temContato && (
              <div className="pf-box">
                <Row label="Nome" value={nomeCompleto} />
                <Row label="Empresa" value={lead.empresa} />
                {lead.email && <Row label="E-mail" value={lead.email} />}
                <Row label="Telefone" value={lead.whatsapp} />
              </div>
            )}

            <div className="pf-box">
              <Row label="Cargo" value={lead.cargo} />
              <Row label="Funcionários" value={lead.funcionarios} />
              <Row label="Cotando com outras" value={lead.cotando} />
              <Row label="Início do projeto" value={lead.previsao} />
            </div>

            <div className="pf-box accent">
              <Row label="Plano" value={result.planName} strong />
              <Row label="Grupos de câmeras" value={`${groups.length}`} />
              <Row label="Câmeras (total)" value={`${totalCameras}`} />
              <Row label="Storage útil" value={fmtGB(result.storageUtilGB)} />
              <Row label="Link ideal" value={fmtMbps(result.linkIdealMbps)} />
              <Row label="Investimento" value={`${fmtR(result.custoTotal)}/mês`} strong />
            </div>

            {error && <div className="pf-error">{error}</div>}

            <button className="pf-send" onClick={submit} disabled={sending}>
              {sending ? "Enviando…" : (<>Enviar e falar com especialista <IconSend size={16} /></>)}
            </button>
            <button className="pf-back" onClick={onClose}>Voltar e ajustar</button>
            <div className="pf-secure"><IconLock size={12} /> Seus dados ficam seguros e não são compartilhados.</div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value?: ReactNode; strong?: boolean }) {
  return (
    <div className="pf-row">
      <span className="lbl">{label}</span>
      <span className={`val${strong ? " orange" : ""}`}>{value || "—"}</span>
    </div>
  );
}
