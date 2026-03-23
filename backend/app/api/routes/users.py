from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.learning_session import LearningSession
from app.models.question_log import QuestionLog
from app.models.user import User
from app.schemas.stats import SessionHistoryItem, UserStats, WeakNoteItem
from app.schemas.user import UserCreate, UserRead

router = APIRouter()


@router.post("", response_model=UserRead, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    user = User(nickname=payload.nickname)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)) -> UserRead:
    user = db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}/sessions", response_model=list[SessionHistoryItem])
def get_user_sessions(user_id: int, db: Session = Depends(get_db)) -> list[SessionHistoryItem]:
    user = db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    sessions = db.scalars(
        select(LearningSession)
        .where(LearningSession.user_id == user_id)
        .order_by(LearningSession.started_at.desc())
        .limit(10)
    ).all()

    return [
        SessionHistoryItem(
            session_id=session.id,
            level=session.level,
            total_questions=session.total_questions,
            correct_count=session.correct_count,
            wrong_count=session.wrong_count,
            total_score=session.total_score,
            started_at=session.started_at.isoformat() if session.started_at else "",
            ended_at=session.ended_at.isoformat() if session.ended_at else None,
        )
        for session in sessions
    ]


@router.get("/{user_id}/stats", response_model=UserStats)
def get_user_stats(user_id: int, db: Session = Depends(get_db)) -> UserStats:
    user = db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    sessions = db.scalars(select(LearningSession).where(LearningSession.user_id == user_id)).all()
    total_sessions = len(sessions)
    total_questions = sum(session.total_questions for session in sessions)
    total_correct = sum(session.correct_count for session in sessions)
    correct_rate = (total_correct / total_questions) if total_questions > 0 else 0.0

    weak_notes_rows = db.execute(
        select(
            QuestionLog.target_note,
            func.count(QuestionLog.id).label("wrong_count"),
        )
        .join(LearningSession, LearningSession.id == QuestionLog.session_id)
        .where(LearningSession.user_id == user_id, QuestionLog.is_correct.is_(False))
        .group_by(QuestionLog.target_note)
        .order_by(func.count(QuestionLog.id).desc(), QuestionLog.target_note.asc())
        .limit(5)
    ).all()

    weak_notes = [
        WeakNoteItem(note=row[0], wrong_count=row[1])
        for row in weak_notes_rows
    ]

    return UserStats(
        user_id=user.id,
        total_score=user.total_score,
        current_level=user.current_level,
        total_sessions=total_sessions,
        total_questions=total_questions,
        correct_rate=correct_rate,
        weak_notes=weak_notes,
    )
