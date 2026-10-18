import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDividends } from "../hooks/useGraham";
import { formatPercent } from "../lib/formatters";
import GrahamBadge from "./GrahamBadge";

export default function DividendYieldPanel({ ticker }: { ticker: string }) {
  const { data, isLoading, error } = useDividends(ticker);

  return (
    <div>
      <h2 className="font-semibold text-white mb-4">Dividend Yield</h2>

      {isLoading && <p className="text-sm text-gray-500">Carregando dividendos...</p>}
      {error && <p className="text-sm text-red-400">Erro ao buscar dividendos de {ticker}.</p>}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GrahamBadge
              label="DY 12 meses"
              value={formatPercent(data.dy_12m)}
              ok={null}
              description="Proventos dos últimos 12 meses / preço atual"
            />
            <GrahamBadge
              label="DY médio 5 anos"
              value={formatPercent(data.dy_5a)}
              ok={null}
              description="Média do DY anual dos últimos 5 anos completos"
            />
            <GrahamBadge
              label="DY médio 10 anos"
              value={formatPercent(data.dy_10a)}
              ok={null}
              description="Média do DY anual dos últimos 10 anos completos"
            />
            <GrahamBadge
              label="DY médio"
              value={formatPercent(data.dy_medio)}
              ok={null}
              description={`Média do DY anual de todo o histórico (${data.anos_historico} anos)`}
            />
          </div>

          {data.historico.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">DY por ano</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.historico.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="ano" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                    width={45}
                  />
                  <Tooltip
                    cursor={{ fill: "#1f2937" }}
                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                    labelStyle={{ color: "#9ca3af" }}
                    formatter={(v: number) => [formatPercent(v), "DY"]}
                  />
                  {data.dy_medio !== null && (
                    <ReferenceLine
                      y={data.dy_medio}
                      stroke="#facc15"
                      strokeDasharray="4 3"
                      label={{ value: `Média: ${formatPercent(data.dy_medio)}`, fill: "#facc15", fontSize: 11, position: "insideTopRight" }}
                    />
                  )}
                  <Bar dataKey="dy" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-2">
                DY do ano = proventos pagos no ano / preço de fechamento do ano • Fonte: Yahoo Finance
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
