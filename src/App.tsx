import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PremiumDashboard from "./pages/PremiumDashboard";
import NotebookLLM from "./pages/NotebookLLM";
import NotFound from "./pages/NotFound";

console.log("App component loading...");

const App = () => {
  console.log("App component rendering...");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/premium" element={<PremiumDashboard />} />
        <Route path="/notebook" element={<NotebookLLM />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

console.log("App component created");
export default App;