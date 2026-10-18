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

export interface DividendYear {
  ano: number;
  dy: number;
}

export interface DividendsResponse {
  ticker: string;
  price: number | null;
  dy_12m: number | null;
  dy_5a: number | null;
  dy_10a: number | null;
  dy_medio: number | null;
  anos_historico: number;
  historico: DividendYear[];
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
  dy_12m: number | null;
  dy_5a: number | null;
  dy_10a: number | null;
  dy_medio: number | null;
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
  last_updated: string | null;
}

// null = filtro desligado
export interface ScreenerFilters {
  pl_max: number | null;
  pvpa_max: number | null;
  pl_x_pvpa_max: number | null;
  liquidez_min: number | null;
  divida_max: number | null;
  margem_min: number | null;
  apenas_aprovados: boolean;
}
