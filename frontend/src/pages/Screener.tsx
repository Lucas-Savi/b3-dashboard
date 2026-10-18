import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRefreshScreener, useScreener, useScreenerStatus } from "../hooks/useScreener";
import { formatBRL, formatNumber, formatPercent } from "../lib/formatters";
import type { ScreenerEntry, ScreenerFilters } from "../types";

type SortKey = keyof ScreenerEntry;
type SortDir = "asc" | "desc";

const DEFAULT_FILTERS: ScreenerFilters = {
  pl_max: 15,
  pvpa_max: 1.5,
  pl_x_pvpa_max: 22.5,
  liquidez_min: 2.0,
  divida_max: 1.0,
  apenas_aprovados: false,
};

function StatusIcon({ ok }: { ok: boolean | null }) {
  if (ok === null) return <span className="text-gray-600">—</span>;
  return ok ? (
    <CheckCircle className="w-4 h-4 text-green-500 inline" />
  ) : (
    <XCircle className="w-4 h-4 text-red-500 inline" />
  );
}

function FilterInput({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  description: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-green-500"
      />
      <p className="text-xs text-gray-600 mt-0.5">{description}</p>
    </div>
  );
}

function exportCSV(data: ScreenerEntry[]) {
  const headers = [
    "Ticker", "Empresa", "Setor", "Preço", "Nº Graham", "Margem %",
    "P/L", "P/VPA", "P/L×P/VPA", "Liquidez", "Dív/PL", "Aprovado Graham",
  ];
  const rows = data.map((e) => [
    e.ticker,
    e.company_name ?? "",
    e.sector ?? "",
    e.price ?? "",
    e.graham_number ?? "",
    e.margem_seguranca ?? "",
    e.pl ?? "",
    e.pvpa ?? "",
    e.pl_x_pvpa ?? "",
    e.liquidez_corrente ?? "",
    e.divida_patrimonio ?? "",
    e.aprovado_graham ? "Sim" : "Não",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "screener-graham.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Screener() {
  const [filters, setFilters] = useState<ScreenerFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "margem_seguranca",
    dir: "desc",
  });

  const { data: status } = useScreenerStatus();
  const { data: entries = [], isLoading } = useScreener(filters);
  const refresh = useRefreshScreener();

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      const av = a[sort.key] as number | null;
      const bv = b[sort.key] as number | null;
      if (av === null) return 1;
      if (bv === null) return -1;
      return sort.dir === "asc" ? av - bv : bv - av;
    });
  }, [entries, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sort.key !== col) return <ChevronDown className="w-3 h-3 opacity-30 inline ml-1" />;
    return sort.dir === "desc"
      ? <ChevronDown className="w-3 h-3 text-green-400 inline ml-1" />
      : <ChevronUp className="w-3 h-3 text-green-400 inline ml-1" />;
  }

  const isRefreshing = status?.running || refresh.isPending;
  const lastUpdated = status?.finished_at
    ? new Date(status.finished_at).toLocaleString("pt-BR")
    : null;

  const thClass = "px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer hover:text-white select-none whitespace-nowrap";
  const tdClass = "px-3 py-2 text-sm text-gray-300 whitespace-nowrap";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="w-6 h-6 text-green-400" />
            <h1 className="text-2xl font-bold text-white">Screener Graham</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {status?.cached_count
              ? `${status.cached_count} ações em cache • `
              : ""}
            {lastUpdated ? `Última atualização: ${lastUpdated}` : "Nenhum dado em cache ainda"}
          </p>
        </div>
        <button
          onClick={() => refresh.mutate()}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {status?.running
                ? `Atualizando... ${status.processed}/${status.total}`
                : "Iniciando..."}
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Atualizar Dados
            </>
          )}
        </button>
      </div>

      <div className="flex gap-6 items-start">
        {/* Painel de filtros */}
        <aside className="w-64 shrink-0 bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Filtros</h2>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.apenas_aprovados}
              onChange={(e) =>
                setFilters((f) => ({ ...f, apenas_aprovados: e.target.checked }))
              }
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-sm text-gray-300">Apenas aprovados por Graham</span>
          </label>

          <FilterInput
            label="P/L máximo"
            value={filters.pl_max}
            onChange={(v) => setFilters((f) => ({ ...f, pl_max: v }))}
            description="Graham: ≤ 15"
          />
          <FilterInput
            label="P/VPA máximo"
            value={filters.pvpa_max}
            onChange={(v) => setFilters((f) => ({ ...f, pvpa_max: v }))}
            description="Graham: ≤ 1,5"
          />
          <FilterInput
            label="P/L × P/VPA máximo"
            value={filters.pl_x_pvpa_max}
            onChange={(v) => setFilters((f) => ({ ...f, pl_x_pvpa_max: v }))}
            description="Graham: ≤ 22,5"
          />
          <FilterInput
            label="Liquidez Corrente mínima"
            value={filters.liquidez_min}
            onChange={(v) => setFilters((f) => ({ ...f, liquidez_min: v }))}
            description="Graham: ≥ 2,0"
          />
          <FilterInput
            label="Dívida/PL máximo"
            value={filters.divida_max}
            onChange={(v) => setFilters((f) => ({ ...f, divida_max: v }))}
            description="Graham: ≤ 1,0"
          />

          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
          >
            Redefinir filtros
          </button>
        </aside>

        {/* Tabela de resultados */}
        <div className="flex-1 min-w-0">
          {/* Barra acima da tabela */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              {isLoading ? "Carregando..." : `${sorted.length} resultado${sorted.length !== 1 ? "s" : ""}`}
            </span>
            {sorted.length > 0 && (
              <button
                onClick={() => exportCSV(sorted)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            )}
          </div>

          {status?.cached_count === 0 && !isRefreshing && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-gray-500 mb-3">Nenhum dado em cache.</p>
              <p className="text-sm text-gray-600">
                Clique em <strong className="text-gray-400">Atualizar Dados</strong> para buscar
                os fundamentos das ações do Ibovespa (~60 ações, pode levar 1-2 min).
              </p>
            </div>
          )}

          {isRefreshing && status?.cached_count === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-3" />
              <p className="text-gray-400">
                Buscando dados de {status.processed}/{status.total} ações...
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Os resultados aparecerão aqui após a conclusão.
              </p>
            </div>
          )}

          {!isLoading && sorted.length === 0 && (status?.cached_count ?? 0) > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
              Nenhuma ação atende os filtros selecionados.
            </div>
          )}

          {sorted.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-800">
                    <tr>
                      <th className={thClass}>Ticker</th>
                      <th className={`${thClass} hidden md:table-cell`}>Empresa</th>
                      <th className={`${thClass} hidden lg:table-cell`}>Setor</th>
                      <th className={thClass} onClick={() => toggleSort("price")}>
                        Preço <SortIcon col="price" />
                      </th>
                      <th className={thClass} onClick={() => toggleSort("graham_number")}>
                        Nº Graham <SortIcon col="graham_number" />
                      </th>
                      <th className={thClass} onClick={() => toggleSort("margem_seguranca")}>
                        Margem % <SortIcon col="margem_seguranca" />
                      </th>
                      <th className={thClass} onClick={() => toggleSort("pl")}>
                        P/L <SortIcon col="pl" />
                      </th>
                      <th className={thClass} onClick={() => toggleSort("pvpa")}>
                        P/VPA <SortIcon col="pvpa" />
                      </th>
                      <th className={thClass} onClick={() => toggleSort("pl_x_pvpa")}>
                        P/L×P/VPA <SortIcon col="pl_x_pvpa" />
                      </th>
                      <th className={thClass} onClick={() => toggleSort("liquidez_corrente")}>
                        Liquidez <SortIcon col="liquidez_corrente" />
                      </th>
                      <th className={thClass} onClick={() => toggleSort("divida_patrimonio")}>
                        Dív/PL <SortIcon col="divida_patrimonio" />
                      </th>
                      <th className={thClass}>Graham</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {sorted.map((e) => (
                      <tr key={e.ticker} className="hover:bg-gray-800/50 transition-colors">
                        <td className={tdClass}>
                          <Link
                            to={`/acao/${e.ticker}`}
                            className="font-bold text-green-400 hover:text-green-300"
                          >
                            {e.ticker}
                          </Link>
                        </td>
                        <td className={`${tdClass} hidden md:table-cell text-gray-400 max-w-[180px] truncate`}>
                          {e.company_name ?? "—"}
                        </td>
                        <td className={`${tdClass} hidden lg:table-cell text-gray-500 max-w-[120px] truncate`}>
                          {e.sector ?? "—"}
                        </td>
                        <td className={tdClass}>{formatBRL(e.price)}</td>
                        <td className={tdClass}>{formatBRL(e.graham_number)}</td>
                        <td className={`${tdClass} font-medium`} style={{
                          color: e.margem_seguranca === null ? "#6b7280"
                            : e.margem_seguranca > 0 ? "#4ade80" : "#f87171"
                        }}>
                          {formatPercent(e.margem_seguranca)}
                        </td>
                        <td className={tdClass}>
                          <StatusIcon ok={e.pl !== null ? e.pl <= 15 : null} />
                          <span className="ml-1">{formatNumber(e.pl)}</span>
                        </td>
                        <td className={tdClass}>
                          <StatusIcon ok={e.pvpa !== null ? e.pvpa <= 1.5 : null} />
                          <span className="ml-1">{formatNumber(e.pvpa)}</span>
                        </td>
                        <td className={tdClass}>
                          <StatusIcon ok={e.pl_x_pvpa !== null ? e.pl_x_pvpa <= 22.5 : null} />
                          <span className="ml-1">{formatNumber(e.pl_x_pvpa)}</span>
                        </td>
                        <td className={tdClass}>
                          <StatusIcon ok={e.liquidez_corrente !== null ? e.liquidez_corrente >= 2 : null} />
                          <span className="ml-1">{formatNumber(e.liquidez_corrente)}</span>
                        </td>
                        <td className={tdClass}>
                          <StatusIcon ok={e.divida_patrimonio !== null ? e.divida_patrimonio <= 1 : null} />
                          <span className="ml-1">{formatNumber(e.divida_patrimonio)}</span>
                        </td>
                        <td className={tdClass}>
                          {e.aprovado_graham ? (
                            <span className="bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded-full font-medium">
                              Aprovado
                            </span>
                          ) : (
                            <span className="bg-gray-800 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                              Reprovado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
