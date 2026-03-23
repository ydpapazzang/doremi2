import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogoutButton } from "../../components/common/LogoutButton";
import { PrimaryButton } from "../../components/common/PrimaryButton";
import { getUserStats } from "../../services/api/client";
import { getStoredUserId } from "../../services/storage";
import type { SessionSummary, UserStats } from "../../types/api";

type ResultState = SessionSummary | null;

export function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ResultState | undefined) ?? null;
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const userId = getStoredUserId();
    if (userId === null) {
      return;
    }
    const activeUserId = userId;

    let isMounted = true;

    async function loadStats() {
      try {
        const nextStats = await getUserStats(activeUserId);
        if (isMounted) {
          setStats(nextStats);
        }
      } catch {
        if (isMounted) {
          setStats(null);
        }
      }
    }

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalQuestions = state?.total_questions ?? 10;
  const correctCount = state?.correct_count ?? 0;
  const wrongCount = state?.wrong_count ?? totalQuestions - correctCount;
  const totalScore = state?.total_score ?? 0;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <section className="page-card">
      <p className="eyebrow">세션 완료</p>
      <h1>학습 결과</h1>

      <div className="result-grid">
        <div className="result-card">
          <span>총 점수</span>
          <strong>{totalScore}점</strong>
        </div>
        <div className="result-card">
          <span>정답률</span>
          <strong>{accuracy}%</strong>
        </div>
        <div className="result-card">
          <span>정답</span>
          <strong>{correctCount}개</strong>
        </div>
        <div className="result-card">
          <span>오답</span>
          <strong>{wrongCount}개</strong>
        </div>
      </div>

      <section className="history-section">
        <h2>이번 세션 한마디</h2>
        <p className="description">
          {accuracy >= 90
            ? "정말 훌륭해요. 다음 레벨에 도전해도 좋아요."
            : accuracy >= 70
              ? "아주 잘하고 있어요. 자주 틀린 음표를 한 번 더 연습해보자."
              : "괜찮아요. 한 번 더 해보면 훨씬 익숙해질 거예요."}
        </p>
      </section>

      {stats ? (
        <section className="history-section">
          <h2>누적 학습 현황</h2>
          <div className="history-list">
            <article className="history-card">
              <strong>누적 점수</strong>
              <span>{stats.total_score}점</span>
            </article>
            <article className="history-card">
              <strong>현재 레벨</strong>
              <span>Level {stats.current_level}</span>
            </article>
            <article className="history-card">
              <strong>총 학습 횟수</strong>
              <span>{stats.total_sessions}회</span>
            </article>
          </div>

          {stats.weak_notes.length ? (
            <>
              <h2>자주 틀린 음표</h2>
              <div className="history-list">
                {stats.weak_notes.map((note) => (
                  <article key={note.note} className="history-card">
                    <strong>{note.note}</strong>
                    <span>{note.wrong_count}회 틀림</span>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      <div className="button-row">
        <PrimaryButton onClick={() => navigate("/quiz")}>다시하기</PrimaryButton>
        <PrimaryButton onClick={() => navigate("/history")}>기록 보기</PrimaryButton>
        <PrimaryButton onClick={() => navigate("/levels")}>레벨 선택</PrimaryButton>
        <LogoutButton />
      </div>
    </section>
  );
}
