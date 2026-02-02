import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
    Book,
    FileText,
    Play,
    Plus,
    Sparkles,
    MoreVertical,
    Share2,
    MessageSquare,
    CheckCircle2,
    ExternalLink,
    Upload,
    Download,
    Trash2,
    Edit3,
    Eye,
    Mic,
    Pause,
    RotateCcw,
    Copy,
    Send,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    ZoomIn,
    ZoomOut,
    Settings,
    Search,
    Filter,
    Grid3X3,
    LayoutList,
    NotebookPen,
    FileQuestion,
    GraduationCap,
    Lightbulb,
    Brain,
    Target,
    TrendingUp,
    Award
} from "lucide-react";
import { generatePodcastScript, generateSummary, generateFlashcards, generateQuiz } from "@/lib/ai-utilities";
import { useDocuments } from "@/hooks/useDocuments";
import { useStudySessions } from "@/hooks/useStudySessions";
import { Document, Flashcard, GeneratedQuiz } from "@/types/study";

interface Source {
    id: string;
    name: string;
    type: "pdf" | "text" | "web" | "doc" | "ppt";
    content: string;
    selected: boolean;
    uploadDate: string;
    size: string;
    pages?: number;
    tags: string[];
}

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    sourcesUsed?: string[];
}

interface AudioOverview {
    title: string;
    duration: string;
    description: string;
    generatedAt: Date;
    quality: 'basic' | 'standard' | 'premium';
}

interface StudyGuide {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    lastModified: Date;
    status: 'draft' | 'published' | 'archived';
    tags: string[];
}

interface NotebookConfig {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    layout: 'compact' | 'spacious';
    autoSave: boolean;
    aiAssistantEnabled: boolean;
    voiceFeedback: boolean;
}

export default function NotebookLLM() {
    const [sources, setSources] = useState<Source[]>([
        {
            id: "1",
            name: "Biology_Chapter_1.pdf",
            type: "pdf",
            content: "Biology is the study of life...",
            selected: true,
            uploadDate: new Date().toISOString(),
            size: "2.4 MB",
            pages: 12,
            tags: ["biology", "chapter 1", "basics"]
        },
        {
            id: "2",
            name: "Lecture Notes - Cells",
            type: "text",
            content: "Cells are the basic unit of life...",
            selected: true,
            uploadDate: new Date().toISOString(),
            size: "0.8 MB",
            tags: ["biology", "cells", "notes"]
        }
    ]);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { 
            id: "initial", 
            role: 'ai', 
            content: "Hi! I'm your Notebook assistant. I've analyzed your sources. What would you like to know?",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState("chat");
    const [config, setConfig] = useState<NotebookConfig>({
        theme: 'light',
        fontSize: 'medium',
        layout: 'spacious',
        autoSave: true,
        aiAssistantEnabled: true,
        voiceFeedback: false
    });

    // Audio Overview State
    const [audioScript, setAudioScript] = useState<AudioOverview | null>(null);

    const { toast } = useToast();
    const { documents, addDocument, getTotalDocuments, getReadyDocuments } = useDocuments();
    const { sessions } = useStudySessions();

    // Initialize with sample data
    useEffect(() => {
        // Load any existing notebook data
        const savedConfig = localStorage.getItem('notebook-config');
        if (savedConfig) {
            try {
                setConfig(JSON.parse(savedConfig));
            } catch (e) {
                console.error('Error loading notebook config:', e);
            }
        }
    }, []);

    // Save config when it changes
    useEffect(() => {
        localStorage.setItem('notebook-config', JSON.stringify(config));
    }, [config]);

    const handleAddSource = (newSource: Source) => {
        setSources(prev => [...prev, newSource]);
        toast({
            title: "Source Added",
            description: `${newSource.name} has been added to your notebook.`
        });
    };

    const handleRemoveSource = (id: string) => {
        setSources(prev => prev.filter(source => source.id !== id));
        toast({
            title: "Source Removed",
            description: "The source has been removed from your notebook.",
            variant: "destructive"
        });
    };

    const handleToggleSourceSelection = (id: string) => {
        setSources(prev =>
            prev.map(source =>
                source.id === id ? { ...source, selected: !source.selected } : source
            )
        );
    };

    const handleGenerateStudyGuide = (topic: string) => {
        const selectedContent = sources
            .filter(s => s.selected)
            .map(s => s.content)
            .join('\n\n');
        
        const summary = generateSummary(selectedContent);
        
        toast({
            title: "Study Guide Generated",
            description: `Created a study guide for ${topic}`
        });
    };

    const handleGenerateFlashcards = () => {
        const selectedContent = sources
            .filter(s => s.selected)
            .map(s => s.content)
            .join('\n\n');
        
        const flashcards = generateFlashcards(selectedContent);
        
        toast({
            title: "Flashcards Created",
            description: `Generated ${flashcards.length} flashcards from your sources`
        });
    };

    const handleGenerateQuiz = () => {
        const selectedContent = sources
            .filter(s => s.selected)
            .map(s => s.content)
            .join('\n\n');
        
        try {
            const quiz = generateQuiz(selectedContent, "Notebook Quiz");
            
            toast({
                title: "Quiz Generated",
                description: `Created a quiz with ${quiz.length} questions`
            });
        } catch (error) {
            console.error('Error generating quiz:', error);
            toast({
                title: "Quiz Generation Failed",
                description: "There was an issue generating the quiz. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to Clipboard",
            description: "The text has been copied to your clipboard."
        });
    };

    const handleDownloadNotes = () => {
        const content = sources
            .filter(s => s.selected)
            .map(s => `# ${s.name}
${s.content}

---

`)
            .join('');
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notebook-notes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
            title: "Notes Downloaded",
            description: "Your selected notes have been downloaded."
        });
    };

    const toggleVoiceFeedback = () => {
        setConfig(prev => ({
            ...prev,
            voiceFeedback: !prev.voiceFeedback
        }));
    };

    const filteredSources = sources.filter(source => source.selected);
    const allSelected = sources.length > 0 && sources.every(s => s.selected);
    const selectedCount = sources.filter(s => s.selected).length;
    
    // AI insights based on study sessions and documents
    const aiInsights = [
        `You've studied ${sessions.length} sessions and have ${getTotalDocuments()} documents in your library.`,
        `Your current study streak is ${sessions.length > 0 ? 'active' : 'not established'}.`,
        `Based on your sources, common themes include: ${sources.flatMap(s => s.tags).slice(0, 3).join(', ')}.`,
    ];

    const handleGenerateAudio = () => {
        if (filteredSources.length === 0) {
            toast({
                title: "No Sources Selected",
                description: "Please select at least one source to generate audio.",
                variant: "destructive"
            });
            return;
        }
        
        // Simulate generation
        const combinedContent = filteredSources.map(s => s.content).join('\n\n');
        const script = generatePodcastScript(combinedContent, "Notebook Overview");
        const audioOverview: AudioOverview = {
            title: script.title,
            duration: script.duration,
            description: script.description,
            generatedAt: new Date(),
            quality: 'standard'
        };
        setAudioScript(audioOverview);
        
        toast({
            title: "Audio Generated",
            description: "Your audio overview is ready to play."
        });
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };
        setChatMessages(prev => [...prev, userMessage]);
        const currentMsg = inputMessage;
        setInputMessage("");

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                role: 'ai',
                content: `Based on your sources, here is what I found about "${currentMsg}": \n\nLooking at the provided documents, the concept is explained in Chapter 1. It suggests that biological systems are complex and interconnected.`,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    const openGoogleNotebook = () => {
        window.open("https://notebooklm.google.com/", "_blank");
    };

    return (
        <AppLayout>
            <div className="flex h-[calc(100vh-100px)] gap-6">
                {/* Left Sidebar - Sources */}
                <div className="w-80 flex flex-col gap-4">
                    <Card className="flex-1 flex flex-col border-none shadow-none bg-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Book className="h-5 w-5" /> Sources
                            </h2>
                            <div className="flex gap-2">
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => setSources([])}
                                    disabled={sources.length === 0}
                                    title="Clear all sources"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => {
                                        // Add source functionality
                                        const newSource: Source = {
                                            id: `source-${Date.now()}`,
                                            name: "New Source.txt",
                                            type: "text",
                                            content: "New content added manually",
                                            selected: true,
                                            uploadDate: new Date().toISOString(),
                                            size: "0.1 MB",
                                            tags: ["new", "manual"]
                                        };
                                        handleAddSource(newSource);
                                    }}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4 p-2 bg-muted rounded-lg">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search sources..." 
                                className="border-none bg-transparent focus-visible:ring-0"
                            />
                        </div>

                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-3">
                                {sources.map(source => (
                                    <div
                                        key={source.id}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer ${source.selected
                                                ? 'bg-white border-primary/20 shadow-sm'
                                                : 'bg-white/50 border-transparent hover:bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${source.type === 'pdf' ? 'bg-red-100 text-red-600' :
                                                    source.type === 'text' ? 'bg-blue-100 text-blue-600' :
                                                    source.type === 'doc' ? 'bg-blue-200 text-blue-700' :
                                                    source.type === 'ppt' ? 'bg-orange-100 text-orange-600' :
                                                        'bg-green-100 text-green-600'
                                                }`}>
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{source.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-muted-foreground">{source.type.toUpperCase()} • {source.size}</p>
                                                    {source.pages && <span className="text-xs text-muted-foreground">• {source.pages} pages</span>}
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {source.tags.slice(0, 2).map(tag => (
                                                        <Badge key={tag} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {source.tags.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{source.tags.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-1">
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="h-6 w-6"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleSourceSelection(source.id);
                                                        }}
                                                    >
                                                        {source.selected ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <div className="h-4 w-4 border rounded-sm" />}
                                                    </Button>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="h-6 w-6"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopyToClipboard(source.content);
                                                        }}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-6 w-6"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveSource(source.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div 
                                    className="h-24 rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                                    onClick={() => setShowUploadDialog(true)}
                                >
                                    <div className="bg-white p-2 rounded-full mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                        <Plus className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium">Add Source</span>
                                </div>
                            </div>
                        </ScrollArea>
                    </Card>
                </div>

                {/* Main Content - Studio */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                Notebook Guide
                            </h1>
                            <p className="text-muted-foreground">Biology 101 - Exam Prep</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-study-purple border-study-purple/20 hover:bg-study-purple/5"
                                            onClick={openGoogleNotebook}
                                        >
                                            <ExternalLink className="h-4 w-4" /> Open Google NotebookLM
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Open in Google NotebookLM</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <Button variant="ghost" size="icon">
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
                        {/* Audio Overview Column */}
                        <div className="col-span-1 space-y-4">
                            {/* AI Insights Card */}
                            <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        AI Insights
                                        <Lightbulb className="h-4 w-4 text-blue-500" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {aiInsights.map((insight, index) => (
                                            <div key={index} className="text-xs text-muted-foreground p-2 bg-white/50 rounded-lg">
                                                • {insight}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-purple-50/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        Audio Overview
                                        <Sparkles className="h-4 w-4 text-primary" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-video rounded-xl bg-black/5 flex items-center justify-center relative overflow-hidden group cursor-pointer mb-4">
                                        {/* Abstract Visualizer */}
                                        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20">
                                            {[...Array(20)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1 bg-primary rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'h-4'}`}
                                                    style={{ height: isPlaying ? `${Math.random() * 60 + 20}%` : '20%' }}
                                                />
                                            ))}
                                        </div>

                                        <Button
                                            size="lg"
                                            className="rounded-full w-12 h-12 p-0 z-10 shadow-xl"
                                            onClick={() => {
                                                if (!audioScript) handleGenerateAudio();
                                                setIsPlaying(!isPlaying)
                                            }}
                                        >
                                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                                        </Button>
                                    </div>

                                    {audioScript ? (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold leading-tight">{audioScript.title}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{audioScript.description}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                                                    {audioScript.duration}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Generated {new Date(audioScript.generatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            Click play to generate a deep-dive audio conversation about your sources.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-3">
                                <Card className="p-3 cursor-pointer hover:border-primary/50 transition-all hover:bg-primary/5">
                                    <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                                        <GraduationCap className="h-4 w-4" /> Study Guide
                                    </h4>
                                    <p className="text-xs text-muted-foreground">Click to generate</p>
                                </Card>
                                <Card className="p-3 cursor-pointer hover:border-primary/50 transition-all hover:bg-primary/5">
                                    <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                                        <FileQuestion className="h-4 w-4" /> Briefing Doc
                                    </h4>
                                    <p className="text-xs text-muted-foreground">Click to generate</p>
                                </Card>
                                <Card className="p-3 cursor-pointer hover:border-primary/50 transition-all hover:bg-primary/5">
                                    <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                                        <Target className="h-4 w-4" /> FAQ
                                    </h4>
                                    <p className="text-xs text-muted-foreground">Click to generate</p>
                                </Card>
                                <Card className="p-3 cursor-pointer hover:border-primary/50 transition-all hover:bg-primary/5">
                                    <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                                        <TrendingUp className="h-4 w-4" /> Timeline
                                    </h4>
                                    <p className="text-xs text-muted-foreground">Click to generate</p>
                                </Card>
                            </div>
                        </div>

                        {/* Chat Column */}
                        <div className="col-span-1 md:col-span-2 flex flex-col h-full bg-white/50 rounded-2xl border shadow-sm backdrop-blur-sm overflow-hidden">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto">
                                    <TabsTrigger value="chat" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                                        <MessageSquare className="h-4 w-4 mr-2" /> Chat
                                    </TabsTrigger>
                                    <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                                        <NotebookPen className="h-4 w-4 mr-2" /> Notes
                                    </TabsTrigger>
                                    <TabsTrigger value="tools" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                                        <Sparkles className="h-4 w-4 mr-2" /> Tools
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="chat" className="flex-1 flex flex-col">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {chatMessages.map((msg, idx) => (
                                            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {msg.role === 'ai' && (
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-white shrink-0">
                                                        <Sparkles className="h-4 w-4" />
                                                    </div>
                                                )}
                                                <div className={`rounded-2xl p-4 max-w-[80%] ${msg.role === 'user'
                                                        ? 'bg-primary text-white rounded-tr-none'
                                                        : 'bg-white border rounded-tl-none shadow-sm'
                                                    }`}>
                                                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                                                    <p className="text-xs opacity-70 mt-1">
                                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-white border-t">
                                        <div className="relative">
                                            <Input
                                                placeholder="Ask questions about your sources..."
                                                className="pr-12 py-6 rounded-full border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
                                                value={inputMessage}
                                                onChange={(e) => setInputMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            />
                                            <Button
                                                size="icon"
                                                className="absolute right-1 top-1 bottom-1 rounded-full h-auto w-10"
                                                onClick={handleSendMessage}
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="notes" className="flex-1 flex flex-col p-4">
                                    <div className="flex gap-2 mb-4">
                                        <Button size="sm" variant="outline" onClick={handleDownloadNotes}>
                                            <Download className="h-4 w-4 mr-2" /> Export
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={toggleVoiceFeedback}>
                                            {config.voiceFeedback ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                                            Voice
                                        </Button>
                                    </div>
                                    <Textarea 
                                        placeholder="Write your notes here..."
                                        className="flex-1 resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                        defaultValue={sources.map(s => s.content).join('\n\n')}
                                    />
                                </TabsContent>
                                <TabsContent value="tools" className="flex-1 flex flex-col p-4 gap-4">
                                    <h3 className="font-semibold">AI Tools</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button 
                                            variant="outline" 
                                            className="h-auto py-4 flex flex-col items-center gap-2"
                                            onClick={() => handleGenerateStudyGuide('selected sources')}
                                        >
                                            <GraduationCap className="h-5 w-5" />
                                            <span>Study Guide</span>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-auto py-4 flex flex-col items-center gap-2"
                                            onClick={handleGenerateFlashcards}
                                        >
                                            <Brain className="h-5 w-5" />
                                            <span>Flashcards</span>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-auto py-4 flex flex-col items-center gap-2"
                                            onClick={handleGenerateQuiz}
                                        >
                                            <Target className="h-5 w-5" />
                                            <span>Quiz</span>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-auto py-4 flex flex-col items-center gap-2"
                                            onClick={handleGenerateAudio}
                                        >
                                            <Mic className="h-5 w-5" />
                                            <span>Audio</span>
                                        </Button>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="font-medium mb-2">Quick Actions</h4>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="cursor-pointer" onClick={() => setSources(prev => prev.map(s => ({...s, selected: true})))}>Select All</Badge>
                                            <Badge variant="secondary" className="cursor-pointer" onClick={() => setSources(prev => prev.map(s => ({...s, selected: false})))}>Deselect All</Badge>
                                            <Badge variant="secondary" className="cursor-pointer" onClick={() => handleCopyToClipboard(sources.filter(s => s.selected).map(s => s.content).join('\n\n'))}>Copy Selected</Badge>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}