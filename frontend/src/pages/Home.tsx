import { Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EXEMPLOS = ["PETR4", "VALE3", "ITUB4", "BBDC4", "WEGE3", "MGLU3"];

export default function Home() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    const ticker = input.trim().toUpperCase();
    if (ticker) navigate(`/acao/${ticker}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center">
      <div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <TrendingUp className="w-10 h-10 text-green-400" />
          <h1 className="text-4xl font-bold text-white">Analisador de Ações B3</h1>
        </div>
        <p className="text-gray-400 max-w-lg">
          Análise fundamentalista de ações brasileiras com os critérios de{" "}
          <span className="text-green-400 font-medium">Benjamin Graham</span>.
          Dados abertos, sem login.
        </p>
      </div>

      <form onSubmit={handleBuscar} className="flex gap-2 w-full max-w-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite o ticker (ex: PETR4)"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Search className="w-4 h-4" />
          Analisar
        </button>
      </form>

      <div>
        <p className="text-xs text-gray-600 mb-3">Exemplos populares:</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {EXEMPLOS.map((t) => (
            <button
              key={t}
              onClick={() => navigate(`/acao/${t}`)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-1.5 rounded-full transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 text-center mt-4">
        {[
          { label: "Número de Graham", desc: "Preço justo calculado por √(22,5 × LPA × VPA)" },
          { label: "Margem de Segurança", desc: "Desconto do preço atual em relação ao valor Graham" },
          { label: "Screener Graham", desc: "Filtre ações que atendem todos os critérios" },
        ].map((item) => (
          <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-1">{item.label}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
