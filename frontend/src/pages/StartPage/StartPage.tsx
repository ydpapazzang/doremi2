import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components/common/PrimaryButton";
import { createUser } from "../../services/api/client";
import { hasStoredUser, saveUser } from "../../services/storage";

export function StartPage() {
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (hasStoredUser()) {
      navigate("/levels", { replace: true });
    }
  }, [navigate]);

  const handleStart = async () => {
    if (!nickname.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const user = await createUser(nickname.trim());
      saveUser(user.id, user.nickname);
      navigate("/levels");
    } catch {
      setError("사용자 정보를 만드는 중 문제가 생겼어요. 백엔드 실행 상태를 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-card">
      <p className="eyebrow">음표를 보고, 듣고, 눌러보는 첫 연습</p>
      <h1>도레미 마스터</h1>
      <p className="description">악보를 보고 가상 피아노를 눌러 계이름을 익혀보자.</p>

      <label className="field">
        <span>닉네임</span>
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="이름을 입력해 주세요"
        />
      </label>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="button-row">
        <PrimaryButton onClick={handleStart} disabled={!nickname.trim() || isSubmitting}>
          {isSubmitting ? "준비 중..." : "시작하기"}
        </PrimaryButton>
      </div>
    </section>
  );
}
