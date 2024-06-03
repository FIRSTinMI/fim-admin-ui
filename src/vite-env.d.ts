/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPA_BASE_URL: string
  readonly PUBLIC_SUPA_KEY: string
  readonly PUBLIC_ADMIN_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}