import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTickers } from "../hooks/useGraham";

export default function TickerDropdown() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: tickers = [], isLoading } = useTickers();

  const sorted = [...tickers].sort();
  const filtered = filter.trim()
    ? sorted.filter((t) => t.startsWith(filter.trim().toUpperCase()))
    : sorted;

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFilter("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Foca o input ao abrir
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  function handleSelect(ticker: string) {
    setOpen(false);
    setFilter("");
    navigate(`/acao/${ticker}`);
  }

  // Agrupamento por letra inicial
  const grouped: Record<string, string[]> = {};
  for (const t of filtered) {
    const letter = t[0];
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(t);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        Todas as Ações
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Campo de busca */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800">
            <Search className="w-4 h-4 text-gray-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar ticker..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            />
            {filter && (
              <button onClick={() => setFilter("")}>
                <X className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300" />
              </button>
            )}
          </div>

          {/* Contagem */}
          <div className="px-3 py-1.5 text-xs text-gray-600 border-b border-gray-800">
            {filtered.length} ação{filtered.length !== 1 ? "ões" : ""}
            {filter && ` para "${filter.toUpperCase()}"`}
          </div>

          {/* Lista */}
          <div className="overflow-y-auto max-h-72">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-600 text-sm py-6">Nenhum resultado</p>
            ) : filter.trim() ? (
              // Sem agrupamento quando filtrando
              <div className="py-1">
                {filtered.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleSelect(t)}
                    className="w-full text-left px-4 py-1.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-mono"
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              // Agrupado por letra
              Object.entries(grouped).map(([letter, items]) => (
                <div key={letter}>
                  <div className="px-3 py-1 text-xs font-bold text-gray-600 bg-gray-950 sticky top-0">
                    {letter}
                  </div>
                  {items.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleSelect(t)}
                      className="w-full text-left px-4 py-1.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-mono"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
