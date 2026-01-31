import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    Home,
    PlusCircle,
    Timer,
    Trophy,
    Sparkles,
    BookOpen,
    MessageSquare,
    BarChart3,
    Calendar,
    Brain,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Users,
    Settings,
    LogOut,
    User,
    Compass,
    GraduationCap,
    Zap,
    LayoutDashboard
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const navGroups = [
    {
        name: "General",
        items: [
            { path: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-study-purple" },
            { path: "/documents", label: "Library", icon: BookOpen, color: "text-study-blue" },
            { path: "/notebook", label: "Notebook", icon: Sparkles, color: "text-study-indigo" },
        ]
    },
    {
        name: "Study Studio",
        items: [
            { path: "/focus-mode", label: "Focus Room", icon: Timer, color: "text-study-orange" },
            { path: "/study-buddy", label: "Study Buddy", icon: Users, color: "text-study-pink" },
            { path: "/flashcards", label: "Smart Cards", icon: Brain, color: "text-study-indigo" },
            { path: "/study-planner", label: "Planner", icon: Calendar, color: "text-study-cyan" },
        ]
    },
    {
        name: "AI Insights",
        items: [
            { path: "/ai-coach", label: "AI Coach", icon: Zap, color: "text-study-purple" },
            { path: "/quiz-generator", label: "AI Quizzes", icon: MessageSquare, color: "text-study-rose" },
            { path: "/analytics", label: "Analytics", icon: BarChart3, color: "text-study-blue" },
            { path: "/achievements", label: "Achievements", icon: Trophy, color: "text-study-orange" },
        ]
    }
];

export function Sidebar() {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-zinc-950 border-r border-white/10 transition-all duration-500 flex flex-col shadow-2xl overflow-hidden",
                    isCollapsed ? "w-20" : "w-72",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Header / Logo */}
                <div className="relative flex items-center h-24 px-6 mb-2 overflow-hidden">
                    <div className={cn(
                        "flex items-center gap-3 transition-all duration-500",
                        isCollapsed && "mx-auto"
                    )}>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-study-purple blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-study-purple to-study-indigo flex items-center justify-center text-white shadow-lg overflow-hidden">
                                <GraduationCap className="h-6 w-6 relative z-10" />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/20 backdrop-blur-sm" />
                            </div>
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <h1 className="text-xl font-black tracking-tighter leading-none flex items-center">
                                    Study<span className="text-study-purple">Spark</span>
                                </h1>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Pro System</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 space-y-8 modern-scrollbar pb-8">
                    {navGroups.map((group, gIdx) => (
                        <div key={group.name} className="space-y-2">
                            {!isCollapsed && (
                                <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
                                    {group.name}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={cn(
                                                "group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-300",
                                                isActive
                                                    ? "bg-gradient-to-r from-study-purple/10 to-transparent text-study-purple shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "relative z-10 p-1 rounded-lg transition-transform group-hover:scale-110 duration-500",
                                                isActive ? "text-study-purple" : item.color
                                            )}>
                                                <item.icon className="h-5 w-5" />
                                            </div>

                                            {!isCollapsed && (
                                                <span className={cn(
                                                    "font-bold text-sm tracking-tight transition-all",
                                                    isActive ? "text-study-purple" : "group-hover:translate-x-1"
                                                )}>
                                                    {item.label}
                                                </span>
                                            )}

                                            {isActive && (
                                                <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-study-purple rounded-r-full shadow-[2px_0_10px_rgba(168,85,247,0.4)] animate-in slide-in-from-left duration-500" />
                                            )}

                                            {/* Tooltip for collapsed state */}
                                            {isCollapsed && (
                                                <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                                                    {item.label}
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer Section */}
                <div className="p-4 mt-auto">
                    <div className={cn(
                        "rounded-3xl p-3 transition-all duration-500 overflow-hidden",
                        isCollapsed ? "bg-transparent" : "bg-zinc-50 dark:bg-white/5 border border-white/5"
                    )}>
                        {!isCollapsed ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                                            <AvatarFallback>JD</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black truncate">Felix Carter</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Master Plan</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                        <Settings className="h-4 w-4 opacity-40 hover:opacity-100" />
                                    </Button>
                                </div>
                                <Button className="w-full h-11 bg-study-purple/10 hover:bg-study-purple text-study-purple hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-study-purple/20">
                                    Go Pro <Zap className="h-3 w-3 ml-2 fill-current" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform">
                                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                                    <AvatarFallback>FC</AvatarFallback>
                                </Avatar>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-muted/30">
                                    <Settings className="h-5 w-5 opacity-40" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Collapse Toggle - Desktop Overlay */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex absolute top-6 right-[-20px] h-10 w-10 rounded-full bg-white dark:bg-zinc-900 border border-white/10 shadow-lg hover:scale-110 transition-all z-50 group"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                        ) : (
                            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                        )}
                    </Button>
                </div>
            </aside>
        </>
    );
}

// Internal Local Component for Avatar to avoid extra imports if not needed, 
// but using standardized shadcn structure if possible.
function Avatar({ className, children, ...props }: any) {
    return <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props}>{children}</div>;
}
function AvatarImage({ src, ...props }: any) {
    return <img src={src} className="aspect-square h-full w-full" {...props} />;
}
function AvatarFallback({ children, ...props }: any) {
    return <div className="flex h-full w-full items-center justify-center rounded-full bg-muted font-bold text-sm" {...props}>{children}</div>;
}
