/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SAVE_ENDPOINT?: string;
  /** Origens confiáveis para postMessage do pai (CSV), quando embedada. */
  readonly VITE_PARENT_ORIGINS?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
