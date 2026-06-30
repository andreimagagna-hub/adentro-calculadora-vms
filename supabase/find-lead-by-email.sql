-- ────────────────────────────────────────────────────────────────────
-- RPC: find_cloud_vms_lead_by_email
-- Busca um lead já cadastrado pelo e-mail (login direto).
-- Security definer: roda com permissões do owner, não do caller.
-- Retorna NULL se não encontrado.
-- Idempotente: pode rodar múltiplas vezes sem problema.
-- ────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.find_cloud_vms_lead_by_email(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead jsonb;
BEGIN
  SELECT to_jsonb(l.*) INTO v_lead
  FROM cloud_vms_leads l
  WHERE lower(trim(l.email)) = lower(trim(p_email))
  LIMIT 1;

  RETURN v_lead;  -- NULL se não encontrado
END;
$$;

-- Permissão para o papel anon (usado pelo frontend via Supabase JS)
GRANT EXECUTE ON FUNCTION public.find_cloud_vms_lead_by_email(text) TO anon;
GRANT EXECUTE ON FUNCTION public.find_cloud_vms_lead_by_email(text) TO authenticated;
