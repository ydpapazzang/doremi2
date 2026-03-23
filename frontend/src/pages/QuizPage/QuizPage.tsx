import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PianoKeyboard } from "../../components/piano/PianoKeyboard";
import { LogoutButton } from "../../components/common/LogoutButton";
import { StaffNotation } from "../../components/staff/StaffNotation";
import { TOTAL_QUESTIONS } from "../../constants/quiz";
import { createSession, finishSession, getLevels, submitAnswer } from "../../services/api/client";
import { pianoAudio } from "../../services/audio/pianoAudio";
import { getStoredSelectedLevel, getStoredUserId } from "../../services/storage";
import type { LevelConfig } from "../../types/api";
import { getKeyboardNotesForLevel, getPlayableNotesForLevel } from "../../utils/music";

export function QuizPage() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLElement | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null);
  const [targetNotes, setTargetNotes] = useState<string[]>([]);
  const [keyboardNotes, setKeyboardNotes] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState("건반을 눌러 정답을 골라보자.");
  const [currentNote, setCurrentNote] = useState("C4");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasAudioStarted, setHasAudioStarted] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const questionStartedAt = useRef(Date.now());

  useEffect(() => {
    const updateViewportState = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    updateViewportState();
    window.addEventListener("resize", updateViewportState);
    document.addEventListener("fullscreenchange", updateViewportState);

    return () => {
      window.removeEventListener("resize", updateViewportState);
      document.removeEventListener("fullscreenchange", updateViewportState);
    };
  }, []);

  useEffect(() => {
    const userId = getStoredUserId();
    const selectedLevel = getStoredSelectedLevel();
    if (userId === null || selectedLevel === null) {
      navigate("/");
      return;
    }
    const activeUserId = userId;
    const activeLevel = selectedLevel;

    let isMounted = true;

    async function startQuizSession() {
      try {
        const [session, levels] = await Promise.all([
          createSession(activeUserId, activeLevel, TOTAL_QUESTIONS),
          getLevels(),
        ]);
        if (!isMounted) {
          return;
        }

        const nextLevelConfig = levels.find((level) => level.level === activeLevel) ?? null;
        if (!nextLevelConfig) {
          setError("선택한 레벨 정보를 찾지 못했어요.");
          setIsLoading(false);
          return;
        }

        const nextTargetNotes = getPlayableNotesForLevel(nextLevelConfig);
        const nextKeyboardNotes = getKeyboardNotesForLevel(nextLevelConfig);
        setSessionId(session.session_id);
        setLevelConfig(nextLevelConfig);
        setTargetNotes(nextTargetNotes);
        setKeyboardNotes(nextKeyboardNotes);
        setCurrentNote(getRandomNote(nextTargetNotes));
        void pianoAudio.preload(nextKeyboardNotes);
        questionStartedAt.current = Date.now();
      } catch (caughtError) {
        if (isMounted) {
          setError("세션을 시작하지 못했어요. 백엔드가 실행 중인지 확인해 주세요.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void startQuizSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSelect = async (note: string) => {
    if (!sessionId || !levelConfig || isSubmitting) {
      return;
    }

    const activeSessionId = sessionId;

    try {
      setIsSubmitting(true);
      setError("");
      void pianoAudio.playNote(note);

      const result = await submitAnswer({
        sessionId: activeSessionId,
        questionOrder: questionIndex + 1,
        clef: levelConfig.clef,
        targetNote: currentNote,
        userAnswer: note,
        responseTimeMs: Date.now() - questionStartedAt.current,
      });

      setScore(result.session_score);
      setCorrectCount(result.correct_count);
      setFeedback(
        result.is_correct
          ? `정답! ${result.correct_note}를 잘 찾았어.`
          : `아쉬워. 정답은 ${result.correct_note}였어.`,
      );

      if (result.is_correct) {
        void pianoAudio.playCorrect();
      } else {
        void pianoAudio.playWrong();
      }

      const nextIndex = questionIndex + 1;
      if (nextIndex >= TOTAL_QUESTIONS) {
        const summary = await finishSession(activeSessionId);
        navigate("/result", {
          state: summary,
        });
        return;
      }

      window.setTimeout(() => {
        setQuestionIndex(nextIndex);
        setCurrentNote(getRandomNote(targetNotes, currentNote));
        setFeedback("다음 음표를 보고 눌러보자.");
        questionStartedAt.current = Date.now();
      }, 500);
    } catch (caughtError) {
      setError("정답을 확인하는 중 문제가 생겼어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyboardInteractionStart = () => {
    if (hasAudioStarted) {
      return;
    }

    setHasAudioStarted(true);
    void pianoAudio.warmup();
  };

  const handleToggleFullscreen = async () => {
    const container = pageRef.current;
    if (!container) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await container.requestFullscreen();
  };

  if (isLoading) {
    return <section className="page-card">세션을 준비하는 중...</section>;
  }

  return (
    <section ref={pageRef} className={`page-card wide quiz-page ${isLandscape ? "landscape" : "portrait"}`}>
      <div className="quiz-toolbar">
        <div className="status-bar">
          <span>Level {levelConfig?.level ?? 1}</span>
          <span>
            문제 {questionIndex + 1}/{TOTAL_QUESTIONS}
          </span>
          <span>점수 {score}</span>
        </div>

        <div className="button-row">
          <button type="button" className="secondary-button" onClick={handleToggleFullscreen}>
            {isFullscreen ? "전체화면 종료" : "전체화면"}
          </button>
          <LogoutButton />
        </div>
      </div>

      {!isLandscape ? (
        <div className="orientation-hint">
          <strong>가로 모드가 더 편해요.</strong>
          <span>태블릿을 가로로 돌리면 악보와 건반이 더 크게 보여요.</span>
        </div>
      ) : null}

      <div className="quiz-main">
        <StaffNotation clef={levelConfig?.clef ?? "treble"} noteLabel={currentNote} />
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      <p className="feedback">{feedback}</p>
      {levelConfig?.allow_ledger_line ? (
        <p className="description">덧줄이 붙은 음표만 연습하는 레벨입니다.</p>
      ) : null}
      {levelConfig?.allow_accidental ? (
        <p className="description">샵과 플랫이 붙은 음표를 반음까지 정확하게 익혀보자.</p>
      ) : null}

      <div className="quiz-keyboard">
        <PianoKeyboard
          notes={keyboardNotes}
          onSelect={handleSelect}
          onInteractionStart={handleKeyboardInteractionStart}
        />
      </div>
      <p className="description">현재 정답 수: {correctCount}</p>
    </section>
  );
}

function getRandomNote(notes: string[], previousNote?: string) {
  const candidateNotes = previousNote ? notes.filter((note) => note !== previousNote) : notes;
  const randomIndex = Math.floor(Math.random() * candidateNotes.length);
  return candidateNotes[randomIndex] ?? notes[0] ?? "C4";
}
