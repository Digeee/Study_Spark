import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 md:ml-72 transition-all duration-300 p-6 md:p-8 overflow-x-hidden"
        role="main"
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
