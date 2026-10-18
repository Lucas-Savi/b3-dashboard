import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { ScreenerFilters } from "../types";

export function useScreenerStatus() {
  return useQuery({
    queryKey: ["screener-status"],
    queryFn: api.getScreenerStatus,
    refetchInterval: (query) => (query.state.data?.running ? 2000 : false),
  });
}

export function useScreener(filters: Partial<ScreenerFilters>) {
  return useQuery({
    queryKey: ["screener", filters],
    queryFn: () => api.getScreener(filters),
    staleTime: 0,
  });
}

export function useRefreshScreener() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.triggerScreenerRefresh,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screener-status"] });
    },
    onSettled: () => {
      const poll = setInterval(async () => {
        const status = await api.getScreenerStatus();
        queryClient.setQueryData(["screener-status"], status);
        if (!status.running) {
          clearInterval(poll);
          queryClient.invalidateQueries({ queryKey: ["screener"] });
        }
      }, 2000);
    },
  });
}
