from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.level_config import LevelConfig
from app.schemas.level import LevelRead

router = APIRouter()


@router.get("", response_model=list[LevelRead])
def get_levels(db: Session = Depends(get_db)) -> list[LevelRead]:
    levels = db.scalars(select(LevelConfig).order_by(LevelConfig.level.asc())).all()
    return list(levels)
