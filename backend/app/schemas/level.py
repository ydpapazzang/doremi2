from pydantic import BaseModel, ConfigDict


class LevelRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    level: int
    clef: str
    min_note: str
    max_note: str
    allow_accidental: bool
    allow_ledger_line: bool
    description: str
