import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, PlusCircle, Timer, Trophy, Sparkles, BookOpen, MessageSquare, BarChart3, Calendar, Brain } from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/documents", label: "Documents", icon: BookOpen },
  { path: "/add-study", label: "Add Study", icon: PlusCircle },
  { path: "/focus-mode", label: "Focus", icon: Timer },
  { path: "/study-planner", label: "Planner", icon: Calendar },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/flashcards", label: "Flashcards", icon: Brain },
  { path: "/quiz-generator", label: "Quizzes", icon: MessageSquare },
  { path: "/ai-coach", label: "AI Coach", icon: Sparkles },
  { path: "/achievements", label: "Badges", icon: Trophy },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="glass-navbar fixed bottom-0 left-0 right-0 z-50 border-t md:static md:border-b md:border-t-0 rounded-t-2xl md:rounded-none" role="navigation" aria-label="Main">
      <div className="container mx-auto flex items-center justify-around px-2 py-2 md:justify-center md:gap-1 md:py-3">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-all duration-300 md:flex-row md:gap-2 md:px-4 md:py-3 md:text-sm glass-hover",
                isActive
                  ? "glass-button shadow-lg scale-105"
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
