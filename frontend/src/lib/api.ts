import type {
  DividendsResponse,
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

  getDividends: (ticker: string) =>
    get<DividendsResponse>(`/fundamentals/${ticker}/dividends`),

  getGraham: (ticker: string) =>
    get<GrahamResponse>(`/graham/${ticker}`),

  listTickers: () =>
    get<string[]>("/quotes/"),

  getScreener: (filters: Partial<ScreenerFilters> = {}) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined) params.set(key, String(value));
    }
    return get<ScreenerEntry[]>(`/screener/?${params.toString()}`);
  },

  getScreenerStatus: () =>
    get<ScreenerStatus>("/screener/status"),

  triggerScreenerRefresh: () =>
    fetch("/api/screener/refresh", { method: "POST" }).then((r) => r.json()),
};
