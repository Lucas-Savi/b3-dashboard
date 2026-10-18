# Projeto: B3 Dashboard (Analisador de Ações B3)

Repositório: https://github.com/Lucas-Savi/b3-dashboard

Aplicação web para análise fundamentalista de ações listadas na B3 (Bolsa de Valores do Brasil), com foco nos indicadores de Benjamin Graham.

Este repositório une dois projetos:
- **App principal** (`backend/` + `frontend/`): React + FastAPI, vindo do antigo repositório `analisador-acoes-b3`.
- **Dashboards legados** (`legacy/`): dois HTMLs estáticos que abrem com duplo clique (carteira pessoal e navegador de empresas da B3). Ver a seção "Dashboards legados" no fim deste arquivo. As funcionalidades deles serão portadas para o app principal aos poucos.

---

## Stack Tecnológica

### Frontend
- **React 18 + Vite** — SPA com build rápido
- **TypeScript** — tipagem estática em todo o frontend
- **Tailwind CSS** — estilização utilitária
- **shadcn/ui** — componentes de UI acessíveis e customizáveis
- **Recharts** — gráficos (histórico de preços, indicadores, comparativos)
- **React Query (TanStack Query)** — cache e gerenciamento de estado assíncrono

### Backend
- **Python 3.11+**
- **FastAPI** — API REST com documentação automática (Swagger em `/docs`)
- **SQLite + SQLAlchemy** — cache local de dados financeiros
- **pandas / numpy** — cálculos financeiros e manipulação de dados
- **APScheduler** — atualização periódica dos dados em cache

### Dados (open, sem login)
| Fonte | Uso | Endpoint/Lib |
|---|---|---|
| **brapi.dev** | Cotações, dados básicos de ações brasileiras | `https://brapi.dev/api/quote/{ticker}` |
| **yfinance** | Dados históricos, fundamentos (Yahoo Finance) | `pip install yfinance` — ticker com sufixo `.SA` |
| **CVM (dados.cvm.gov.br)** | Demonstrativos contábeis oficiais (ITR, DFP) | API REST aberta, sem autenticação |
| **fundamentus** | Scraping de indicadores fundamentalistas | `pip install fundamentus` |

---

## Funcionalidades do Produto

### 1. Busca e Listagem de Ativos
- Busca por ticker ou nome da empresa
- Listagem de todas as ações da B3 com filtros por setor
- Tabela resumo com indicadores principais ordenáveis

### 2. Página de Ativo
- Preço atual, variação diária, volume
- Gráfico de histórico de preços (1M, 3M, 6M, 1A, 5A)
- Painel completo de indicadores fundamentalistas
- Demonstrativos financeiros simplificados (Receita, Lucro, Dívida)

### 3. Análise de Benjamin Graham
Indicadores calculados e exibidos com semáforo (verde/amarelo/vermelho):

| Indicador | Critério Graham | Fórmula |
|---|---|---|
| **Número de Graham** | Preço atual < Número de Graham | `√(22.5 × LPA × VPA)` |
| **Margem de Segurança** | > 0% (quanto maior, melhor) | `(Graham - Preço) / Graham × 100` |
| **P/L** (Preço/Lucro) | ≤ 15 | `Preço / LPA` |
| **P/VPA** (Preço/Valor Patrimonial) | ≤ 1.5 | `Preço / VPA` |
| **P/L × P/VPA** | ≤ 22.5 | Produto dos dois acima |
| **Liquidez Corrente** | ≥ 2.0 | `Ativo Circulante / Passivo Circulante` |
| **Dívida/Patrimônio** | ≤ 1.0 | `Dívida Total / Patrimônio Líquido` |
| **Crescimento de Lucros** | Positivo nos últimos 10 anos | Tendência do LPA |

### 4. Screener (Filtro de Ações)
- Filtrar ações que atendam todos os critérios de Graham simultaneamente
- Filtros customizáveis por faixas de cada indicador
- Exportar lista em CSV

### 5. Comparação de Ativos
- Comparar até 4 ativos lado a lado nos indicadores fundamentalistas

---

## Estrutura de Pastas

```
b3-dashboard/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas (Home, Ativo, Screener, Comparar)
│   │   ├── hooks/             # React Query hooks para cada endpoint
│   │   ├── lib/               # Utilitários, formatadores (BRL, %)
│   │   └── types/             # Tipos TypeScript compartilhados
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                   # Python + FastAPI
│   ├── app/
│   │   ├── main.py            # Entry point FastAPI
│   │   ├── routers/           # Endpoints por domínio (quote, fundamentals, graham)
│   │   ├── services/          # Lógica de negócio e cálculos
│   │   │   ├── graham.py      # Cálculos de Benjamin Graham
│   │   │   ├── brapi.py       # Integração brapi.dev
│   │   │   ├── cvm.py         # Integração CVM
│   │   │   └── yfinance_service.py
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── database.py        # Configuração SQLite
│   ├── requirements.txt
│   └── .env.example
│
├── legacy/                    # Dashboards HTML estáticos (index.html, b3-empresas.html)
├── start.bat / start.ps1      # Sobe backend + frontend no Windows
└── CLAUDE.md
```

---

## Comandos de Desenvolvimento

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
# Docs: http://localhost:8000/docs

# Frontend
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

---

## Workflow Git / GitHub

O repositório é mantido no GitHub e deve ser atualizado a cada funcionalidade concluída.

### Regras de commit e push
- **Commit + push após cada funcionalidade concluída** — não commitar código incompleto ou quebrado
- Mensagens de commit em **português**, no imperativo: `"Adiciona cálculo do Número de Graham"`
- Prefixos obrigatórios nas mensagens:
  - `feat:` — nova funcionalidade
  - `fix:` — correção de bug
  - `refactor:` — refatoração sem mudança de comportamento
  - `docs:` — apenas documentação
  - `chore:` — configuração, dependências, CI

### Arquivos que NUNCA devem ir ao GitHub
O `.gitignore` deve sempre excluir:
- `backend/venv/` e `frontend/node_modules/`
- `*.db` e `*.sqlite` — banco de dados local de cache
- `.env` — variáveis de ambiente (usar `.env.example` como template)
- `__pycache__/` e `*.pyc`
- `dist/` e `.vite/`

### Fluxo de trabalho
```bash
# Verificar estado antes de commitar
git status
git diff

# Criar commit com mensagem descritiva
git add <arquivos-especificos>
git commit -m "feat: adiciona screener com filtros de Graham"

# Push para o GitHub
git push origin master
```

### Branch strategy
- `master` — branch principal, sempre estável e funcionando
- Para mudanças experimentais ou grandes refatorações, criar branch separada:
  `git checkout -b feat/nome-da-feature`

---

## Regras e Convenções

- **Sem login obrigatório** — toda fonte de dados deve ser de acesso público e gratuito
- **Cache obrigatório** — dados de fundamentos são cacheados no SQLite por 24h; cotações por 15min
- **Sem chaves de API pagas** — usar apenas tiers gratuitos e abertos
- **TypeScript strict** no frontend — sem `any` explícito
- **Pydantic v2** para validação de dados no backend
- Formatação monetária sempre em **BRL (R$)**
- Percentuais com **2 casas decimais**
- Números de Graham exibidos com **2 casas decimais**

---

## Contexto de Domínio: Benjamin Graham

Benjamin Graham (pai do value investing) estabeleceu critérios para identificar ações subvalorizadas com margem de segurança. No contexto brasileiro:

- **LPA** = Lucro Por Ação (equivalente ao EPS americano)
- **VPA** = Valor Patrimonial Por Ação (Book Value per share)
- **P/L** = equivalente ao P/E ratio
- **P/VPA** = equivalente ao P/B ratio
- Ações de bancos e financeiras têm métricas diferentes (Liquidez Corrente não se aplica da mesma forma)
- Preferir ações do **Ibovespa** e **IBrX-100** para dados mais confiáveis nas APIs abertas

---

## Dashboards legados (`legacy/`)

Dois arquivos HTML independentes, sem build, sem dependências e sem servidor. Basta abrir no navegador.

| Arquivo | Função |
|---|---|
| `legacy/index.html` | Carteira pessoal com 3 ações fixas (TAEE11, SANB11, ENGI11) e preços editáveis salvos em `localStorage` |
| `legacy/b3-empresas.html` | Lista todas as ações/FIIs/BDRs da B3, aplica a fórmula de Graham e mostra dados financeiros detalhados por empresa |

### legacy/index.html — Personal Dashboard

#### Architecture

Single file with CSS in `<style>`, HTML structure, and JavaScript in `<script>`.

#### Data flow

1. On load, `load()` reads `localStorage` (`b3_stocks_data`). If empty, falls back to the hardcoded `DEFAULT` array at the top of the script.
2. `render()` calls `renderCards(stocks)` and `renderTable(stocks)` — both read from the same `stocks` array in memory.
3. Derived values (change R$, change %) are computed on the fly by `change(s)` and `changePct(s)` — never stored, only displayed.

#### Edit mode

Toggled by the **Editar / Salvar** button. When active, `body.editing` class is added, which via CSS makes all `.val` spans `contenteditable`. On save, the script walks every `.card[data-idx]`, reads `.val[data-field]` spans, strips BRL formatting, parses floats, and writes back into `stocks[idx][field]`. Then `save(stocks)` persists to `localStorage` and `render()` re-renders everything.

#### Adding a new stock

Add an entry to the `DEFAULT` array (fields: `symbol`, `name`, `color`, `price`, `open`, `high`, `low`, `prevClose`, `volume`). `renderCards` and `renderTable` are data-driven and will pick it up automatically.

#### localStorage keys (index.html)

| Key | Contents |
|---|---|
| `b3_stocks_data` | JSON array of stock objects |
| `b3_stocks_date` | Human-readable string of last save timestamp |

To reset to defaults, clear these two keys in DevTools → Application → Local Storage.

---

### legacy/b3-empresas.html — B3 Company Browser & Graham Analysis

#### API: brapi.dev (free, no authentication required)

Base URL: `https://brapi.dev/api`

All endpoints work without a token. A free token from brapi.dev removes rate limiting and is recommended for the Graham bulk fetch.

##### Endpoints used

| Endpoint | Purpose |
|---|---|
| `GET /quote/list?limit=1000&type={stock\|fund\|bdr}` | Lists all B3 companies (`stock`, `name`, `close`, `change`, `market_cap`, `sector`, `logo`) |
| `GET /quote/{tickers}?fundamental=true` | **Bulk Graham fetch** — batches of 20, returns `earningsPerShare` + `priceEarnings`. Uses the lighter endpoint to avoid rate limiting |
| `GET /quote/{ticker}?range={range}&interval=1d&modules=defaultKeyStatistics,summaryProfile,financialData` | **Modal only** — full detail with price history, VPA (`bookValue`), P/VP, ROE, sector, description |

> **Why two different endpoints?** The `modules=` endpoint is heavily rate-limited on the free tier. Requesting it for 500+ stocks in batches triggers HTTP 429 after the first few calls. The `fundamental=true` endpoint is much more permissive and reliably returns LPA and P/L for every stock. Module data is fetched on-demand per stock when the user opens a modal.

##### Fields returned per module

**Root level** (always present):
`symbol`, `regularMarketPrice`, `earningsPerShare` (LPA), `priceEarnings` (P/L), `marketCap`, `logourl`, `regularMarketChangePercent`, `fiftyTwoWeekHigh/Low`, `historicalDataPrice[]`

**`defaultKeyStatistics`**:
`bookValue` (VPA), `priceToBook` (P/VP), `returnOnEquity` (ROE), `beta`, `dividendYield`, `debtToEquity`, `currentRatio`, `pegRatio`, `enterpriseToEbitda`, `trailingEps`, `enterpriseValue`

**`summaryProfile`**:
`sector`, `industry`, `longBusinessSummary`, `website`, `cnpj`, `fullTimeEmployees`

**`financialData`**:
`profitMargins`, `returnOnAssets`, `ebitda`, `totalDebt`, `freeCashflow`, `revenueGrowth`, `grossMargins`

#### Graham formula

Two formulas, selected automatically by `calcG()`:

**Revised** (preferred — used in table after modal opens for that stock):
```
V* = sqrt(22.5 × LPA × VPA)
```
Requires `VPA = bookValue` from `defaultKeyStatistics` (only available after modal fetch).

**Original** (fallback — used in table for all stocks from bulk load):
```
V* = LPA × (8.5 + 2g) × (4.4 / Y)
```
- `g` = expected annual growth rate (user setting, default 5%)
- `Y` = Selic / risk-free rate (user setting, default 10.5%)
- Only requires `earningsPerShare` — always available from `fundamental=true`

Both: Margin of Safety = (V* − Price) / V* × 100

**5 Graham criteria evaluated per stock:**
1. LPA > 0 (profitable)
2. P/L ≤ 15
3. P/VP ≤ 1.5
4. P/L × P/VP ≤ 22.5 (combined Graham rule)
5. Margin of Safety ≥ 20%

#### Data loading strategy

- Company list cached 30 min per type (`b3_list_{type}`)
- Fundamental data cached 8 h per ticker (`b3_fund_{ticker}`) — merged on each fetch so modal data enriches bulk data
- Graham bulk fetch: batches of **20** tickers with **600 ms** delay using `fundamental=true`
- Modal fetch: single ticker with `modules=` — merged into `gData` so Graham table upgrades to revised formula after open
- HTTP 429: automatic retry up to 2× with exponential backoff (4 s, 8 s)
- Partial table results rendered after each successful batch

#### localStorage keys (b3-empresas.html)

| Key | Contents |
|---|---|
| `b3_list_{type}` | Cached company list for `stock`, `fund`, or `bdr` (30 min) |
| `b3_fund_{ticker}` | Cached fundamental data per ticker (8 h) |
| `b3_det_{ticker}_{range}` | Cached modal detail per ticker + time range (30 min) |
| `b3cfg` | User config JSON: `{ token }` — optional brapi.dev token |

---

### Sync automático (máquina local do Lucas)

Changes are committed and pushed automatically via a PostToolUse hook — no manual `git push` needed. The commit message includes the date/time of the change (`Auto-update: YYYY-MM-DD HH:mm`). The sync script lives at `C:\Users\lucas\.claude\sync-b3-dashboard.ps1`.
