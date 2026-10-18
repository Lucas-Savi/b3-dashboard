export function formatBRL(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPercent(value: number | null, decimals = 2): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number | null, decimals = 2): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatLargeNumber(value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1e12) return `R$ ${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `R$ ${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `R$ ${(value / 1e6).toFixed(2)}M`;
  return formatBRL(value);
}
