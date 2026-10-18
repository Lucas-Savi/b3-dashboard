from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class QuoteCache(Base):
    __tablename__ = "quote_cache"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker: Mapped[str] = mapped_column(String(10), unique=True, index=True)
    price: Mapped[float | None] = mapped_column(Float)
    change_percent: Mapped[float | None] = mapped_column(Float)
    volume: Mapped[int | None] = mapped_column(Integer)
    market_cap: Mapped[float | None] = mapped_column(Float)
    raw_json: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class FundamentalsCache(Base):
    __tablename__ = "fundamentals_cache"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker: Mapped[str] = mapped_column(String(10), unique=True, index=True)
    lpa: Mapped[float | None] = mapped_column(Float)           # Lucro Por Ação
    vpa: Mapped[float | None] = mapped_column(Float)           # Valor Patrimonial Por Ação
    pl: Mapped[float | None] = mapped_column(Float)            # P/L
    pvpa: Mapped[float | None] = mapped_column(Float)          # P/VPA
    liquidez_corrente: Mapped[float | None] = mapped_column(Float)
    divida_patrimonio: Mapped[float | None] = mapped_column(Float)
    raw_json: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ScreenerEntry(Base):
    __tablename__ = "screener_entry"

    ticker: Mapped[str] = mapped_column(String(10), primary_key=True, index=True)
    company_name: Mapped[str | None] = mapped_column(String(200))
    sector: Mapped[str | None] = mapped_column(String(100))
    price: Mapped[float | None] = mapped_column(Float)
    lpa: Mapped[float | None] = mapped_column(Float)
    vpa: Mapped[float | None] = mapped_column(Float)
    pl: Mapped[float | None] = mapped_column(Float)
    pvpa: Mapped[float | None] = mapped_column(Float)
    pl_x_pvpa: Mapped[float | None] = mapped_column(Float)
    graham_number: Mapped[float | None] = mapped_column(Float)
    margem_seguranca: Mapped[float | None] = mapped_column(Float)
    liquidez_corrente: Mapped[float | None] = mapped_column(Float)
    divida_patrimonio: Mapped[float | None] = mapped_column(Float)
    aprovado_graham: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
