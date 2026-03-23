from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine
from app.models.learning_session import LearningSession
from app.models.level_config import LevelConfig
from app.models.question_log import QuestionLog
from app.models.user import User
from app.services.level_service import DEFAULT_LEVELS


def init_db() -> None:
    # Importing model modules ensures SQLAlchemy has every table registered.
    _ = (User, LearningSession, QuestionLog, LevelConfig)
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        existing_level = db.scalar(select(LevelConfig.id).limit(1))
        if existing_level is not None:
            return

        db.add_all([LevelConfig(**level_data) for level_data in DEFAULT_LEVELS])
        db.commit()
