import math


def calcular_numero_graham(lpa: float | None, vpa: float | None) -> float | None:
    if lpa is None or vpa is None:
        return None
    if lpa <= 0 or vpa <= 0:
        return None
    return round(math.sqrt(22.5 * lpa * vpa), 2)


def calcular_margem_seguranca(preco: float | None, graham_number: float | None) -> float | None:
    if preco is None or graham_number is None or graham_number == 0:
        return None
    return round((graham_number - preco) / graham_number * 100, 2)


def calcular_pl_x_pvpa(pl: float | None, pvpa: float | None) -> float | None:
    if pl is None or pvpa is None:
        return None
    return round(pl * pvpa, 2)


def avaliar_graham(
    preco: float | None,
    lpa: float | None,
    vpa: float | None,
    pl: float | None,
    pvpa: float | None,
    liquidez_corrente: float | None,
    divida_patrimonio: float | None,
) -> dict:
    graham_number = calcular_numero_graham(lpa, vpa)
    margem_seguranca = calcular_margem_seguranca(preco, graham_number)
    pl_x_pvpa = calcular_pl_x_pvpa(pl, pvpa)

    criterios = {
        "pl_ok": pl is not None and pl <= 15,
        "pvpa_ok": pvpa is not None and pvpa <= 1.5,
        "pl_x_pvpa_ok": pl_x_pvpa is not None and pl_x_pvpa <= 22.5,
        "liquidez_ok": liquidez_corrente is not None and liquidez_corrente >= 2.0,
        "divida_ok": divida_patrimonio is not None and divida_patrimonio <= 1.0,
        "preco_abaixo_graham": margem_seguranca is not None and margem_seguranca > 0,
    }

    aprovado = all(criterios.values())

    return {
        "graham_number": graham_number,
        "margem_seguranca": margem_seguranca,
        "pl_x_pvpa": pl_x_pvpa,
        "criterios": criterios,
        "aprovado_graham": aprovado,
    }
