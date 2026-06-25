import { supabase } from "./supabase";
import { calculate, type CalcInput, type CalcResult } from "./calc";

/* ───────────── LEAD (cadastro) ───────────── */
export interface Lead {
  /** id do lead já persistido no gate — correlaciona qualificação ↔ submissão. */
  id?: string;
  nome?: string;
  sobrenome?: string;
  empresa?: string;
  email?: string;
  whatsapp?: string;
  perfil?: string;
  /** Como chegou até nós (origem). */
  origem?: string;
  /** Indicação de vendedor — reservado para o mecanismo de vendedor (a definir). */
  indicacao?: string;
  /** Cargo do contato (picklist Salesforce). */
  cargo?: string;
  /** Faixa de quantidade de funcionários. */
  funcionarios?: string;
  /** Já está cotando com outras empresas? (Sim/Não). */
  cotando?: string;
  /** Tempo estimado para iniciar o projeto (picklist Salesforce). */
  previsao?: string;
}

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const SAVE_ENDPOINT = import.meta.env.VITE_SAVE_ENDPOINT ?? "api/salvar.php";

/** Monta o payload completo (lead + configuração + dimensionamento calculado). */
export function buildPayload(lead: Lead, input: CalcInput, result?: CalcResult) {
  const r = result ?? calculate(input);
  return {
    lead: {
      id: lead.id ?? null,
      nome: lead.nome ?? null,
      sobrenome: lead.sobrenome ?? null,
      empresa: lead.empresa ?? null,
      email: lead.email ?? null,
      whatsapp: lead.whatsapp ?? null,
      perfil: lead.perfil ?? null,
      origem: lead.origem ?? null,
      indicacao: lead.indicacao ?? null,
      cargo: lead.cargo ?? null,
      funcionarios: lead.funcionarios ?? null,
      cotando: lead.cotando ?? null,
      previsao: lead.previsao ?? null,
    },
    config: {
      vms: input.vms,
      cameras: input.cameras,
      viewers: input.viewers,
      resolution: input.resolution,
      codec: input.codec,
      fps: input.fps,
      retention: input.retention,
      rec_type: input.recType,
      movement: input.movement,
    },
    result: {
      os: r.os,
      storage_util_gb: +r.storageUtilGB.toFixed(2),
      storage_servidor_gb: r.storageServidorGB,
      link_min_mbps: Math.ceil(r.linkMinMbps),
      link_ideal_mbps: Math.ceil(r.linkIdealMbps),
      num_servers: r.numServers,
      consumo_mensal_gb: +r.consumoMensalGB.toFixed(2),
      growth_tb: +r.growthTB.toFixed(2),
      custo_por_camera: Math.round(r.custoPorCamera),
      custo_visualizacao: Math.round(r.custoVisualizacao),
      custo_total: Math.round(r.custoTotal),
      plan_name: r.planName,
    },
    meta: {
      user_agent: navigator.userAgent,
      completed_at: new Date().toISOString(),
    },
  };
}

/**
 * Persiste APENAS o lead, no momento do cadastro (gate da calculadora).
 * Upsert por e-mail via RPC `save_cloud_vms_lead` (security definer). Assim o
 * lead é capturado mesmo que a pessoa não conclua a calculadora / proposta.
 * Degrada graciosamente: nunca trava o acesso à calculadora.
 */
export async function saveVmsLeadOnly(lead: Lead): Promise<SaveResult> {
  if (!supabase) {
    console.info("[Cloud VMS] cadastro capturado (sem backend):", lead);
    return { ok: false, error: "Supabase não configurado." };
  }
  try {
    const { data, error } = await supabase.rpc("save_cloud_vms_lead", {
      payload: {
        lead: {
          id: lead.id ?? null,
          nome: lead.nome ?? null,
          sobrenome: lead.sobrenome ?? null,
          empresa: lead.empresa ?? null,
          email: lead.email ?? null,
          whatsapp: lead.whatsapp ?? null,
          perfil: lead.perfil ?? null,
          origem: lead.origem ?? null,
          indicacao: lead.indicacao ?? null,
          cargo: lead.cargo ?? null,
          funcionarios: lead.funcionarios ?? null,
          cotando: lead.cotando ?? null,
          previsao: lead.previsao ?? null,
        },
      },
    });
    if (error) throw error;
    return { ok: true, id: String(data) };
  } catch (err) {
    console.error("Erro ao salvar lead:", err);
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Persiste o lead + dimensionamento. Prioriza o Supabase (RPC `submit_cloud_vms`);
 * sem configuração, cai no endpoint PHP legado e degrada graciosamente — o fluxo
 * nunca trava por falha de persistência.
 */
export async function saveVmsLead(
  lead: Lead,
  input: CalcInput,
  result?: CalcResult,
): Promise<SaveResult> {
  const payload = buildPayload(lead, input, result);

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc("submit_cloud_vms", { payload });
      if (error) throw error;
      return { ok: true, id: String(data) };
    } catch (err) {
      console.error("Erro ao salvar no Supabase:", err);
      return { ok: false, error: (err as Error).message };
    }
  }

  // ── Fallback: endpoint legado ──
  try {
    const res = await fetch(SAVE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Falha ao salvar cadastro.");
    return { ok: true, id: data.id };
  } catch (err) {
    // Sem backend configurado: registra e segue (dev).
    console.info("[Cloud VMS] cadastro capturado (sem backend):", payload);
    return { ok: false, error: (err as Error).message };
  }
}
