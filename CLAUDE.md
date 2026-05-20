# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Single-file static dashboard (`index.html`) for tracking B3 stock quotes for TAEE11 (Taesa), SANB11 (Santander Brasil), and ENGI11 (Energisa). No build step, no dependencies, no server — open the file directly in a browser.

## Running the project

Double-click `index.html` or open it via the browser. No build, install, or server required.

## Architecture

Everything lives in one file (`index.html`) with three sections: CSS in `<style>`, HTML structure, and JavaScript in `<script>`.

### Data flow

1. On load, `load()` reads `localStorage` (`b3_stocks_data`). If empty, falls back to the hardcoded `DEFAULT` array at the top of the script.
2. `render()` calls `renderCards(stocks)` and `renderTable(stocks)` — both read from the same `stocks` array in memory.
3. Derived values (change R$, change %) are computed on the fly by `change(s)` and `changePct(s)` — they are never stored, only displayed.

### Edit mode

Toggled by the **Editar / Salvar** button. When active, `body.editing` class is added, which via CSS makes all `.val` spans `contenteditable`. On save, the script walks every `.card[data-idx]`, reads `.val[data-field]` spans, strips BRL formatting, parses floats, and writes back into `stocks[idx][field]`. Then `save(stocks)` persists to `localStorage` and `render()` re-renders everything.

### Adding a new stock

Add an entry to the `DEFAULT` array (fields: `symbol`, `name`, `color`, `price`, `open`, `high`, `low`, `prevClose`, `volume`). `renderCards` and `renderTable` are data-driven and will pick it up automatically.

### localStorage keys

| Key | Contents |
|---|---|
| `b3_stocks_data` | JSON array of stock objects |
| `b3_stocks_date` | Human-readable string of last save timestamp |

To reset to defaults, clear these two keys in DevTools → Application → Local Storage.
