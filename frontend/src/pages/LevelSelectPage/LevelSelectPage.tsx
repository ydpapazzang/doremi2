import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoutButton } from "../../components/common/LogoutButton";
import { PrimaryButton } from "../../components/common/PrimaryButton";
import { getLevels, getUser } from "../../services/api/client";
import {
  getStoredNickname,
  getStoredUserId,
  saveSelectedLevel,
} from "../../services/storage";
import type { LevelConfig, User } from "../../types/api";

export function LevelSelectPage() {
  const navigate = useNavigate();
  const nickname = getStoredNickname();
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [user, setUser] = useState<User | null>(null);
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

    async function loadLevels() {
      try {
        const [nextLevels, currentUser] = await Promise.all([getLevels(), getUser(activeUserId)]);
        if (isMounted) {
          setLevels(nextLevels);
          setUser(currentUser);
          setSelectedLevel(Math.min(currentUser.current_level, 1));
        }
      } catch (caughtError) {
        if (isMounted) {
          setError("레벨 정보를 불러오지 못했어요. 백엔드를 확인해 주세요.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLevels();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleStart = () => {
    saveSelectedLevel(selectedLevel);
    navigate("/quiz");
  };

  return (
    <section className="page-card">
      <p className="eyebrow">{nickname}의 학습 준비</p>
      <h1>레벨 선택</h1>

      {isLoading ? <p className="description">레벨 정보를 불러오는 중...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {user ? <p className="description">현재 도달 레벨: Level {user.current_level}</p> : null}

      <div className="level-list">
        {levels.map((level) => (
          <article
            key={level.level}
            className={`level-card ${selectedLevel === level.level ? "level-card selected" : ""}`}
          >
            <div>
              <strong>Level {level.level}</strong>
              <p>{level.description}</p>
              <p>
                {level.clef === "treble" ? "높은자리표" : "낮은자리표"} | {level.min_note} ~{" "}
                {level.max_note}
              </p>
            </div>
            {user && level.level <= user.current_level ? (
              <PrimaryButton type="button" onClick={() => setSelectedLevel(level.level)}>
                {selectedLevel === level.level ? "선택됨" : "선택"}
              </PrimaryButton>
            ) : (
              <span className="badge muted">잠금</span>
            )}
          </article>
        ))}
      </div>

      <div className="button-row">
        <PrimaryButton onClick={handleStart} disabled={isLoading || !!error}>
          Level {selectedLevel} 시작
        </PrimaryButton>
        <LogoutButton />
      </div>
    </section>
  );
}
