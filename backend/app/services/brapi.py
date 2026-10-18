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
