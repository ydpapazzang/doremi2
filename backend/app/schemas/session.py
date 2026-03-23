from pydantic import BaseModel, Field


class SessionCreate(BaseModel):
    user_id: int
    level: int = Field(ge=1, le=4)
    total_questions: int = Field(default=10, ge=1, le=50)


class SessionRead(BaseModel):
    session_id: int
    user_id: int
    level: int
    total_questions: int
    status: str


class AnswerSubmit(BaseModel):
    question_order: int
    clef: str
    target_note: str
    user_answer: str
    response_time_ms: int | None = None


class AnswerResult(BaseModel):
    question_order: int
    is_correct: bool
    correct_note: str
    score_earned: int
    session_score: int
    correct_count: int
    wrong_count: int


class SessionFinish(BaseModel):
    pass


class SessionSummary(BaseModel):
    session_id: int
    status: str
    total_questions: int
    correct_count: int
    wrong_count: int
    total_score: int
