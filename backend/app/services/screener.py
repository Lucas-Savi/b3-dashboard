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
    "total": 0,
    "errors": 0,
}


def get_status() -> dict:
    return dict(_status)


async def _load_universe() -> list[dict]:
    """Lista de todas as ações da B3 via brapi; se a brapi falhar, usa o Ibovespa fixo."""
    try:
        stocks = await brapi.list_stocks()
    except Exception:
        stocks = []
    if not stocks:
        return [{"ticker": t} for t in IBOVESPA_TICKERS]

    # Descarta o mercado fracionário (PETR4F) quando o ticker cheio também está na lista
    tickers = {s["ticker"] for s in stocks}
    return [
        s for s in stocks
        if not (s["ticker"].endswith("F") and s["ticker"][:-1] in tickers)
    ]


async def refresh_all(db: Session) -> None:
    global _status
    _status = {
        "running": True,
        "started_at": datetime.utcnow().isoformat(),
        "finished_at": None,
        "processed": 0,
        "total": 0,
        "errors": 0,
    }

    universe = await _load_universe()
    _status["total"] = len(universe)

    sem = asyncio.Semaphore(5)

    async def fetch_and_save(item: dict) -> None:
        ticker = item["ticker"]
        async with sem:
            try:
                fundamentals, dividends = await asyncio.gather(
                    yfinance_service.get_fundamentals(ticker),
                    yfinance_service.get_dividends(ticker),
                    return_exceptions=True,
                )

                f = fundamentals if not isinstance(fundamentals, Exception) else {}
                d = dividends if not isinstance(dividends, Exception) else {}

                # Preço da lista da brapi tem prioridade; yfinance como fallback
                price = item.get("close") or (f or {}).get("price")
                lpa = (f or {}).get("lpa")
                vpa = (f or {}).get("vpa")
                pl = (f or {}).get("pl")
                pvpa = (f or {}).get("pvpa")
                liquidez = (f or {}).get("liquidez_corrente")
                divida = (f or {}).get("divida_patrimonio")

                resultado = graham_svc.avaliar_graham(price, lpa, vpa, pl, pvpa, liquidez, divida)

                company_name = (f or {}).get("company_name") or item.get("name")
                sector = (f or {}).get("sector") or item.get("sector")

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
                entry.dy_12m = d.get("dy_12m")
                entry.dy_5a = d.get("dy_5a")
                entry.dy_10a = d.get("dy_10a")
                entry.dy_medio = d.get("dy_medio")
                entry.aprovado_graham = resultado["aprovado_graham"]
                entry.updated_at = datetime.utcnow()

                db.commit()
            except Exception:
                _status["errors"] += 1
            finally:
                _status["processed"] += 1

    await asyncio.gather(*[fetch_and_save(s) for s in universe])

    _status["running"] = False
    _status["finished_at"] = datetime.utcnow().isoformat()


def query_screener(
    db: Session,
    pl_max: float | None = None,
    pvpa_max: float | None = None,
    pl_x_pvpa_max: float | None = None,
    liquidez_min: float | None = None,
    divida_max: float | None = None,
    margem_min: float | None = None,
    apenas_aprovados: bool = False,
) -> list[ScreenerEntry]:
    """Filtro vazio (None) não é aplicado; sem nenhum filtro, devolve todas as ações."""
    rows: list[ScreenerEntry] = db.query(ScreenerEntry).all()

    if apenas_aprovados:
        rows = [r for r in rows if r.aprovado_graham]

    # (valor da ação, limite, True = máximo / False = mínimo)
    def passes(r: ScreenerEntry) -> bool:
        limites = [
            (r.pl, pl_max, True),
            (r.pvpa, pvpa_max, True),
            (r.pl_x_pvpa, pl_x_pvpa_max, True),
            (r.liquidez_corrente, liquidez_min, False),
            (r.divida_patrimonio, divida_max, True),
            (r.margem_seguranca, margem_min, False),
        ]
        checks = []
        for valor, limite, is_max in limites:
            # Indicador sem dado (ex.: liquidez de bancos) não reprova a ação
            if limite is None or valor is None:
                continue
            checks.append(valor <= limite if is_max else valor >= limite)
        ativos = [limite for _, limite, _ in limites if limite is not None]
        if not ativos:
            return True
        return all(checks) if checks else False

    return [r for r in rows if passes(r)]
