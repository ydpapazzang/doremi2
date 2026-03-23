from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.learning_session import LearningSession
from app.models.question_log import QuestionLog
from app.models.user import User
from app.schemas.session import (
    AnswerResult,
    AnswerSubmit,
    SessionCreate,
    SessionRead,
    SessionSummary,
)
from app.utils.music import note_to_midi

router = APIRouter()


@router.post("", response_model=SessionRead, status_code=201)
def create_session(payload: SessionCreate, db: Session = Depends(get_db)) -> SessionRead:
    user = db.scalar(select(User).where(User.id == payload.user_id))
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    learning_session = LearningSession(
        user_id=payload.user_id,
        level=payload.level,
        total_questions=payload.total_questions,
    )
    db.add(learning_session)
    db.commit()
    db.refresh(learning_session)

    return SessionRead(
        session_id=learning_session.id,
        user_id=learning_session.user_id,
        level=learning_session.level,
        total_questions=learning_session.total_questions,
        status=learning_session.status,
    )


@router.post("/{session_id}/answers", response_model=AnswerResult)
def submit_answer(
    session_id: int,
    payload: AnswerSubmit,
    db: Session = Depends(get_db),
) -> AnswerResult:
    learning_session = db.scalar(select(LearningSession).where(LearningSession.id == session_id))
    if learning_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if learning_session.status != "in_progress":
        raise HTTPException(status_code=400, detail="Session already finished")

    is_correct = note_to_midi(payload.target_note) == note_to_midi(payload.user_answer)
    score_earned = 10 if is_correct else 0

    if is_correct:
        learning_session.correct_count += 1
    else:
        learning_session.wrong_count += 1
    learning_session.total_score += score_earned

    question_log = QuestionLog(
        session_id=session_id,
        question_order=payload.question_order,
        clef=payload.clef,
        target_note=payload.target_note,
        user_answer=payload.user_answer,
        is_correct=is_correct,
        response_time_ms=payload.response_time_ms,
    )
    db.add(question_log)
    db.commit()
    db.refresh(learning_session)

    return AnswerResult(
        question_order=payload.question_order,
        is_correct=is_correct,
        correct_note=payload.target_note,
        score_earned=score_earned,
        session_score=learning_session.total_score,
        correct_count=learning_session.correct_count,
        wrong_count=learning_session.wrong_count,
    )


@router.post("/{session_id}/finish", response_model=SessionSummary)
def finish_session(session_id: int, db: Session = Depends(get_db)) -> SessionSummary:
    learning_session = db.scalar(select(LearningSession).where(LearningSession.id == session_id))
    if learning_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if learning_session.status != "completed":
        learning_session.status = "completed"
        learning_session.ended_at = datetime.utcnow()

        user = db.scalar(select(User).where(User.id == learning_session.user_id))
        if user is not None:
            user.total_score += learning_session.total_score

            accuracy = learning_session.correct_count / learning_session.total_questions
            if accuracy >= 0.8 and user.current_level == learning_session.level:
                user.current_level = min(user.current_level + 1, 4)

        db.commit()
        db.refresh(learning_session)

    return SessionSummary(
        session_id=learning_session.id,
        status=learning_session.status,
        total_questions=learning_session.total_questions,
        correct_count=learning_session.correct_count,
        wrong_count=learning_session.wrong_count,
        total_score=learning_session.total_score,
    )
