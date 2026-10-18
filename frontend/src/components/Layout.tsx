import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import TickerDropdown from "./TickerDropdown";

export default function Layout() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const ticker = search.trim().toUpperCase();
    if (ticker) {
      navigate(`/acao/${ticker}`);
      setSearch("");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white shrink-0">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Analisador B3
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ticker (ex: PETR4)"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </form>

          {/* Dropdown de todas as ações */}
          <TickerDropdown />

          <nav className="flex gap-4 text-sm text-gray-400 shrink-0">
            <Link to="/" className="hover:text-white transition-colors">Início</Link>
            <Link to="/screener" className="hover:text-white transition-colors">Screener</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-800 text-center text-xs text-gray-600 py-4">
        Dados de fontes abertas (brapi.dev · Yahoo Finance · CVM). Não constitui recomendação de investimento.
      </footer>
    </div>
  );
}
