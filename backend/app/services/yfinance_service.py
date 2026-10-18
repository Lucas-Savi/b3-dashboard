import asyncio
from functools import partial

import yfinance as yf

from app.services.dividends import calcular_dividend_yield


def _fetch_fundamentals(ticker: str) -> dict:
    yf_ticker = yf.Ticker(f"{ticker}.SA")
    info = yf_ticker.info

    raw_dte = info.get("debtToEquity")
    price = (
        info.get("currentPrice")
        or info.get("regularMarketPrice")
        or info.get("previousClose")
    )
    change_percent = info.get("regularMarketChangePercent")

    return {
        "ticker": ticker,
        "company_name": info.get("longName") or info.get("shortName"),
        "sector": info.get("sector"),
        "price": price,
        "change_percent": change_percent,
        "lpa": info.get("trailingEps"),
        "vpa": _calc_vpa(info),
        "pl": info.get("trailingPE"),
        "pvpa": info.get("priceToBook"),
        "liquidez_corrente": info.get("currentRatio"),
        # yfinance retorna debtToEquity como percentual (ex: 150 = ratio 1.5)
        "divida_patrimonio": round(raw_dte / 100, 4) if raw_dte is not None else None,
    }


def _calc_vpa(info: dict) -> float | None:
    book_value = info.get("bookValue")
    return round(book_value, 2) if book_value is not None else None


async def get_fundamentals(ticker: str) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, partial(_fetch_fundamentals, ticker))


def _fetch_history(ticker: str, period: str) -> list[dict]:
    yf_ticker = yf.Ticker(f"{ticker}.SA")
    hist = yf_ticker.history(period=period)
    hist = hist.reset_index()
    return [
        {
            "date": str(row["Date"].date()),
            "close": round(row["Close"], 2),
            "volume": int(row["Volume"]),
        }
        for _, row in hist.iterrows()
    ]


async def get_history(ticker: str, period: str = "1y") -> list[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, partial(_fetch_history, ticker, period))


def _fetch_dividends(ticker: str) -> dict:
    yf_ticker = yf.Ticker(f"{ticker}.SA")
    # auto_adjust=False: preço de fechamento real (só ajustado por desdobramentos),
    # na mesma base dos proventos retornados por .dividends
    hist = yf_ticker.history(period="max", interval="1mo", auto_adjust=False)
    if hist.empty:
        return calcular_dividend_yield(yf_ticker.dividends, {}, None) | {"price": None}
    closes = hist["Close"].dropna()
    fechamentos_anuais = {int(ano): float(v) for ano, v in closes.groupby(closes.index.year).last().items()}
    preco_atual = float(closes.iloc[-1])
    resultado = calcular_dividend_yield(yf_ticker.dividends, fechamentos_anuais, preco_atual)
    return resultado | {"price": round(preco_atual, 2)}


async def get_dividends(ticker: str) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, partial(_fetch_dividends, ticker))
