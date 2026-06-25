-- ════════════════════════════════════════════════════════════════════
--  ADENTRO · Calculadora Cloud VMS (CFTV na nuvem)
--  Modelo de dados — leads + submissões (configuração + dimensionamento).
--
--  Rode TODO este arquivo no SQL Editor do projeto Supabase das
--  calculadoras (nnflvtrkjxblafjlbrpg). É idempotente: pode rodar de novo.
--
--  Objetos dedicados com prefixo cloud_vms_* — não tocam nas tabelas
--  existentes (ex.: leads da Continuidade de TI).
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ────────────────────────────────────────────────────────────────────
--  1. LEADS  (pessoa + empresa que usou a calculadora)
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.cloud_vms_leads (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nome       text,
  sobrenome  text,
  empresa    text,
  email      text unique,
  whatsapp   text,
  perfil       text,
  origem       text,   -- como chegou até nós
  indicacao    text,   -- vendedor que indicou (mecanismo a definir)
  cargo        text,   -- picklist Salesforce
  funcionarios text,   -- faixa de quantidade de funcionários
  cotando      text,   -- já está cotando com outras empresas? (Sim/Não)
  previsao     text    -- tempo estimado para iniciar o projeto (picklist Salesforce)
);

-- Colunas novas em bases já existentes (idempotente).
alter table public.cloud_vms_leads add column if not exists sobrenome    text;
alter table public.cloud_vms_leads add column if not exists origem       text;
alter table public.cloud_vms_leads add column if not exists indicacao    text;
alter table public.cloud_vms_leads add column if not exists cargo        text;
alter table public.cloud_vms_leads add column if not exists funcionarios text;
alter table public.cloud_vms_leads add column if not exists cotando      text;
alter table public.cloud_vms_leads add column if not exists previsao     text;

-- ────────────────────────────────────────────────────────────────────
--  2. SUBMISSÕES  (cada projeto dimensionado)
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.cloud_vms_submissions (
  id                  uuid primary key default gen_random_uuid(),
  lead_id             uuid not null references public.cloud_vms_leads(id) on delete cascade,
  created_at          timestamptz not null default now(),

  -- configuração escolhida
  vms                 text,
  cameras             int,
  viewers             int,
  resolution          text,
  codec               text,
  fps                 int,
  retention           int,
  rec_type            text,
  movement            numeric,

  -- dimensionamento calculado
  os                  text,
  storage_util_gb     numeric,
  storage_servidor_gb numeric,
  link_min_mbps       int,
  link_ideal_mbps     int,
  num_servers         int,
  consumo_mensal_gb   numeric,
  growth_tb           numeric,
  custo_por_camera    numeric,
  custo_visualizacao  numeric,
  custo_total         numeric,
  plan_name           text,

  user_agent          text,
  completed_at        timestamptz not null default now()
);

create index if not exists cloud_vms_submissions_lead_id_idx
  on public.cloud_vms_submissions (lead_id);

-- ────────────────────────────────────────────────────────────────────
--  3. RLS  (acesso direto bloqueado; gravação só via RPC security definer)
-- ────────────────────────────────────────────────────────────────────
alter table public.cloud_vms_leads       enable row level security;
alter table public.cloud_vms_submissions enable row level security;
-- (sem policies de SELECT/INSERT para anon → nenhuma leitura/escrita direta)

-- ────────────────────────────────────────────────────────────────────
--  4. RPC  submit_cloud_vms(payload jsonb)
--     Chamada pelo front via supabase.rpc('submit_cloud_vms', { payload }).
--     Upsert do lead por e-mail + insere a submissão. Retorna o id da submissão.
-- ────────────────────────────────────────────────────────────────────
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
  -- Correlaciona o lead: (1) pelo id do gate, (2) por e-mail, (3) novo lead.
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
      updated_at = now()
    where id = v_in_id
    returning id into v_lead_id;
  end if;

  if v_lead_id is null and v_email is not null then
    -- upsert por e-mail (modo embed/site)
    insert into public.cloud_vms_leads
      (nome, sobrenome, empresa, email, whatsapp, perfil,
       origem, indicacao, cargo, funcionarios, cotando, previsao)
    values (v_lead->>'nome', v_lead->>'sobrenome', v_lead->>'empresa', v_email,
            v_lead->>'whatsapp', v_lead->>'perfil',
            v_lead->>'origem', v_lead->>'indicacao', v_lead->>'cargo',
            v_lead->>'funcionarios', v_lead->>'cotando', v_lead->>'previsao')
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
          updated_at = now()
    returning id into v_lead_id;
  end if;

  if v_lead_id is null then
    -- novo lead (modo standalone sem e-mail)
    insert into public.cloud_vms_leads
      (nome, sobrenome, empresa, email, whatsapp, perfil,
       origem, indicacao, cargo, funcionarios, cotando, previsao)
    values (v_lead->>'nome', v_lead->>'sobrenome', v_lead->>'empresa', v_email,
            v_lead->>'whatsapp', v_lead->>'perfil',
            v_lead->>'origem', v_lead->>'indicacao', v_lead->>'cargo',
            v_lead->>'funcionarios', v_lead->>'cotando', v_lead->>'previsao')
    returning id into v_lead_id;
  end if;

  -- submissão (configuração + dimensionamento)
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

-- ────────────────────────────────────────────────────────────────────
--  5. RPC  save_cloud_vms_lead(payload jsonb)
--     Captura o lead JÁ no cadastro (gate da calculadora), sem submissão.
--     Upsert por e-mail. Retorna o id do lead.
-- ────────────────────────────────────────────────────────────────────
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
    -- upsert por e-mail (modo embed/site)
    insert into public.cloud_vms_leads
      (nome, sobrenome, empresa, email, whatsapp, perfil,
       origem, indicacao, cargo, funcionarios, cotando, previsao)
    values (v_lead->>'nome', v_lead->>'sobrenome', v_lead->>'empresa', v_email,
            v_lead->>'whatsapp', v_lead->>'perfil',
            v_lead->>'origem', v_lead->>'indicacao', v_lead->>'cargo',
            v_lead->>'funcionarios', v_lead->>'cotando', v_lead->>'previsao')
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
          updated_at = now()
    returning id into v_lead_id;
  else
    -- novo lead (modo standalone sem e-mail) — id correlaciona com a submissão
    insert into public.cloud_vms_leads
      (nome, sobrenome, empresa, email, whatsapp, perfil,
       origem, indicacao, cargo, funcionarios, cotando, previsao)
    values (v_lead->>'nome', v_lead->>'sobrenome', v_lead->>'empresa', null,
            v_lead->>'whatsapp', v_lead->>'perfil',
            v_lead->>'origem', v_lead->>'indicacao', v_lead->>'cargo',
            v_lead->>'funcionarios', v_lead->>'cotando', v_lead->>'previsao')
    returning id into v_lead_id;
  end if;

  return v_lead_id;
end;
$$;

grant execute on function public.save_cloud_vms_lead(jsonb) to anon, authenticated;
