export type User = {
  id: number;
  nickname: string;
  total_score: number;
  current_level: number;
  created_at: string;
};

export type LevelConfig = {
  level: number;
  clef: "treble" | "bass";
  min_note: string;
  max_note: string;
  allow_accidental: boolean;
  allow_ledger_line: boolean;
  description: string;
};

export type Session = {
  session_id: number;
  user_id: number;
  level: number;
  total_questions: number;
  status: string;
};

export type AnswerResult = {
  question_order: number;
  is_correct: boolean;
  correct_note: string;
  score_earned: number;
  session_score: number;
  correct_count: number;
  wrong_count: number;
};

export type SessionSummary = {
  session_id: number;
  status: string;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  total_score: number;
};

export type SessionHistoryItem = {
  session_id: number;
  level: number;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  total_score: number;
  started_at: string;
  ended_at: string | null;
};

export type WeakNoteItem = {
  note: string;
  wrong_count: number;
};

export type UserStats = {
  user_id: number;
  total_score: number;
  current_level: number;
  total_sessions: number;
  total_questions: number;
  correct_rate: number;
  weak_notes: WeakNoteItem[];
};
