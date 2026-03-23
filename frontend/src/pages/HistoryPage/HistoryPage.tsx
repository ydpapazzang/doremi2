import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoutButton } from "../../components/common/LogoutButton";
import { PrimaryButton } from "../../components/common/PrimaryButton";
import { getUserSessions, getUserStats } from "../../services/api/client";
import { getStoredNickname, getStoredUserId } from "../../services/storage";
import type { SessionHistoryItem, UserStats } from "../../types/api";

export function HistoryPage() {
  const navigate = useNavigate();
  const nickname = getStoredNickname();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = getStoredUserId();
    if (userId === null) {
      navigate("/");
      return;
    }
    const activeUserId = userId;

    let isMounted = true;

    async function loadHistory() {
      try {
        const [nextStats, nextSessions] = await Promise.all([
          getUserStats(activeUserId),
          getUserSessions(activeUserId),
        ]);

        if (!isMounted) {
          return;
        }

        setStats(nextStats);
        setSessions(nextSessions);
      } catch (caughtError) {
        if (isMounted) {
          setError("학습 기록을 불러오지 못했어요. 백엔드를 확인해 주세요.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <section className="page-card">
      <p className="eyebrow">{nickname}의 학습 기록</p>
      <h1>기록 보기</h1>
      {isLoading ? <p className="description">기록을 불러오는 중...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {stats ? (
        <div className="result-grid">
          <div className="result-card">
            <span>누적 점수</span>
            <strong>{stats.total_score}점</strong>
          </div>
          <div className="result-card">
            <span>현재 레벨</span>
            <strong>Level {stats.current_level}</strong>
          </div>
          <div className="result-card">
            <span>총 세션</span>
            <strong>{stats.total_sessions}회</strong>
          </div>
          <div className="result-card">
            <span>누적 정답률</span>
            <strong>{Math.round(stats.correct_rate * 100)}%</strong>
          </div>
        </div>
      ) : null}

      {stats?.weak_notes.length ? (
        <section className="history-section">
          <h2>자주 틀린 음표</h2>
          <div className="history-list">
            {stats.weak_notes.map((note) => (
              <article key={note.note} className="history-card">
                <strong>{note.note}</strong>
                <span>{note.wrong_count}회 틀림</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="history-section">
        <h2>최근 학습</h2>
        <div className="history-list">
          {sessions.map((session) => {
            const accuracy =
              session.total_questions > 0
                ? Math.round((session.correct_count / session.total_questions) * 100)
                : 0;

            return (
              <article key={session.session_id} className="history-card">
                <strong>Level {session.level}</strong>
                <span>
                  점수 {session.total_score}점 · 정답률 {accuracy}%
                </span>
              </article>
            );
          })}
          {!sessions.length && !isLoading ? <p className="description">아직 저장된 기록이 없어요.</p> : null}
        </div>
      </section>

      <div className="button-row">
        <PrimaryButton onClick={() => navigate("/levels")}>다시 학습하기</PrimaryButton>
        <PrimaryButton onClick={() => navigate("/levels")}>스테이지 선택</PrimaryButton>
        <LogoutButton />
      </div>
    </section>
  );
}
