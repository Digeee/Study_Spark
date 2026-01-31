import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    Link as LinkIcon,
    Send,
    Copy,
    CheckCircle,
    Timer,
    MessageSquare,
    Sparkles,
    FileUp,
    FileText,
    Paperclip,
    X,
    Plus,
    Smile,
    ImageIcon,
    Search,
    MoreVertical,
    Hash,
    Share2,
    Video
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// Message Type
interface Message {
    id: string;
    sender: "me" | "them";
    text?: string;
    timestamp: number;
    type: "text" | "file" | "system";
    file?: {
        name: string;
        size: string;
        type: string;
    };
}

interface Participant {
    id: string;
    name: string;
    avatar: string;
    status: "online" | "away" | "busy";
    lastSeen?: string;
}

export default function StudyBuddy() {
    const [isConnected, setIsConnected] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', type: 'system', timestamp: Date.now() - 3600000, text: 'Study Session Started' }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [participants] = useState<Participant[]>([
        { id: 'me', name: 'You (Alex)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', status: 'online' },
        { id: 'buddy', name: 'Leila', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leila', status: 'online' }
    ]);

    // Broadcast Channel for Tab-to-Tab Communication
    const channelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        // Generate a random invite code on mount
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setInviteCode(code);

        // Setup communication channel
        const channel = new BroadcastChannel("study-buddy-chat");
        channelRef.current = channel;

        channel.onmessage = (event) => {
            const data = event.data;
            if (data.type === "message") {
                setMessages((prev) => [...prev, { ...data.message, sender: "them" }]);
            } else if (data.type === "typing") {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 2000);
            } else if (data.type === "join") {
                toast.success("Leila joined the co-study space!");
                setIsConnected(true);
            }
        };

        return () => {
            channel.close();
        };
    }, []);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const copyInviteLink = () => {
        const url = `${window.location.origin}/study-buddy?code=${inviteCode}`;
        navigator.clipboard.writeText(url);
        toast.success("Invite link copied to clipboard!");
    };

    const handleJoin = () => {
        if (!joinCode.trim()) return;
        setIsConnected(true);
        toast.success(`Joining session: ${joinCode}`);
        channelRef.current?.postMessage({ type: "join" });
    };

    const sendMessage = () => {
        if (!input.trim() && !selectedFile) return;

        const newMessage: Message = {
            id: crypto.randomUUID(),
            sender: "me",
            text: input,
            timestamp: Date.now(),
            type: selectedFile ? "file" : "text",
            file: selectedFile ? {
                name: selectedFile.name,
                size: (selectedFile.size / 1024).toFixed(1) + " KB",
                type: selectedFile.type
            } : undefined
        };

        setMessages((prev) => [...prev, newMessage]);
        channelRef.current?.postMessage({ type: "message", message: newMessage });

        setInput("");
        setSelectedFile(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
            toast.info(`File selected: ${e.target.files[0].name}`);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <AppLayout>
            <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
                {/* Header Information */}
                {!isConnected ? (
                    <div className="flex-1 flex flex-col">
                        <div className="text-center space-y-4 mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-study-pink/10 text-study-pink text-sm font-bold">
                                <Users className="h-4 w-4" />
                                <span>Co-Study Beta</span>
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter text-gradient">The ultimate <br /> study space for two.</h1>
                            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                                Stop studying alone. Connect with a partner to share files,
                                track goals, and stay motivated in real-time.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
                            <Card className="glass-card border-none shadow-hard p-1">
                                <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                                    <div className="h-20 w-20 rounded-3xl bg-study-purple flex items-center justify-center shadow-lg shadow-study-purple/40">
                                        <Plus className="h-10 w-10 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold">Create a Room</h3>
                                        <p className="text-sm text-muted-foreground">Start a new private session and invite your buddy.</p>
                                    </div>
                                    <div className="w-full space-y-4">
                                        <div className="bg-muted/50 p-4 rounded-2xl flex items-center justify-between border">
                                            <code className="text-xl font-black tracking-widest text-study-purple">{inviteCode}</code>
                                            <Button variant="ghost" size="icon" onClick={copyInviteLink}>
                                                <Copy className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <Button className="w-full gradient-primary text-white h-14 rounded-2xl font-bold text-lg" onClick={copyInviteLink}>
                                            Copy Invite Link
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass-card border-none shadow-hard p-1">
                                <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                                    <div className="h-20 w-20 rounded-3xl bg-study-blue flex items-center justify-center shadow-lg shadow-study-blue/40">
                                        <LinkIcon className="h-10 w-10 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold">Join Friend</h3>
                                        <p className="text-sm text-muted-foreground">Have an invite code? Enter it below to connect.</p>
                                    </div>
                                    <div className="w-full space-y-4">
                                        <Input
                                            placeholder="Enter Code (e.g. XJ92LK)"
                                            className="h-14 rounded-2xl text-center text-lg font-black tracking-widest uppercase border-2 focus-visible:ring-study-blue"
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        />
                                        <Button
                                            className="w-full bg-study-blue hover:bg-study-blue/90 text-white h-14 rounded-2xl font-bold text-lg"
                                            onClick={handleJoin}
                                            disabled={!joinCode}
                                        >
                                            Connect Now
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex gap-6 overflow-hidden">
                        {/* Participants Sidebar */}
                        <div className="w-80 hidden lg:flex flex-col gap-4">
                            <Card className="flex-1 glass-card border-white/10 overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-white/5">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="font-black text-xl flex items-center gap-2">
                                            <Users className="h-5 w-5 text-study-purple" /> Buddy List
                                        </h2>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Search people..." className="pl-9 h-10 rounded-xl bg-muted/30 border-none" />
                                    </div>
                                </div>
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-2">
                                        {participants.map(p => (
                                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/5 cursor-pointer transition-all border border-transparent hover:border-primary/10 group">
                                                <div className="relative">
                                                    <Avatar className="h-12 w-12 border-2 border-background">
                                                        <AvatarImage src={p.avatar} />
                                                        <AvatarFallback>{p.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className={cn("absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background",
                                                        p.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                                    )} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">{p.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate uppercase tracking-widest font-black opacity-50">
                                                        {p.status}
                                                    </p>
                                                </div>
                                                <MoreVertical className="h-4 w-4 opacity-0 group-hover:opacity-40" />
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="p-4 bg-muted/10 border-t border-white/5">
                                    <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-wider rounded-xl gap-2" onClick={() => setIsConnected(false)}>
                                        <X className="h-3 w-3" /> Terminate Session
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        {/* Middle Chat Area */}
                        <Card className="flex-1 glass-card border-none shadow-hard flex flex-col overflow-hidden">
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-primary/5 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-4">
                                        {participants.map(p => (
                                            <Avatar key={p.id} className="h-10 w-10 border-4 border-background shadow-sm ring-2 ring-primary/10">
                                                <AvatarImage src={p.avatar} />
                                                <AvatarFallback>{p.name[0]}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                    <div className="ml-2">
                                        <h3 className="font-black text-lg">Co-Study Room</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                            <p className="text-xs font-bold uppercase tracking-widest text-green-600">2 Connected • In Sync</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                                        <Video className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                                        <Share2 className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                    <Separator orientation="vertical" className="h-6 mx-2" />
                                    <Badge className="bg-study-purple px-3 py-1 font-mono text-sm tracking-tighter">
                                        <Timer className="h-3 w-3 mr-2" /> 24:15
                                    </Badge>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                                <div className="space-y-6">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={cn(
                                            "flex flex-col gap-1",
                                            msg.sender === "me" ? "items-end" : "items-start",
                                            msg.type === 'system' && "items-center my-4"
                                        )}>
                                            {msg.type === 'system' ? (
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full bg-muted/40 text-muted-foreground border border-white/5">
                                                    {msg.text} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            ) : (
                                                <>
                                                    <div className={cn(
                                                        "max-w-[80%] rounded-2xl p-4 shadow-sm relative group",
                                                        msg.sender === "me"
                                                            ? "bg-primary text-white rounded-tr-none shadow-primary/20"
                                                            : "bg-white dark:bg-zinc-900 border border-white/10 rounded-tl-none"
                                                    )}>
                                                        {msg.type === 'file' && msg.file && (
                                                            <div className={cn(
                                                                "flex items-center gap-4 p-3 rounded-xl mb-2 border transition-all",
                                                                msg.sender === "me" ? "bg-white/10 border-white/20" : "bg-primary/5 border-primary/20"
                                                            )}>
                                                                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                                                                    <FileText className="h-6 w-6" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold truncate">{msg.file.name}</p>
                                                                    <p className="text-xs opacity-60 font-medium uppercase tracking-widest">{msg.file.size}</p>
                                                                </div>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                                    <FileUp className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                        <p className="text-sm leading-relaxed">{msg.text}</p>

                                                        {/* Timestamp Overlay on hover */}
                                                        <span className={cn(
                                                            "text-[9px] font-bold uppercase tracking-widest absolute bottom-[-18px] opacity-0 group-hover:opacity-60 transition-opacity",
                                                            msg.sender === 'me' ? 'right-0' : 'left-0'
                                                        )}>
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}

                                    {isTyping && (
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={participants[1].avatar} />
                                            </Avatar>
                                            <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-none">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                                                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="p-6 bg-background/50 border-t border-white/5 space-y-4">
                                {selectedFile && (
                                    <div className="flex items-center gap-3 p-2 pl-3 bg-primary/5 border border-primary/20 rounded-xl relative group max-w-xs animate-in slide-in-from-bottom-2">
                                        <Paperclip className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-bold truncate flex-1">{selectedFile.name}</span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 rounded-full"
                                            onClick={() => setSelectedFile(null)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}

                                <div className="flex gap-3 items-end">
                                    <div className="flex-1 relative flex items-center">
                                        <input
                                            type="file"
                                            id="buddy-file-share"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                        <label htmlFor="buddy-file-share">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                                className="absolute left-2 text-muted-foreground hover:text-primary rounded-xl"
                                            >
                                                <span><Paperclip className="h-5 w-5" /></span>
                                            </Button>
                                        </label>

                                        <Input
                                            placeholder="Type a collaborative thought..."
                                            value={input}
                                            onChange={(e) => {
                                                setInput(e.target.value);
                                                channelRef.current?.postMessage({ type: "typing" });
                                            }}
                                            onKeyPress={handleKeyPress}
                                            className="pl-12 pr-12 h-14 rounded-[1.25rem] bg-muted/20 border-white/10 focus-visible:ring-primary focus-visible:bg-background transition-all shadow-inner"
                                        />

                                        <div className="absolute right-2 flex gap-1">
                                            <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground">
                                                <Smile className="h-5 w-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground">
                                                <ImageIcon className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Button
                                        className="rounded-2xl h-14 w-14 shrink-0 gradient-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                        onClick={sendMessage}
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Right Sidebar - Dynamic Tools */}
                        <div className="w-80 hidden xl:flex flex-col gap-6">
                            <Card className="glass-card border-none shadow-hard p-6">
                                <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                                    <Hash className="h-5 w-5 text-study-orange" /> Room Task List
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { title: "Review Bio Lecture", done: false },
                                        { title: "Share Chapter 4 PDF", done: true },
                                        { title: "Finish Quiz Part 1", done: false }
                                    ].map((t, idx) => (
                                        <div key={idx} className={cn(
                                            "p-4 rounded-2xl flex items-center gap-3 transition-all cursor-pointer border",
                                            t.done ? "bg-green-500/5 border-green-500/20 opacity-60" : "bg-muted/30 border-transparent hover:border-primary/20"
                                        )}>
                                            <div className={cn(
                                                "h-5 w-5 rounded-md border-2 flex items-center justify-center",
                                                t.done ? "bg-green-500 border-green-500" : "border-muted-foreground/20"
                                            )}>
                                                {t.done && <CheckCircle className="h-4 w-4 text-white" />}
                                            </div>
                                            <span className={cn("text-sm font-bold", t.done && "line-through")}>{t.title}</span>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full mt-2 rounded-xl border-dashed border-2 hover:bg-primary/5 gap-2">
                                        <Plus className="h-4 w-4" /> Add Room Goal
                                    </Button>
                                </div>
                            </Card>

                            <Card className="glass-card border-none shadow-hard p-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <MessageSquare className="h-20 w-20" />
                                </div>
                                <h3 className="font-black text-lg mb-4">Study Tips</h3>
                                <p className="text-sm text-muted-foreground italic leading-relaxed">
                                    "Studying with a buddy can increase retention by up to 25%. Try teaching your partner a concept to master it yourself!"
                                </p>
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                                        <span>Shared Resources</span>
                                        <span>5 Files</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/40 hover:bg-primary/10 cursor-pointer border">
                                                <FileText className="h-5 w-5 opacity-40" />
                                            </div>
                                        ))}
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl border-dashed border-2 opacity-40 hover:opacity-100 cursor-pointer">
                                            <Plus className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
