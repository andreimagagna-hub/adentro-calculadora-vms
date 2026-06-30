import { supabase } from "./supabase";
import { calculateGroups, type GroupInput, type CalcResult } from "./calc";

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
  /* ── Tracking de campanha (campos ocultos, capturados da URL) ── */
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_creative_format?: string;
  utm_marketing_tactic?: string;
  gclid?: string;
}

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const SAVE_ENDPOINT = import.meta.env.VITE_SAVE_ENDPOINT ?? "api/salvar.php";

/** Monta o payload completo (lead + configuração + dimensionamento calculado).
 *  Multi-grupo: `config.groups` carrega o array completo; as colunas planas de
 *  `config` recebem agregados/representativos (câmeras = soma; resolução/codec/
 *  fps/retenção/tipo/movimento do 1º grupo) para compat com o schema existente. */
export function buildPayload(lead: Lead, vms: string, groups: GroupInput[], result?: CalcResult) {
  const r = result ?? calculateGroups(vms, groups);
  const totalCameras = groups.reduce((s, g) => s + Math.max(1, g.cameras || 1), 0);
  const g0 = groups[0];
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
      utm_source: lead.utm_source ?? null,
      utm_medium: lead.utm_medium ?? null,
      utm_campaign: lead.utm_campaign ?? null,
      utm_content: lead.utm_content ?? null,
      utm_term: lead.utm_term ?? null,
      utm_creative_format: lead.utm_creative_format ?? null,
      utm_marketing_tactic: lead.utm_marketing_tactic ?? null,
      gclid: lead.gclid ?? null,
    },
    config: {
      vms,
      cameras: totalCameras,
      viewers: null,
      resolution: g0?.resolution ?? null,
      codec: g0?.codec ?? null,
      fps: g0?.fps ?? null,
      retention: g0?.retention ?? null,
      rec_type: g0?.recType ?? null,
      movement: g0?.movement ?? null,
      groups: groups.map((g) => ({
        name: g.name,
        cameras: g.cameras,
        resolution: g.resolution,
        codec: g.codec,
        fps: g.fps,
        retention: g.retention,
        rec_type: g.recType,
        movement: g.movement,
        rec_pct: g.recPct,
      })),
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
          utm_source: lead.utm_source ?? null,
          utm_medium: lead.utm_medium ?? null,
          utm_campaign: lead.utm_campaign ?? null,
          utm_content: lead.utm_content ?? null,
          utm_term: lead.utm_term ?? null,
          utm_creative_format: lead.utm_creative_format ?? null,
          utm_marketing_tactic: lead.utm_marketing_tactic ?? null,
          gclid: lead.gclid ?? null,
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
  vms: string,
  groups: GroupInput[],
  result?: CalcResult,
): Promise<SaveResult> {
  const payload = buildPayload(lead, vms, groups, result);

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

/* ───────────── BUSCAR LEAD POR E-MAIL (login direto) ───────────── */
export type FindLeadResult =
  | { ok: true; lead: Lead }
  | { ok: false; error: string };

/**
 * Busca um lead já cadastrado pelo e-mail, via RPC `find_cloud_vms_lead_by_email`.
 * Permite que o usuário pule o cadastro se já acessou antes.
 * Degrada graciosamente: sem Supabase, retorna erro.
 */
export async function findLeadByEmail(email: string): Promise<FindLeadResult> {
  if (!supabase) {
    return { ok: false, error: "Supabase não configurado." };
  }
  try {
    const { data, error } = await supabase.rpc("find_cloud_vms_lead_by_email", {
      p_email: email.trim().toLowerCase(),
    });
    if (error) throw error;
    if (!data) return { ok: false, error: "E-mail não encontrado." };
    return {
      ok: true,
      lead: {
        id: data.id ?? undefined,
        nome: data.nome ?? undefined,
        sobrenome: data.sobrenome ?? undefined,
        empresa: data.empresa ?? undefined,
        email: data.email ?? undefined,
        whatsapp: data.whatsapp ?? undefined,
        cargo: data.cargo ?? undefined,
        funcionarios: data.funcionarios ?? undefined,
        cotando: data.cotando ?? undefined,
        previsao: data.previsao ?? undefined,
        perfil: data.perfil ?? undefined,
        origem: data.origem ?? undefined,
        indicacao: data.indicacao ?? undefined,
        utm_source: data.utm_source ?? undefined,
        utm_medium: data.utm_medium ?? undefined,
        utm_campaign: data.utm_campaign ?? undefined,
        utm_content: data.utm_content ?? undefined,
        utm_term: data.utm_term ?? undefined,
        utm_creative_format: data.utm_creative_format ?? undefined,
        utm_marketing_tactic: data.utm_marketing_tactic ?? undefined,
        gclid: data.gclid ?? undefined,
      },
    };
  } catch (err) {
    console.error("Erro ao buscar lead por e-mail:", err);
    return { ok: false, error: (err as Error).message };
  }
}
