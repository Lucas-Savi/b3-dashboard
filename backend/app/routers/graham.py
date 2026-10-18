from fastapi import APIRouter, HTTPException

from app.schemas.stock import GrahamResponse, ScreenerFilters
from app.services import brapi, graham, yfinance_service

router = APIRouter(prefix="/graham", tags=["Análise Graham"])


@router.get("/{ticker}", response_model=GrahamResponse)
async def analyze_graham(ticker: str):
    ticker = ticker.upper()

    quote_data, fundamentals_data = await _fetch_both(ticker)

    # brapi tem prioridade; yfinance como fallback para price e change_percent
    preco = (quote_data.get("price") if quote_data else None) or fundamentals_data.get("price")
    change_percent = (quote_data.get("change_percent") if quote_data else None)
    if change_percent is None:
        change_percent = fundamentals_data.get("change_percent")
    company_name = fundamentals_data.get("company_name")
    lpa = fundamentals_data.get("lpa")
    vpa = fundamentals_data.get("vpa")
    pl = fundamentals_data.get("pl")
    pvpa = fundamentals_data.get("pvpa")
    liquidez = fundamentals_data.get("liquidez_corrente")
    divida = fundamentals_data.get("divida_patrimonio")

    resultado = graham.avaliar_graham(preco, lpa, vpa, pl, pvpa, liquidez, divida)

    return GrahamResponse(
        ticker=ticker,
        company_name=company_name,
        price=preco,
        change_percent=change_percent,
        lpa=lpa,
        vpa=vpa,
        pl=pl,
        pvpa=pvpa,
        liquidez_corrente=liquidez,
        divida_patrimonio=divida,
        graham_number=resultado["graham_number"],
        margem_seguranca=resultado["margem_seguranca"],
        pl_x_pvpa=resultado["pl_x_pvpa"],
        aprovado_graham=resultado["aprovado_graham"],
    )


async def _fetch_both(ticker: str):
    import asyncio
    results = await asyncio.gather(
        brapi.get_quote(ticker),
        yfinance_service.get_fundamentals(ticker),
        return_exceptions=True,
    )
    quote = results[0] if not isinstance(results[0], Exception) else None
    fundamentals = results[1] if not isinstance(results[1], Exception) else {}
    return quote, fundamentals
