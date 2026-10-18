from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.stock import ScreenerEntry
from app.schemas.stock import ScreenerEntryResponse, ScreenerStatusResponse
from app.services import screener as screener_svc

router = APIRouter(prefix="/screener", tags=["Screener Graham"])


@router.get("/status", response_model=ScreenerStatusResponse)
def get_status(db: Session = Depends(get_db)):
    status = screener_svc.get_status()
    status["cached_count"] = db.query(ScreenerEntry).count()
    last = db.query(func.max(ScreenerEntry.updated_at)).scalar()
    status["last_updated"] = last.isoformat() if last else None
    return status


@router.post("/refresh", status_code=202)
async def trigger_refresh(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if screener_svc.get_status()["running"]:
        return {"message": "Atualização já em andamento"}
    background_tasks.add_task(screener_svc.refresh_all, db)
    return {"message": "Atualização iniciada em background"}


@router.get("/", response_model=list[ScreenerEntryResponse])
def get_screener(
    pl_max: float | None = None,
    pvpa_max: float | None = None,
    pl_x_pvpa_max: float | None = None,
    liquidez_min: float | None = None,
    divida_max: float | None = None,
    margem_min: float | None = None,
    apenas_aprovados: bool = False,
    db: Session = Depends(get_db),
):
    entries = screener_svc.query_screener(
        db,
        pl_max=pl_max,
        pvpa_max=pvpa_max,
        pl_x_pvpa_max=pl_x_pvpa_max,
        liquidez_min=liquidez_min,
        divida_max=divida_max,
        margem_min=margem_min,
        apenas_aprovados=apenas_aprovados,
    )
    return [
        ScreenerEntryResponse(
            **{k: v for k, v in e.__dict__.items() if not k.startswith("_") and k != "updated_at"},
            updated_at=e.updated_at.isoformat() if e.updated_at else None,
        )
        for e in entries
    ]
