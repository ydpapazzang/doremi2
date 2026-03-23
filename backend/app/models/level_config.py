from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LevelConfig(Base):
    __tablename__ = "level_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    level: Mapped[int] = mapped_column(Integer, nullable=False)
    clef: Mapped[str] = mapped_column(String(20), nullable=False)
    min_note: Mapped[str] = mapped_column(String(10), nullable=False)
    max_note: Mapped[str] = mapped_column(String(10), nullable=False)
    allow_accidental: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    allow_ledger_line: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[str] = mapped_column(String(100), nullable=False)
