import type {
  FundamentalsResponse,
  GrahamResponse,
  HistoryPoint,
  QuoteResponse,
  ScreenerEntry,
  ScreenerFilters,
  ScreenerStatus,
} from "../types";

const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Erro ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  getQuote: (ticker: string) =>
    get<QuoteResponse>(`/quotes/${ticker}`),

  getFundamentals: (ticker: string) =>
    get<FundamentalsResponse>(`/fundamentals/${ticker}`),

  getHistory: (ticker: string, period = "1y") =>
    get<HistoryPoint[]>(`/fundamentals/${ticker}/history?period=${period}`),

  getGraham: (ticker: string) =>
    get<GrahamResponse>(`/graham/${ticker}`),

  listTickers: () =>
    get<string[]>("/quotes/"),

  getScreener: (filters: Partial<ScreenerFilters> = {}) => {
    const params = new URLSearchParams();
    if (filters.pl_max !== undefined) params.set("pl_max", String(filters.pl_max));
    if (filters.pvpa_max !== undefined) params.set("pvpa_max", String(filters.pvpa_max));
    if (filters.pl_x_pvpa_max !== undefined) params.set("pl_x_pvpa_max", String(filters.pl_x_pvpa_max));
    if (filters.liquidez_min !== undefined) params.set("liquidez_min", String(filters.liquidez_min));
    if (filters.divida_max !== undefined) params.set("divida_max", String(filters.divida_max));
    if (filters.apenas_aprovados !== undefined) params.set("apenas_aprovados", String(filters.apenas_aprovados));
    return get<ScreenerEntry[]>(`/screener/?${params.toString()}`);
  },

  getScreenerStatus: () =>
    get<ScreenerStatus>("/screener/status"),

  triggerScreenerRefresh: () =>
    fetch("/api/screener/refresh", { method: "POST" }).then((r) => r.json()),
};
