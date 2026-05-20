# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## GitHub

Repository: https://github.com/Lucas-Savi/b3-dashboard

Every time Claude edits a file, a PostToolUse hook runs `sync-github.ps1` which automatically commits and pushes changes to GitHub. No manual git commands are needed.

## Project overview

This repository contains two standalone static HTML files for B3 (Brazilian stock exchange) analysis. No build step, no dependencies, no server — open directly in a browser.

| File | Purpose |
|---|---|
| `index.html` | Personal dashboard tracking 3 fixed stocks (TAEE11, SANB11, ENGI11) with editable prices stored in `localStorage` |
| `b3-empresas.html` | Full B3 company browser: lists all stocks/FIIs/BDRs, applies Benjamin Graham's valuation formula, shows detailed financial data per company |

## Running the project

Double-click either HTML file or open via the browser. No build, install, or server required.

---

## index.html — Personal Dashboard

### Architecture

Single file with CSS in `<style>`, HTML structure, and JavaScript in `<script>`.

### Data flow

1. On load, `load()` reads `localStorage` (`b3_stocks_data`). If empty, falls back to the hardcoded `DEFAULT` array at the top of the script.
2. `render()` calls `renderCards(stocks)` and `renderTable(stocks)` — both read from the same `stocks` array in memory.
3. Derived values (change R$, change %) are computed on the fly by `change(s)` and `changePct(s)` — never stored, only displayed.

### Edit mode

Toggled by the **Editar / Salvar** button. When active, `body.editing` class is added, which via CSS makes all `.val` spans `contenteditable`. On save, the script walks every `.card[data-idx]`, reads `.val[data-field]` spans, strips BRL formatting, parses floats, and writes back into `stocks[idx][field]`. Then `save(stocks)` persists to `localStorage` and `render()` re-renders everything.

### Adding a new stock

Add an entry to the `DEFAULT` array (fields: `symbol`, `name`, `color`, `price`, `open`, `high`, `low`, `prevClose`, `volume`). `renderCards` and `renderTable` are data-driven and will pick it up automatically.

### localStorage keys (index.html)

| Key | Contents |
|---|---|
| `b3_stocks_data` | JSON array of stock objects |
| `b3_stocks_date` | Human-readable string of last save timestamp |

To reset to defaults, clear these two keys in DevTools → Application → Local Storage.

---

## b3-empresas.html — B3 Company Browser & Graham Analysis

### API: brapi.dev (free, no authentication required)

Base URL: `https://brapi.dev/api`

All endpoints work without a token. A free token from brapi.dev removes rate limiting and is recommended for the Graham bulk fetch.

#### Endpoints used

| Endpoint | Purpose |
|---|---|
| `GET /quote/list?limit=1000&type={stock\|fund\|bdr}` | Lists all B3 companies (`stock`, `name`, `close`, `change`, `market_cap`, `sector`, `logo`) |
| `GET /quote/{tickers}?fundamental=true` | **Bulk Graham fetch** — batches of 20, returns `earningsPerShare` + `priceEarnings`. Uses the lighter endpoint to avoid rate limiting |
| `GET /quote/{ticker}?range={range}&interval=1d&modules=defaultKeyStatistics,summaryProfile,financialData` | **Modal only** — full detail with price history, VPA (`bookValue`), P/VP, ROE, sector, description |

> **Why two different endpoints?** The `modules=` endpoint is heavily rate-limited on the free tier. Requesting it for 500+ stocks in batches triggers HTTP 429 after the first few calls. The `fundamental=true` endpoint is much more permissive and reliably returns LPA and P/L for every stock. Module data is fetched on-demand per stock when the user opens a modal.

#### Fields returned per module

**Root level** (always present):
`symbol`, `regularMarketPrice`, `earningsPerShare` (LPA), `priceEarnings` (P/L), `marketCap`, `logourl`, `regularMarketChangePercent`, `fiftyTwoWeekHigh/Low`, `historicalDataPrice[]`

**`defaultKeyStatistics`**:
`bookValue` (VPA), `priceToBook` (P/VP), `returnOnEquity` (ROE), `beta`, `dividendYield`, `debtToEquity`, `currentRatio`, `pegRatio`, `enterpriseToEbitda`, `trailingEps`, `enterpriseValue`

**`summaryProfile`**:
`sector`, `industry`, `longBusinessSummary`, `website`, `cnpj`, `fullTimeEmployees`

**`financialData`**:
`profitMargins`, `returnOnAssets`, `ebitda`, `totalDebt`, `freeCashflow`, `revenueGrowth`, `grossMargins`

### Graham formula

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

### Data loading strategy

- Company list cached 30 min per type (`b3_list_{type}`)
- Fundamental data cached 8 h per ticker (`b3_fund_{ticker}`)
- Graham bulk fetch: batches of 15 tickers with 1 s delay to respect rate limits
- HTTP 429 (rate limited): automatic retry up to 2× with exponential backoff (3.5 s, 7 s)
- Partial table results rendered after each successful batch

### localStorage keys (b3-empresas.html)

| Key | Contents |
|---|---|
| `b3_list_{type}` | Cached company list for `stock`, `fund`, or `bdr` (30 min) |
| `b3_fund_{ticker}` | Cached fundamental data per ticker (8 h) |
| `b3_det_{ticker}_{range}` | Cached modal detail per ticker + time range (30 min) |
| `b3cfg` | User config JSON: `{ token }` — optional brapi.dev token |

---

## Git workflow

Changes are committed and pushed automatically via a PostToolUse hook — no manual `git push` needed. The commit message includes the date/time of the change (`Auto-update: YYYY-MM-DD HH:mm`). The sync script lives at `C:\Users\lucas\.claude\sync-b3-dashboard.ps1`.
