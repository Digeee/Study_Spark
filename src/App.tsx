import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import PremiumDashboard from "./pages/PremiumDashboard";
import NotebookLLM from "./pages/NotebookLLM";
import AICoach from "./pages/AICoach";
import Achievements from "./pages/Achievements";
import AddStudy from "./pages/AddStudy";
import Analytics from "./pages/Analytics";
import DocumentQA from "./pages/DocumentQA";
import Documents from "./pages/Documents";
import Flashcards from "./pages/Flashcards";
import FocusMode from "./pages/FocusMode";
import QuizGenerator from "./pages/QuizGenerator";
import StudyBuddy from "./pages/StudyBuddy";
import StudyPlanner from "./pages/StudyPlanner";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/premium" element={<PremiumDashboard />} />
          <Route path="/notebook" element={<NotebookLLM />} />
          <Route path="/ai-coach" element={<AICoach />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/add-study" element={<AddStudy />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/document-qa" element={<DocumentQA />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/focus-mode" element={<FocusMode />} />
          <Route path="/quiz-generator" element={<QuizGenerator />} />
          <Route path="/study-buddy" element={<StudyBuddy />} />
          <Route path="/study-planner" element={<StudyPlanner />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;
