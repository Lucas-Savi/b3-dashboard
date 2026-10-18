import asyncio
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.stock import ScreenerEntry
from app.services import brapi, graham as graham_svc, yfinance_service

IBOVESPA_TICKERS = [
    "ABEV3", "ALOS3", "ASAI3", "AZUL4",
    "B3SA3", "BBAS3", "BBDC3", "BBDC4", "BBSE3",
    "BPAC11", "BRAP4", "BRFS3", "BRKM5",
    "CCRO3", "CIEL3", "CMIG4", "CMIN3",
    "COGN3", "CPFE3", "CPLE6", "CRFB3", "CSAN3",
    "CSNA3", "CYRE3", "ELET3", "ELET6",
    "EMBR3", "ENEV3", "ENGI11", "EQTL3",
    "EZTC3", "FLRY3", "GGBR4", "GOAU4",
    "HAPV3", "HYPE3", "IRBR3", "ITSA4", "ITUB4",
    "JBSS3", "KLBN11", "LREN3",
    "MGLU3", "MRFG3", "MRVE3", "MULT3",
    "PCAR3", "PETR3", "PETR4", "PRIO3",
    "QUAL3", "RADL3", "RAIL3", "RDOR3",
    "RENT3", "SANB11", "SBSP3", "SLCE3",
    "SUZB3", "TAEE11", "TIMS3", "TOTS3",
    "UGPA3", "USIM5", "VALE3", "VBBR3",
    "VIVT3", "WEGE3", "YDUQ3",
]

_status: dict = {
    "running": False,
    "started_at": None,
    "finished_at": None,
    "processed": 0,
    "total": len(IBOVESPA_TICKERS),
    "errors": 0,
}


def get_status() -> dict:
    return dict(_status)


async def refresh_all(db: Session) -> None:
    global _status
    _status = {
        "running": True,
        "started_at": datetime.utcnow().isoformat(),
        "finished_at": None,
        "processed": 0,
        "total": len(IBOVESPA_TICKERS),
        "errors": 0,
    }

    sem = asyncio.Semaphore(5)

    async def fetch_and_save(ticker: str) -> None:
        async with sem:
            try:
                quote, fundamentals = await asyncio.gather(
                    brapi.get_quote(ticker),
                    yfinance_service.get_fundamentals(ticker),
                    return_exceptions=True,
                )

                q = quote if not isinstance(quote, Exception) else {}
                f = fundamentals if not isinstance(fundamentals, Exception) else {}

                # brapi tem prioridade; yfinance como fallback de preço
                price = (q or {}).get("price") or (f or {}).get("price")
                lpa = (f or {}).get("lpa")
                vpa = (f or {}).get("vpa")
                pl = (f or {}).get("pl")
                pvpa = (f or {}).get("pvpa")
                liquidez = (f or {}).get("liquidez_corrente")
                divida = (f or {}).get("divida_patrimonio")

                resultado = graham_svc.avaliar_graham(price, lpa, vpa, pl, pvpa, liquidez, divida)

                company_name = (f or {}).get("company_name")
                sector = (f or {}).get("sector")

                entry = db.get(ScreenerEntry, ticker)
                if entry is None:
                    entry = ScreenerEntry(ticker=ticker)
                    db.add(entry)

                entry.company_name = company_name
                entry.sector = sector
                entry.price = price
                entry.lpa = lpa
                entry.vpa = vpa
                entry.pl = pl
                entry.pvpa = pvpa
                entry.pl_x_pvpa = resultado["pl_x_pvpa"]
                entry.graham_number = resultado["graham_number"]
                entry.margem_seguranca = resultado["margem_seguranca"]
                entry.liquidez_corrente = liquidez
                entry.divida_patrimonio = divida
                entry.aprovado_graham = resultado["aprovado_graham"]
                entry.updated_at = datetime.utcnow()

                db.commit()
            except Exception:
                _status["errors"] += 1
            finally:
                _status["processed"] += 1

    await asyncio.gather(*[fetch_and_save(t) for t in IBOVESPA_TICKERS])

    _status["running"] = False
    _status["finished_at"] = datetime.utcnow().isoformat()


def query_screener(
    db: Session,
    pl_max: float = 15.0,
    pvpa_max: float = 1.5,
    pl_x_pvpa_max: float = 22.5,
    liquidez_min: float = 2.0,
    divida_max: float = 1.0,
    apenas_aprovados: bool = False,
) -> list[ScreenerEntry]:
    rows: list[ScreenerEntry] = db.query(ScreenerEntry).all()

    if apenas_aprovados:
        return [r for r in rows if r.aprovado_graham]

    def passes(r: ScreenerEntry) -> bool:
        checks = []
        if r.pl is not None:
            checks.append(r.pl <= pl_max)
        if r.pvpa is not None:
            checks.append(r.pvpa <= pvpa_max)
        if r.pl_x_pvpa is not None:
            checks.append(r.pl_x_pvpa <= pl_x_pvpa_max)
        if r.liquidez_corrente is not None:
            checks.append(r.liquidez_corrente >= liquidez_min)
        if r.divida_patrimonio is not None:
            checks.append(r.divida_patrimonio <= divida_max)
        return all(checks) if checks else False

    return [r for r in rows if passes(r)]
