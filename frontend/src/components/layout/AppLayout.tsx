import { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";

export function AppLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const isQuizRoute = location.pathname === "/quiz";

  return (
    <div className={`app-shell ${isQuizRoute ? "quiz-shell" : ""}`}>
      <main className={`app-content ${isQuizRoute ? "quiz-content" : ""}`}>{children}</main>
    </div>
  );
}
