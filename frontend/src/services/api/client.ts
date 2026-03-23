import type {
  AnswerResult,
  LevelConfig,
  Session,
  SessionHistoryItem,
  SessionSummary,
  User,
  UserStats,
} from "../../types/api";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "API 요청에 실패했습니다.");
  }

  return (await response.json()) as T;
}

export function createUser(nickname: string): Promise<User> {
  return request<User>("/users", {
    method: "POST",
    body: JSON.stringify({ nickname }),
  });
}

export function getUser(userId: number): Promise<User> {
  return request<User>(`/users/${userId}`);
}

export function getUserSessions(userId: number): Promise<SessionHistoryItem[]> {
  return request<SessionHistoryItem[]>(`/users/${userId}/sessions`);
}

export function getUserStats(userId: number): Promise<UserStats> {
  return request<UserStats>(`/users/${userId}/stats`);
}

export function getLevels(): Promise<LevelConfig[]> {
  return request<LevelConfig[]>("/levels");
}

export function createSession(userId: number, level: number, totalQuestions: number): Promise<Session> {
  return request<Session>("/sessions", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      level,
      total_questions: totalQuestions,
    }),
  });
}

export function submitAnswer(params: {
  sessionId: number;
  questionOrder: number;
  clef: "treble" | "bass";
  targetNote: string;
  userAnswer: string;
  responseTimeMs?: number;
}): Promise<AnswerResult> {
  return request<AnswerResult>(`/sessions/${params.sessionId}/answers`, {
    method: "POST",
    body: JSON.stringify({
      question_order: params.questionOrder,
      clef: params.clef,
      target_note: params.targetNote,
      user_answer: params.userAnswer,
      response_time_ms: params.responseTimeMs ?? null,
    }),
  });
}

export function finishSession(sessionId: number): Promise<SessionSummary> {
  return request<SessionSummary>(`/sessions/${sessionId}/finish`, {
    method: "POST",
  });
}
