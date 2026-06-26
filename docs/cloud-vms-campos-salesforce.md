# Cloud VMS — Mapa de campos para o Salesforce

Documentação dos dados capturados pela Calculadora Cloud VMS, para mapeamento no
Salesforce (via Zapier, usando o `lead_id` como chave). Fonte da verdade:
projeto Supabase **`nnflvtrkjxblafjlbrpg`**, tabelas `cloud_vms_*`.

O fluxo grava em **dois momentos**:
1. **Cadastro (gate)** → cria/atualiza a linha em `cloud_vms_leads` e devolve o `id`.
2. **"Falar com o time comercial"** → insere a linha em `cloud_vms_submissions`
   (configuração + dimensionamento), ligada ao lead pelo `lead_id`.

Um lead pode ter várias submissões (recalculou o projeto). Dedup do lead por
`email` (chave única) e/ou pelo `id` retornado no gate.

---

## Tabela 1 — `cloud_vms_leads` (a PESSOA / EMPRESA)

| Campo (banco) | Tipo | Origem | Sugestão de campo no Salesforce | Obrigatório |
|---|---|---|---|---|
| `id` | uuid | gerado | External Id (chave p/ Zapier) | auto |
| `created_at` | timestamp | gerado | Data de criação | auto |
| `updated_at` | timestamp | gerado | Última atualização | auto |
| `nome` | texto | Etapa 1 | First Name | **sim** |
| `sobrenome` | texto | Etapa 1 | Last Name | **sim** |
| `empresa` | texto | Etapa 1 | Company / Account | **sim** |
| `email` | texto (único) | Etapa 1 | Email | **sim** |
| `whatsapp` | texto | Etapa 1 | Phone / Mobile | **sim** |
| `cargo` | texto (picklist) | Etapa 2 | Title / picklist Cargo | **sim** |
| `funcionarios` | texto (picklist) | Etapa 2 | Nº de funcionários | **sim** |
| `cotando` | texto (Sim/Não) | Etapa 2 | Está cotando? | **sim** |
| `previsao` | texto (picklist) | Etapa 2 | Previsão de início | **sim** |
| `origem` | texto | reservado | Lead Source | não |
| `indicacao` | texto | reservado | Vendedor que indicou | não |
| `perfil` | texto | reservado | (uso futuro) | não |
| `utm_source` | texto | URL (oculto) | utm_source | não |
| `utm_medium` | texto | URL (oculto) | utm_medium | não |
| `utm_campaign` | texto | URL (oculto) | utm_campaign | não |
| `utm_content` | texto | URL (oculto) | utm_content | não |
| `utm_term` | texto | URL (oculto) | utm_term | não |
| `utm_creative_format` | texto | URL (oculto) | utm_creative_format | não |
| `utm_marketing_tactic` | texto | URL (oculto) | utm_marketing_tactic | não |
| `gclid` | texto | URL (oculto) | gclid (Google Ads) | não |

### Valores das picklists (exatamente como gravados)

**`cargo`**
- CEO / Sócio / VP
- C-Level / Diretor
- Gerente / Head
- Coordenador / Supervisor
- Analista / Assistente / Técnico / Desenvolvedor
- Consultor Externo

**`funcionarios`**
- 1–9 funcionários
- 10–49 funcionários
- 50–199 funcionários
- 200–499 funcionários
- 500–999 funcionários
- Mais de 1000 funcionários

**`cotando`**: `Sim` | `Não`

**`previsao`**
- Em até 30 dias / 1 mês
- Em até 3 meses
- Em até 6 meses
- Em até 12 meses / 1 ano
- Sem previsão

> **Campos ocultos (UTM + gclid):** capturados da query string da URL (ex.:
> `seg.adentro.com.br/?utm_source=facebook&utm_campaign=vms&gclid=...`). Só
> preenchem quando a campanha enviar o parâmetro; caso contrário ficam vazios.

---

## Tabela 2 — `cloud_vms_submissions` (o PROJETO calculado)

Ligada ao lead por `lead_id`. Útil como **Opportunity** ou registro relacionado.

### Configuração escolhida pelo usuário

| Campo (banco) | Tipo | Significado | Valores possíveis |
|---|---|---|---|
| `vms` | texto | Plataforma VMS | `segware-edge`, `segware-sigma`, `segware-egide`, `solutio`, `dguard`, `hikcentral`, `digifort`, `outro` |
| `cameras` | int | Nº de câmeras | número |
| `viewers` | int | Visualização de câmeras (simultâneas) | número |
| `resolution` | texto | Resolução média | `d1`, `720p`, `1080p`, `3mp`, `4mp`, `5mp`, `4k`, `12mp` (ou resolução detalhada) |
| `codec` | texto | Codec | `h264`, `h264plus`, `h265`, `h265plus` |
| `fps` | int | Frames por segundo | 1–30 |
| `retention` | int | Dias de retenção | 0–365 |
| `rec_type` | texto | Tipo de gravação | `continuous`, `motion`, `commercial`, `custom` |
| `movement` | numérico | Sensibilidade (quando motion) | 0.10–1.00 |

### Dimensionamento calculado (resultado)

| Campo (banco) | Tipo | Significado |
|---|---|---|
| `os` | texto | Sistema do servidor (`windows` / `linux`) |
| `storage_util_gb` | numérico | Armazenamento útil (GB) |
| `storage_servidor_gb` | numérico | Storage do servidor com overhead (GB) |
| `link_min_mbps` | int | Link mínimo (Mbps) |
| `link_ideal_mbps` | int | Link ideal recomendado (Mbps) |
| `num_servers` | int | Servidores VMS estimados |
| `consumo_mensal_gb` | numérico | Consumo mensal (GB) |
| `growth_tb` | numérico | Crescimento anual (TB) |
| `custo_por_camera` | numérico | Investimento por câmera/mês (R$) |
| `custo_visualizacao` | numérico | Custo da visualização/mês (R$) |
| `custo_total` | numérico | Investimento total/mês (R$) |
| `plan_name` | texto | Plano recomendado (Starter/Business/Enterprise/Premium) |
| `user_agent` | texto | Navegador (auditoria) |
| `completed_at` | timestamp | Quando foi calculado |

---

## Como o Zapier puxa (sugestão)

1. Gatilho: nova linha em `cloud_vms_submissions` (ou em `cloud_vms_leads`).
2. Buscar o lead por `lead_id` → trazer os campos de contato + qualificação + UTMs.
3. Criar/atualizar **Lead** no Salesforce (dedup por `email`).
4. Opcional: criar **Opportunity** com os campos de configuração + dimensionamento.

> Os dados ficam no Supabase (Brasil). O Salesforce recebe via integração — sem
> envio por e-mail/`mailto`.
