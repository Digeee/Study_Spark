import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PremiumDashboard from "./pages/PremiumDashboard";
import AddStudy from "./pages/AddStudy";
import FocusMode from "./pages/FocusMode";
import Achievements from "./pages/Achievements";
import AICoach from "./pages/AICoach";
import Documents from "./pages/Documents";
import DocumentQA from "./pages/DocumentQA";
import StudyPlanner from "./pages/StudyPlanner";
import Analytics from "./pages/Analytics";
import Flashcards from "./pages/Flashcards";
import QuizGenerator from "./pages/QuizGenerator";
import NotFound from "./pages/NotFound";
import StudyBuddy from "./pages/StudyBuddy";
import NotebookLLM from "./pages/NotebookLLM";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/premium" element={<PremiumDashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/notebook" element={<NotebookLLM />} />
          <Route path="/documents/:documentId/qa" element={<DocumentQA />} />
          <Route path="/add-study" element={<AddStudy />} />
          <Route path="/focus-mode" element={<FocusMode />} />
          <Route path="/study-planner" element={<StudyPlanner />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/quiz-generator" element={<QuizGenerator />} />
          <Route path="/ai-coach" element={<AICoach />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/study-buddy" element={<StudyBuddy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
