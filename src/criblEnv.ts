/** Cribl App Platform sets these on `window` at runtime. Local dev can use `VITE_CRIBL_API_URL`. */
export function getCriblApiUrl(): string {
  const w = window as Window & { CRIBL_API_URL?: string }
  if (w.CRIBL_API_URL) return w.CRIBL_API_URL
  const fromVite = import.meta.env.VITE_CRIBL_API_URL
  if (typeof fromVite === 'string' && fromVite.length > 0) return fromVite
  return 'http://localhost:9000/api/v1'
}

export function getCriblBasePath(): string {
  const w = window as Window & { CRIBL_BASE_PATH?: string }
  if (w.CRIBL_BASE_PATH) return w.CRIBL_BASE_PATH
  return '/'
}
