/**
 * Base da API em produção (`VITE_BACKEND_URL`, ex.: https://api.scancal.com.br).
 * Em dev vazio, usa caminho relativo `/api/...` e o proxy do Vite.
 */
export function getApiBaseUrl() {
  const raw =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_URL
      ? String(import.meta.env.VITE_BACKEND_URL).trim()
      : "";
  return raw.replace(/\/+$/, "");
}

/** Monta URL absoluta para um path que começa com `/api/`. */
export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${p}` : p;
}

/** Prefixo `/api` absoluto ou relativo (para o painel admin). */
export function getApiPrefix() {
  const base = getApiBaseUrl();
  return base ? `${base}/api` : "/api";
}
