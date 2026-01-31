import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    ExternalLink
} from "lucide-react";
import { generatePodcastScript } from "@/lib/ai-utilities";

interface Source {
    id: string;
    name: string;
    type: "pdf" | "text" | "web";
    content: string;
    selected: boolean;
}

export default function NotebookLLM() {
    const [sources, setSources] = useState<Source[]>([
        {
            id: "1",
            name: "Biology_Chapter_1.pdf",
            type: "pdf",
            content: "Biology is the study of life...",
            selected: true
        },
        {
            id: "2",
            name: "Lecture Notes - Cells",
            type: "text",
            content: "Cells are the basic unit of life...",
            selected: true
        }
    ]);

    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: "Hi! I'm your Notebook assistant. I've analyzed your sources. What would you like to know?" }
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);

    // Audio Overview State
    const [audioScript, setAudioScript] = useState<{ title: string; duration: string; description: string } | null>(null);

    const handleGenerateAudio = () => {
        // Simulate generation
        const script = generatePodcastScript("Combined content from sources...", "Notebook Overview");
        setAudioScript(script);
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        setChatMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
        const currentMsg = inputMessage;
        setInputMessage("");

        // Simulate AI response
        setTimeout(() => {
            setChatMessages(prev => [...prev, {
                role: 'ai',
                content: `Based on your sources, here is what I found about "${currentMsg}": \n\nLooking at the provided documents, the concept is explained in Chapter 1. It suggests that biological systems are complex and interconnected.`
            }]);
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
                            <Button size="icon" variant="ghost">
                                <Plus className="h-5 w-5" />
                            </Button>
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
                                                        'bg-green-100 text-green-600'
                                                }`}>
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{source.name}</p>
                                                <p className="text-xs text-muted-foreground">{source.type.toUpperCase()}</p>
                                            </div>
                                            {source.selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                        </div>
                                    </div>
                                ))}

                                <div className="h-24 rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
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
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-study-purple border-study-purple/20 hover:bg-study-purple/5"
                                onClick={openGoogleNotebook}
                            >
                                <ExternalLink className="h-4 w-4" /> Open Google NotebookLM
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
                        {/* Audio Overview Column */}
                        <div className="col-span-1 space-y-4">
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
                                            {isPlaying ? <div className="h-4 w-4 bg-white rounded-sm" /> : <Play className="h-5 w-5 ml-1" />}
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
                                {['Study Guide', 'Briefing Doc', 'FAQ', 'Timeline'].map((item) => (
                                    <Card key={item} className="p-3 cursor-pointer hover:border-primary/50 transition-all hover:bg-primary/5">
                                        <h4 className="font-medium text-sm mb-1">{item}</h4>
                                        <p className="text-xs text-muted-foreground">Click to generate</p>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Chat Column */}
                        <div className="col-span-1 md:col-span-2 flex flex-col h-full bg-white/50 rounded-2xl border shadow-sm backdrop-blur-sm overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'ai' && (
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-white shrink-0">
                                                <Sparkles className="h-4 w-4" />
                                            </div>
                                        )}
                                        <div className={`rounded-2xl p-4 max-w-[80%] ${msg.role === 'user'
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-white border rounded-tl-none shadow-sm'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
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
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
