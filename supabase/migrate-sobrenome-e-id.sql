-- ════════════════════════════════════════════════════════════════════
--  ADENTRO · Cloud VMS — migração: sobrenome + correlação por id + tracking
--  Rode no SQL Editor do projeto nnflvtrkjxblafjlbrpg. Idempotente.
--  Adiciona: coluna sobrenome, correlação lead↔submissão por id (cadastro
--  sem e-mail) e os campos ocultos de campanha (UTMs + gclid).
-- ════════════════════════════════════════════════════════════════════

-- 1) Novas colunas
alter table public.cloud_vms_leads add column if not exists sobrenome    text;
alter table public.cloud_vms_leads add column if not exists utm_source   text;
alter table public.cloud_vms_leads add column if not exists utm_medium   text;
alter table public.cloud_vms_leads add column if not exists utm_campaign text;
alter table public.cloud_vms_leads add column if not exists utm_content  text;
alter table public.cloud_vms_leads add column if not exists utm_term     text;
alter table public.cloud_vms_leads add column if not exists gclid        text;

-- 2) RPC do gate (cadastro) — grava sobrenome + tracking; sem e-mail, cria
--    um lead novo cujo id correlaciona com a submissão final.
create or replace function public.save_cloud_vms_lead(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead jsonb := payload->'lead';
  v_email text := nullif(v_lead->>'email','');
  v_lead_id uuid;
begin
  if v_email is not null then
    insert into public.cloud_vms_leads
      (nome, sobrenome, empresa, email, whatsapp, perfil,
       origem, indicacao, cargo, funcionarios, cotando, previsao,
       utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid)
    values (v_lead->>'nome', v_lead->>'sobrenome', v_lead->>'empresa', v_email,
            v_lead->>'whatsapp', v_lead->>'perfil',
            v_lead->>'origem', v_lead->>'indicacao', v_lead->>'cargo',
            v_lead->>'funcionarios', v_lead->>'cotando', v_lead->>'previsao',
            v_lead->>'utm_source', v_lead->>'utm_medium', v_lead->>'utm_campaign',
            v_lead->>'utm_content', v_lead->>'utm_term', v_lead->>'gclid')
    on conflict (email) do update
      set nome = excluded.nome, sobrenome = excluded.sobrenome,
          empresa = excluded.empresa,
          whatsapp = excluded.whatsapp, perfil = excluded.perfil,
          origem       = coalesce(excluded.origem,       cloud_vms_leads.origem),
          indicacao    = coalesce(excluded.indicacao,    cloud_vms_leads.indicacao),
          cargo        = coalesce(excluded.cargo,        cloud_vms_leads.cargo),
          funcionarios = coalesce(excluded.funcionarios, cloud_vms_leads.funcionarios),
          cotando      = coalesce(excluded.cotando,      cloud_vms_leads.cotando),
          previsao     = coalesce(excluded.previsao,     cloud_vms_leads.previsao),
          utm_source   = coalesce(excluded.utm_source,   cloud_vms_leads.utm_source),
          utm_medium   = coalesce(excluded.utm_medium,   cloud_vms_leads.utm_medium),
          utm_campaign = coalesce(excluded.utm_campaign, cloud_vms_leads.utm_campaign),
          utm_content  = coalesce(excluded.utm_content,  cloud_vms_leads.utm_content),
          utm_term     = coalesce(excluded.utm_term,     cloud_vms_leads.utm_term),
          gclid        = coalesce(excluded.gclid,        cloud_vms_leads.gclid),
          updated_at = now()
    returning id into v_lead_id;
  else
    insert into public.cloud_vms_leads
      (nome, sobrenome, empresa, email, whatsapp, perfil,
       origem, indicacao, cargo, funcionarios, cotando, previsao,
       utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid)
    values (v_lead->>'nome', v_lead->>'sobrenome', v_lead->>'empresa', null,
            v_lead->>'whatsapp', v_lead->>'perfil',
            v_lead->>'origem', v_lead->>'indicacao', v_lead->>'cargo',
            v_lead->>'funcionarios', v_lead->>'cotando', v_lead->>'previsao',
            v_lead->>'utm_source', v_lead->>'utm_medium', v_lead->>'utm_campaign',
            v_lead->>'utm_content', v_lead->>'utm_term', v_lead->>'gclid')
    returning id into v_lead_id;
  end if;

  return v_lead_id;
end;
$$;

grant execute on function public.save_cloud_vms_lead(jsonb) to anon, authenticated;

-- 3) RPC da submissão — correlaciona pelo id do gate (1), por e-mail (2) ou
--    cria novo lead (3); grava sobrenome + tracking.
create or replace function public.submit_cloud_vms(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead   jsonb := payload->'lead';
  v_cfg    jsonb := payload->'config';
  v_res    jsonb := payload->'result';
  v_meta   jsonb := payload->'meta';
  v_in_id  uuid  := nullif(v_lead->>'id','')::uuid;
  v_email  text  := nullif(v_lead->>'email','');
  v_lead_id uuid;
  v_submission_id uuid;
begin
  if v_in_id is not null then
    update public.cloud_vms_leads set
      nome = coalesce(v_lead->>'nome', nome),
      sobrenome = coalesce(v_lead->>'sobrenome', sobrenome),
      empresa = coalesce(v_lead->>'empresa', empresa),
      email = coalesce(v_email, email),
      whatsapp = coalesce(v_lead->>'whatsapp', whatsapp),
      perfil = coalesce(v_lead->>'perfil', perfil),
      origem = coalesce(v_lead->>'origem', origem),
      indicacao = coalesce(v_lead->>'indicacao', indicacao),
      cargo = coalesce(v_lead->>'cargo', cargo),
      funcionarios = coalesce(v_lead->>'funcionarios', funcionarios),
      cotando = coalesce(v_lead->>'cotando', cotando),
      previsao = coalesce(v_lead->>'previsao', previsao),
      utm_source = coalesce(v_lead->>'utm_source', utm_source),
      utm_medium = coalesce(v_lead->>'utm_medium', utm_medium),
      utm_campaign = coalesce(v_lead->>'utm_campaign', utm_campaign),
      utm_content = coalesce(v_lead->>'utm_content', utm_content),
      utm_term = coalesce(v_lead->>'utm_term', utm_term),
      gclid = coalesce(v_lead->>'gclid', gclid),
      updated_at = now()
    where id = v_in_id
    returning id into v_lead_id;
  end if;

  if v_lead_id is null and v_email is not null then
    insert into public.cloud_vms_leads
      (nome, sobrenome, empresa, email, whatsapp, perfil,
       origem, indicacao, cargo, funcionarios, cotando, previsao,
       utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid)
    values (v_lead->>'nome', v_lead->>'sobrenome', v_lead->>'empresa', v_email,
            v_lead->>'whatsapp', v_lead->>'perfil',
            v_lead->>'origem', v_lead->>'indicacao', v_lead->>'cargo',
            v_lead->>'funcionarios', v_lead->>'cotando', v_lead->>'previsao',
            v_lead->>'utm_source', v_lead->>'utm_medium', v_lead->>'utm_campaign',
            v_lead->>'utm_content', v_lead->>'utm_term', v_lead->>'gclid')
    on conflict (email) do update
      set nome = excluded.nome, sobrenome = excluded.sobrenome,
          empresa = excluded.empresa,
          whatsapp = excluded.whatsapp, perfil = excluded.perfil,
          origem       = coalesce(excluded.origem,       cloud_vms_leads.origem),
          indicacao    = coalesce(excluded.indicacao,    cloud_vms_leads.indicacao),
          cargo        = coalesce(excluded.cargo,        cloud_vms_leads.cargo),
          funcionarios = coalesce(excluded.funcionarios, cloud_vms_leads.funcionarios),
          cotando      = coalesce(excluded.cotando,      cloud_vms_leads.cotando),
          previsao     = coalesce(excluded.previsao,     cloud_vms_leads.previsao),
          utm_source   = coalesce(excluded.utm_source,   cloud_vms_leads.utm_source),
          utm_medium   = coalesce(excluded.utm_medium,   cloud_vms_leads.utm_medium),
          utm_campaign = coalesce(excluded.utm_campaign, cloud_vms_leads.utm_campaign),
          utm_content  = coalesce(excluded.utm_content,  cloud_vms_leads.utm_content),
          utm_term     = coalesce(excluded.utm_term,     cloud_vms_leads.utm_term),
          gclid        = coalesce(excluded.gclid,        cloud_vms_leads.gclid),
          updated_at = now()
    returning id into v_lead_id;
  end if;

  if v_lead_id is null then
    insert into public.cloud_vms_leads
      (nome, sobrenome, empresa, email, whatsapp, perfil,
       origem, indicacao, cargo, funcionarios, cotando, previsao,
       utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid)
    values (v_lead->>'nome', v_lead->>'sobrenome', v_lead->>'empresa', v_email,
            v_lead->>'whatsapp', v_lead->>'perfil',
            v_lead->>'origem', v_lead->>'indicacao', v_lead->>'cargo',
            v_lead->>'funcionarios', v_lead->>'cotando', v_lead->>'previsao',
            v_lead->>'utm_source', v_lead->>'utm_medium', v_lead->>'utm_campaign',
            v_lead->>'utm_content', v_lead->>'utm_term', v_lead->>'gclid')
    returning id into v_lead_id;
  end if;

  insert into public.cloud_vms_submissions (
    lead_id, vms, cameras, viewers, resolution, codec, fps, retention, rec_type, movement,
    os, storage_util_gb, storage_servidor_gb, link_min_mbps, link_ideal_mbps, num_servers,
    consumo_mensal_gb, growth_tb, custo_por_camera, custo_visualizacao, custo_total, plan_name,
    user_agent, completed_at
  ) values (
    v_lead_id,
    v_cfg->>'vms',
    nullif(v_cfg->>'cameras','')::int,
    nullif(v_cfg->>'viewers','')::int,
    v_cfg->>'resolution',
    v_cfg->>'codec',
    nullif(v_cfg->>'fps','')::int,
    nullif(v_cfg->>'retention','')::int,
    v_cfg->>'rec_type',
    nullif(v_cfg->>'movement','')::numeric,
    v_res->>'os',
    nullif(v_res->>'storage_util_gb','')::numeric,
    nullif(v_res->>'storage_servidor_gb','')::numeric,
    nullif(v_res->>'link_min_mbps','')::int,
    nullif(v_res->>'link_ideal_mbps','')::int,
    nullif(v_res->>'num_servers','')::int,
    nullif(v_res->>'consumo_mensal_gb','')::numeric,
    nullif(v_res->>'growth_tb','')::numeric,
    nullif(v_res->>'custo_por_camera','')::numeric,
    nullif(v_res->>'custo_visualizacao','')::numeric,
    nullif(v_res->>'custo_total','')::numeric,
    v_res->>'plan_name',
    v_meta->>'user_agent',
    coalesce(nullif(v_meta->>'completed_at','')::timestamptz, now())
  ) returning id into v_submission_id;

  return v_submission_id;
end;
$$;

grant execute on function public.submit_cloud_vms(jsonb) to anon, authenticated;

-- 4) Opcional — remover os leads de teste criados durante a verificação:
-- delete from public.cloud_vms_leads
--  where nome like 'TESTE_CLAUDE%' or email = 'teste.claude@adentro.com.br';
