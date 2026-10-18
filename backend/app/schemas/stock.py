from pydantic import BaseModel, Field


class QuoteResponse(BaseModel):
    ticker: str
    price: float | None
    change_percent: float | None
    volume: int | None
    market_cap: float | None


class FundamentalsResponse(BaseModel):
    ticker: str
    lpa: float | None = Field(None, description="Lucro Por Ação")
    vpa: float | None = Field(None, description="Valor Patrimonial Por Ação")
    pl: float | None = Field(None, description="Preço / Lucro")
    pvpa: float | None = Field(None, description="Preço / Valor Patrimonial")
    liquidez_corrente: float | None = None
    divida_patrimonio: float | None = None


class GrahamResponse(BaseModel):
    ticker: str
    company_name: str | None = None
    price: float | None
    change_percent: float | None = None
    lpa: float | None
    vpa: float | None
    graham_number: float | None = Field(None, description="√(22.5 × LPA × VPA)")
    margem_seguranca: float | None = Field(None, description="(Graham - Preço) / Graham × 100")
    pl: float | None
    pvpa: float | None
    pl_x_pvpa: float | None = Field(None, description="P/L × P/VPA — critério Graham ≤ 22,5")
    liquidez_corrente: float | None
    divida_patrimonio: float | None
    aprovado_graham: bool = Field(False, description="True se atende todos os critérios de Graham")


class ScreenerFilters(BaseModel):
    pl_max: float = 15.0
    pvpa_max: float = 1.5
    pl_x_pvpa_max: float = 22.5
    liquidez_corrente_min: float = 2.0
    divida_patrimonio_max: float = 1.0
    apenas_aprovados: bool = False


class ScreenerEntryResponse(BaseModel):
    ticker: str
    company_name: str | None
    sector: str | None
    price: float | None
    lpa: float | None
    vpa: float | None
    pl: float | None
    pvpa: float | None
    pl_x_pvpa: float | None
    graham_number: float | None
    margem_seguranca: float | None
    liquidez_corrente: float | None
    divida_patrimonio: float | None
    aprovado_graham: bool
    updated_at: str | None

    model_config = {"from_attributes": True}


class ScreenerStatusResponse(BaseModel):
    running: bool
    started_at: str | None
    finished_at: str | None
    processed: int
    total: int
    errors: int
    cached_count: int
