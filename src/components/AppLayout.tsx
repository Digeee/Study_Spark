import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="hidden border-b border-border bg-card/50 backdrop-blur-sm md:block">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
              StudyTracker
            </h1>
          </div>
          <Navigation />
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 pb-24 pt-6 md:pb-8">
        {children}
      </main>

      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
