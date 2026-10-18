from fastapi import APIRouter, HTTPException

from app.schemas.stock import FundamentalsResponse
from app.services import yfinance_service

router = APIRouter(prefix="/fundamentals", tags=["Fundamentos"])


@router.get("/{ticker}", response_model=FundamentalsResponse)
async def get_fundamentals(ticker: str):
    ticker = ticker.upper()
    try:
        data = await yfinance_service.get_fundamentals(ticker)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro ao buscar fundamentos: {e}")
    return data


@router.get("/{ticker}/history")
async def get_history(ticker: str, period: str = "1y"):
    ticker = ticker.upper()
    valid_periods = {"1mo", "3mo", "6mo", "1y", "2y", "5y"}
    if period not in valid_periods:
        raise HTTPException(status_code=400, detail=f"Período inválido. Use: {valid_periods}")
    try:
        return await yfinance_service.get_history(ticker, period)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro ao buscar histórico: {e}")
