import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useGraham(ticker: string) {
  return useQuery({
    queryKey: ["graham", ticker],
    queryFn: () => api.getGraham(ticker),
    enabled: !!ticker,
  });
}

export function useQuote(ticker: string) {
  return useQuery({
    queryKey: ["quote", ticker],
    queryFn: () => api.getQuote(ticker),
    enabled: !!ticker,
    refetchInterval: 1000 * 60 * 15,
  });
}

export function useHistory(ticker: string, period = "1y") {
  return useQuery({
    queryKey: ["history", ticker, period],
    queryFn: () => api.getHistory(ticker, period),
    enabled: !!ticker,
  });
}

export function useTickers() {
  return useQuery({
    queryKey: ["tickers"],
    queryFn: api.listTickers,
    staleTime: 1000 * 60 * 60,
  });
}
