from datetime import datetime

import pandas as pd


def _media_anos(anuais: dict[int, float], anos: list[int]) -> float | None:
    if not anos or any(a not in anuais for a in anos):
        return None
    return round(sum(anuais[a] for a in anos) / len(anos), 2)


def calcular_dividend_yield(
    dividendos: pd.Series,
    fechamentos_anuais: dict[int, float],
    preco_atual: float | None,
    hoje: datetime | None = None,
) -> dict:
    """
    dividendos: valor por ação de cada pagamento (índice = data ex).
    fechamentos_anuais: preço de fechamento do último pregão de cada ano.

    DY de um ano = soma dos proventos do ano / fechamento do ano × 100.
    DY 5A / 10A = média do DY anual dos últimos 5 / 10 anos completos.
    DY médio = média do DY anual de todos os anos completos com cotação.
    DY 12M = proventos dos últimos 12 meses / preço atual × 100.
    """
    hoje = hoje or datetime.now()
    if not isinstance(dividendos.index, pd.DatetimeIndex):
        dividendos = pd.Series(dtype=float, index=pd.DatetimeIndex([]))
    if dividendos.index.tz is not None:
        dividendos = dividendos.tz_localize(None)

    por_ano = dividendos.groupby(dividendos.index.year).sum()

    anuais: dict[int, float] = {}
    for ano, fechamento in fechamentos_anuais.items():
        if ano >= hoje.year or not fechamento or fechamento <= 0:
            continue
        anuais[ano] = round(float(por_ano.get(ano, 0.0)) / fechamento * 100, 2)

    ultimos_12m = dividendos[dividendos.index > pd.Timestamp(hoje) - pd.DateOffset(years=1)]
    dy_12m = None
    if preco_atual and preco_atual > 0:
        dy_12m = round(float(ultimos_12m.sum()) / preco_atual * 100, 2)

    anos_completos = sorted(anuais)
    ultimo = hoje.year - 1

    return {
        "dy_12m": dy_12m,
        "dy_5a": _media_anos(anuais, list(range(ultimo - 4, ultimo + 1))),
        "dy_10a": _media_anos(anuais, list(range(ultimo - 9, ultimo + 1))),
        "dy_medio": _media_anos(anuais, anos_completos),
        "anos_historico": len(anos_completos),
        "historico": [{"ano": a, "dy": anuais[a]} for a in anos_completos],
    }
