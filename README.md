# Adentro — Calculadora Cloud VMS

App dedicado da **Calculadora de VMS na nuvem** da Adentro Tecnologia.
React + TypeScript + Vite + Tailwind v4. Publicado em **seg.adentro.com.br**.

Fluxo: cadastro em 2 etapas (contato → projeto) → calculadora de dimensionamento
(storage, link, servidores e custo) → envio da proposta. Os dados são persistidos
no Supabase via RPC.

## Rodar localmente

```bash
npm install
cp .env.example .env   # preencha as chaves do Supabase
npm run dev            # http://localhost:5173
npm run build          # gera dist/
```

## Rotas

| Rota            | O que abre                                        |
|-----------------|---------------------------------------------------|
| `/`             | Calculadora (cadastro → ferramenta) — entrada     |
| `/calcular`     | Idem (alias)                                       |
| `/apresentacao` | Landing institucional **oculta** (sem links)      |

## Variáveis de ambiente (Vercel)

| Variável                  | Valor                                          |
|---------------------------|------------------------------------------------|
| `VITE_SUPABASE_URL`       | `https://nnflvtrkjxblafjlbrpg.supabase.co`     |
| `VITE_SUPABASE_ANON_KEY`  | anon/public do projeto Supabase                |

## Banco de dados (Supabase)

Projeto `nnflvtrkjxblafjlbrpg` (compartilhado com as demais calculadoras).
Rode `supabase/cloud-vms-schema.sql` (idempotente) no SQL Editor. Se as tabelas
já existem, basta `supabase/migrate-sobrenome-e-id.sql` (adiciona `sobrenome`
e a correlação lead↔submissão por id, para o cadastro sem e-mail).

Objetos dedicados (prefixo `cloud_vms_*`): tabelas `cloud_vms_leads` e
`cloud_vms_submissions`, RPCs `save_cloud_vms_lead` e `submit_cloud_vms`
(RLS ativo; gravação só via RPC `security definer`).
