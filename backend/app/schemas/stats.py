from pydantic import BaseModel


class SessionHistoryItem(BaseModel):
    session_id: int
    level: int
    total_questions: int
    correct_count: int
    wrong_count: int
    total_score: int
    started_at: str
    ended_at: str | None = None


class WeakNoteItem(BaseModel):
    note: str
    wrong_count: int


class UserStats(BaseModel):
    user_id: int
    total_score: int
    current_level: int
    total_sessions: int
    total_questions: int
    correct_rate: float
    weak_notes: list[WeakNoteItem]
