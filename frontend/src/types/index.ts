export interface QuoteResponse {
  ticker: string;
  price: number | null;
  change_percent: number | null;
  volume: number | null;
  market_cap: number | null;
}

export interface FundamentalsResponse {
  ticker: string;
  lpa: number | null;
  vpa: number | null;
  pl: number | null;
  pvpa: number | null;
  liquidez_corrente: number | null;
  divida_patrimonio: number | null;
}

export interface GrahamResponse {
  ticker: string;
  company_name: string | null;
  price: number | null;
  change_percent: number | null;
  lpa: number | null;
  vpa: number | null;
  graham_number: number | null;
  margem_seguranca: number | null;
  pl: number | null;
  pvpa: number | null;
  pl_x_pvpa: number | null;
  liquidez_corrente: number | null;
  divida_patrimonio: number | null;
  aprovado_graham: boolean;
}

export interface HistoryPoint {
  date: string;
  close: number;
  volume: number;
}

export interface ScreenerEntry {
  ticker: string;
  company_name: string | null;
  sector: string | null;
  price: number | null;
  lpa: number | null;
  vpa: number | null;
  pl: number | null;
  pvpa: number | null;
  pl_x_pvpa: number | null;
  graham_number: number | null;
  margem_seguranca: number | null;
  liquidez_corrente: number | null;
  divida_patrimonio: number | null;
  aprovado_graham: boolean;
  updated_at: string | null;
}

export interface ScreenerStatus {
  running: boolean;
  started_at: string | null;
  finished_at: string | null;
  processed: number;
  total: number;
  errors: number;
  cached_count: number;
}

export interface ScreenerFilters {
  pl_max: number;
  pvpa_max: number;
  pl_x_pvpa_max: number;
  liquidez_min: number;
  divida_max: number;
  apenas_aprovados: boolean;
}
