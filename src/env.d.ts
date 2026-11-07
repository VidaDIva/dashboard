interface Window {
  marcarConexion(ok: boolean, mensaje?: string): void;
}

interface ImportMetaEnv {
  readonly PUBLIC_API_URL?: string;
  readonly PUBLIC_WS_URL?: string;
  readonly PUBLIC_VAPID_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
