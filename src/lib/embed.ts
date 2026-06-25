import { useEffect } from "react";

/* ───────────── EMBED / IFRAME ─────────────
   A calculadora roda embedada (iframe) numa página do site, onde o contato
   (nome, e-mail, empresa, telefone) já foi captado por um formulário externo
   (ex.: Elementor). O e-mail é a chave que correlaciona os dois.

   Como o iframe é cross-origin, o contato chega por DOIS caminhos — e a
   calculadora suporta ambos:

   1. Query string na src do iframe:  …/calcular?email=joao@x.com&nome=João
   2. postMessage do pai:             iframe.contentWindow.postMessage(
        { type: "adentro:lead", email, nome, empresa, telefone }, origemDaCalc)

   O e-mail nunca é pedido de novo dentro da calculadora. */

export interface EmbedContact {
  nome?: string;
  email?: string;
  empresa?: string;
  telefone?: string;
  whatsapp?: string;
}

/** Origens confiáveis para postMessage (CSV em VITE_PARENT_ORIGINS). Vazio = aceita qualquer uma. */
const ALLOWED_ORIGINS = (import.meta.env.VITE_PARENT_ORIGINS ?? "")
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);

/** Lê o contato repassado pela URL (query string da src do iframe). */
export function readContactFromUrl(): EmbedContact {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const v = (p.get(k) ?? "").trim();
      if (v) return v;
    }
    return undefined;
  };
  const phone = get("whatsapp", "telefone", "phone");
  return {
    nome: get("nome", "name"),
    email: get("email"),
    empresa: get("empresa", "company"),
    telefone: phone,
    whatsapp: phone,
  };
}

/** Mescla no estado anterior apenas os campos de contato preenchidos. */
export function mergeContact<T extends EmbedContact>(prev: T, c: EmbedContact): T {
  const next = { ...prev };
  (Object.keys(c) as (keyof EmbedContact)[]).forEach((k) => {
    if (c[k]) (next as EmbedContact)[k] = c[k];
  });
  return next;
}

/**
 * Lê o contato da URL no load e escuta `postMessage` do pai. Chama `onContact`
 * com o que encontrar. Avisa o pai (`adentro:ready`) para cobrir a corrida em
 * que o iframe carrega depois do pai tentar enviar.
 */
export function useEmbeddedContact(onContact: (c: EmbedContact) => void) {
  useEffect(() => {
    const initial = readContactFromUrl();
    if (Object.values(initial).some(Boolean)) onContact(initial);

    function handle(e: MessageEvent) {
      if (ALLOWED_ORIGINS.length && !ALLOWED_ORIGINS.includes(e.origin)) return;
      const d = e.data;
      if (!d || typeof d !== "object" || d.type !== "adentro:lead") return;
      const phone = d.whatsapp ?? d.telefone ?? d.phone;
      onContact({
        nome: d.nome,
        email: d.email,
        empresa: d.empresa,
        telefone: phone,
        whatsapp: phone,
      });
    }

    window.addEventListener("message", handle);
    try {
      window.parent?.postMessage({ type: "adentro:ready" }, "*");
    } catch {
      /* sem pai acessível — segue só com a query string */
    }
    return () => window.removeEventListener("message", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Quando rodando dentro de um iframe, reporta a altura do conteúdo ao pai
 * (`{ type: "adentro:height", height }`) para que ele redimensione o iframe e
 * não fique com scroll interno nem corte. No-op fora de iframe.
 */
export function useReportHeight() {
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;
    const send = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "adentro:height", height }, "*");
    };
    send();
    const ro = new ResizeObserver(send);
    ro.observe(document.body);
    window.addEventListener("load", send);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", send);
    };
  }, []);
}
