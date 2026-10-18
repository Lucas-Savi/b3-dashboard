import { TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import GrahamBadge from "../components/GrahamBadge";
import { useGraham, useHistory } from "../hooks/useGraham";
import { formatBRL, formatNumber, formatPercent } from "../lib/formatters";

const PERIODS = [
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1A", value: "1y" },
  { label: "2A", value: "2y" },
  { label: "5A", value: "5y" },
];

export default function Stock() {
  const { ticker = "" } = useParams();
  const [period, setPeriod] = useState("1y");

  const { data: graham, isLoading, error } = useGraham(ticker);
  const { data: history } = useHistory(ticker, period);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Carregando dados de {ticker}...
      </div>
    );
  }

  if (error || !graham) {
    return (
      <div className="text-red-400 text-center py-20">
        Ticker <strong>{ticker}</strong> não encontrado ou erro ao buscar dados.
      </div>
    );
  }

  const changePositive = (graham.change_percent ?? 0) >= 0;
  const changeColor = graham.change_percent === null ? "text-gray-400" : changePositive ? "text-green-400" : "text-red-400";
  const changeBg    = graham.change_percent === null ? "bg-gray-800" : changePositive ? "bg-green-900/50" : "bg-red-900/50";
  const changeValue = graham.price !== null && graham.change_percent !== null
    ? (graham.price * graham.change_percent) / (100 + graham.change_percent)
    : null;

  return (
    <div className="space-y-6">

      {/* ── Cotação ─────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">

          {/* Ticker + nome + preço */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{ticker}</h1>
              {graham.company_name && (
                <span className="text-sm text-gray-500">{graham.company_name}</span>
              )}
            </div>

            <div className="flex items-end gap-4 mt-2">
              <span className="text-5xl font-bold text-white tracking-tight">
                {formatBRL(graham.price)}
              </span>

              {graham.change_percent !== null && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${changeBg}`}>
                  {changePositive
                    ? <TrendingUp className="w-4 h-4 text-green-400" />
                    : <TrendingDown className="w-4 h-4 text-red-400" />}
                  <span className={`text-lg font-semibold ${changeColor}`}>
                    {changePositive ? "+" : ""}{formatPercent(graham.change_percent)}
                  </span>
                  {changeValue !== null && (
                    <span className={`text-sm ${changeColor} opacity-80`}>
                      ({changePositive ? "+" : ""}{formatBRL(changeValue)})
                    </span>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-600 mt-2">Variação do dia • Fonte: brapi.dev</p>
          </div>

          {/* Badge Graham */}
          <div className={`flex flex-col items-center justify-center px-5 py-3 rounded-xl border ${
            graham.aprovado_graham
              ? "border-green-700 bg-green-900/30"
              : "border-gray-700 bg-gray-800/50"
          }`}>
            <span className={`text-lg font-bold ${graham.aprovado_graham ? "text-green-300" : "text-gray-400"}`}>
              {graham.aprovado_graham ? "Aprovado" : "Reprovado"}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">Critérios de Graham</span>
          </div>
        </div>
      </div>

      {/* ── Gráfico histórico ───────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Histórico de Preços</h2>
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  period === p.value ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={history ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$${v}`}
              width={60}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
              labelStyle={{ color: "#9ca3af" }}
              formatter={(v: number) => [formatBRL(v), "Fechamento"]}
            />
            {/* linha do número de Graham como referência */}
            {graham.graham_number && (
              <ReferenceLine
                y={graham.graham_number}
                stroke="#facc15"
                strokeDasharray="4 3"
                label={{ value: `Graham: ${formatBRL(graham.graham_number)}`, fill: "#facc15", fontSize: 11, position: "insideTopRight" }}
              />
            )}
            <Line type="monotone" dataKey="close" stroke="#4ade80" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>

        {graham.graham_number && (
          <p className="text-xs text-yellow-600 mt-2">
            — Linha amarela: Número de Graham ({formatBRL(graham.graham_number)}) — preço justo estimado
          </p>
        )}
      </div>

      {/* ── Indicadores Graham ──────────────────────────── */}
      <div>
        <h2 className="font-semibold text-white mb-4">Análise Benjamin Graham</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GrahamBadge
            label="Número de Graham"
            value={formatBRL(graham.graham_number)}
            ok={graham.graham_number !== null && graham.price !== null ? graham.price < graham.graham_number : null}
            description="√(22,5 × LPA × VPA)"
          />
          <GrahamBadge
            label="Margem de Segurança"
            value={formatPercent(graham.margem_seguranca)}
            ok={graham.margem_seguranca !== null ? graham.margem_seguranca > 0 : null}
            description="(Graham - Preço) / Graham"
          />
          <GrahamBadge
            label="P/L"
            value={formatNumber(graham.pl)}
            ok={graham.pl !== null ? graham.pl <= 15 : null}
            description="Ideal ≤ 15"
          />
          <GrahamBadge
            label="P/VPA"
            value={formatNumber(graham.pvpa)}
            ok={graham.pvpa !== null ? graham.pvpa <= 1.5 : null}
            description="Ideal ≤ 1,5"
          />
          <GrahamBadge
            label="P/L × P/VPA"
            value={formatNumber(graham.pl_x_pvpa)}
            ok={graham.pl_x_pvpa !== null ? graham.pl_x_pvpa <= 22.5 : null}
            description="Ideal ≤ 22,5"
          />
          <GrahamBadge
            label="Liquidez Corrente"
            value={formatNumber(graham.liquidez_corrente)}
            ok={graham.liquidez_corrente !== null ? graham.liquidez_corrente >= 2 : null}
            description="Ideal ≥ 2,0"
          />
          <GrahamBadge
            label="Dívida/Patrimônio"
            value={formatNumber(graham.divida_patrimonio)}
            ok={graham.divida_patrimonio !== null ? graham.divida_patrimonio <= 1 : null}
            description="Ideal ≤ 1,0"
          />
          <GrahamBadge
            label="LPA"
            value={formatBRL(graham.lpa)}
            ok={graham.lpa !== null ? graham.lpa > 0 : null}
            description="Lucro Por Ação"
          />
        </div>
      </div>
    </div>
  );
}
