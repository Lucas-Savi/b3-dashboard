from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import fundamentals, graham, quotes, screener

app = FastAPI(
    title="Analisador de Ações B3",
    description="API para análise fundamentalista de ações brasileiras com indicadores de Benjamin Graham",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quotes.router, prefix="/api")
app.include_router(fundamentals.router, prefix="/api")
app.include_router(graham.router, prefix="/api")
app.include_router(screener.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}
