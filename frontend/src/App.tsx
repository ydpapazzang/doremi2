import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { StartPage } from "./pages/StartPage/StartPage";
import { LevelSelectPage } from "./pages/LevelSelectPage/LevelSelectPage";
import { QuizPage } from "./pages/QuizPage/QuizPage";
import { ResultPage } from "./pages/ResultPage/ResultPage";
import { HistoryPage } from "./pages/HistoryPage/HistoryPage";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/levels" element={<LevelSelectPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </AppLayout>
  );
}
