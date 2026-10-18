import httpx

BASE_URL = "https://brapi.dev/api"


async def get_quote(ticker: str) -> dict | None:
    url = f"{BASE_URL}/quote/{ticker}"
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()

    results = data.get("results", [])
    if not results:
        return None

    r = results[0]
    return {
        "ticker": r.get("symbol"),
        "price": r.get("regularMarketPrice"),
        "change_percent": r.get("regularMarketChangePercent"),
        "volume": r.get("regularMarketVolume"),
        "market_cap": r.get("marketCap"),
    }


async def list_available_tickers() -> list[str]:
    url = f"{BASE_URL}/available"
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()
    return data.get("stocks", [])


async def list_stocks() -> list[dict]:
    """Todas as ações listadas na B3 (sem FIIs e BDRs), com nome, setor e último preço."""
    url = f"{BASE_URL}/quote/list"
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, params={"type": "stock", "limit": 10000})
        response.raise_for_status()
        data = response.json()

    stocks = []
    for s in data.get("stocks", []):
        ticker = s.get("stock")
        if not ticker:
            continue
        stocks.append({
            "ticker": ticker,
            "name": s.get("name"),
            "sector": s.get("sector"),
            "close": s.get("close"),
        })
    return stocks
