from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    nickname: str = Field(min_length=2, max_length=10)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nickname: str
    total_score: int
    current_level: int
    created_at: datetime
