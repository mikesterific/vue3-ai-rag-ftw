/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
  readonly VITE_TEMPERATURE: string;
  readonly VITE_CLAUDE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
