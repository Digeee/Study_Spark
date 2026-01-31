import { useEffect, useRef, useState } from "react";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, Camera, CheckCircle2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FocusMonitor() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
    const [isFaceDetected, setIsFaceDetected] = useState(true);
    const [missedFrames, setMissedFrames] = useState(0);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState<"face" | "window">("face");

    const EMAIL_TARGET = "digee12@gmail.com";

    // Constants
    const DETECTION_INTERVAL = 200;
    const MISSING_THRESHOLD = 1; // Immediate alert as soon as face is gone

    // Load Model
    useEffect(() => {
        const loadModel = async () => {
            try {
                const loadedModel = await blazeface.load();
                setModel(loadedModel);
            } catch (err) {
                console.error("Failed to load face detection model", err);
                toast.error("Failed to load AI model.");
            }
        };
        loadModel();
    }, []);

    // Initialize Audio
    useEffect(() => {
        const audio = new Audio("/fahhhhh.mp3"); // Using user's custom alert sound
        audio.loop = true;
        audioRef.current = audio;
    }, []);

    // Start/Stop Camera
    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            if (!isMonitoring) return;
            setIsLoading(true);
            setCameraError(null);
            try {
                const constraints = { video: { width: 320, height: 240, facingMode: "user" } };
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        setIsLoading(false);
                    };
                }
            } catch (err) {
                setCameraError("Camera access denied.");
                setIsMonitoring(false);
                setIsLoading(false);
            }
        };

        if (isMonitoring) startCamera();
        else {
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                videoRef.current.srcObject = null;
            }
            setShowAlert(false);
            audioRef.current?.pause();
        }

        return () => stream?.getTracks().forEach(t => t.stop());
    }, [isMonitoring]);

    // Detection Loop
    useEffect(() => {
        if (!isMonitoring || !model || !videoRef.current || showAlert) return;

        const interval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                try {
                    const predictions = await model.estimateFaces(videoRef.current, false);
                    if (predictions.length > 0) {
                        setMissedFrames(0);
                        setIsFaceDetected(true);
                    } else {
                        setMissedFrames(prev => {
                            const newCount = prev + 1;
                            if (newCount >= MISSING_THRESHOLD) {
                                if (prev < MISSING_THRESHOLD) {
                                    setIsFaceDetected(false);
                                    setAlertType("face");
                                    triggerAlert("Absence Detected", "Guardian Neural Link Lost. The user has moved out of the frame.");
                                }
                            }
                            return newCount;
                        });
                    }
                } catch (err) { console.error(err); }
            }
        }, DETECTION_INTERVAL);
        return () => clearInterval(interval);
    }, [isMonitoring, model, showAlert]);

    // Window Focus Detection
    useEffect(() => {
        if (!isMonitoring || showAlert) return;

        const handleBlur = () => {
            setAlertType("window");
            triggerAlert("Focus Lost", "The user has switched tabs or minimized the window.");
        };

        window.addEventListener("blur", handleBlur);
        return () => window.removeEventListener("blur", handleBlur);
    }, [isMonitoring, showAlert]);

    const triggerAlert = (title: string, message: string) => {
        setShowAlert(true);
        audioRef.current?.play().catch(console.error);

        // Automatically send email notification
        fetch(`https://formsubmit.co/ajax/${EMAIL_TARGET}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                subject: `Focus Alert: ${title}`,
                message: `${message} Detected during a Focus Session.`,
                timestamp: new Date().toLocaleString(),
                protocol: "Study Spark Deep Work Protocol v1.4.2"
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("Email notification status:", data);
                toast.info(`Email alert sent to ${EMAIL_TARGET}`);
            })
            .catch(error => {
                console.error("Email notification failed:", error);
                toast.error("Failed to send email alert.");
            });
    };

    const handleResume = () => {
        setMissedFrames(0);
        setIsFaceDetected(true);
        setShowAlert(false);
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    return (
        <>
            {/* ABSENCE ALERT OVERLAY */}
            {showAlert && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-500">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-950/40 via-black to-black" />
                    <div className="relative z-10 flex flex-col items-center space-y-8 max-w-4xl">
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-red-600 rounded-3xl flex items-center justify-center shadow-[0_0_80px_rgba(220,38,38,0.6)] animate-pulse">
                            <ShieldAlert className="w-12 h-12 md:w-16 md:h-16 text-white" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-white uppercase leading-[0.8]">
                                {alertType === "face" ? "Absence" : "Focus"} <br /> Detected
                            </h1>
                            <p className="text-red-500 font-extrabold tracking-[0.3em] text-sm md:text-lg uppercase">
                                {alertType === "face"
                                    ? "Guardian Neural Link Lost • Return to Frame Immediately"
                                    : "Unauthorized Context Switch • Return to Work Surface"}
                            </p>
                        </div>
                        <Button
                            size="lg"
                            onClick={handleResume}
                            className="bg-white text-black hover:bg-white/90 font-black rounded-full px-16 h-16 md:h-20 text-xl uppercase shadow-2xl transition-transform hover:scale-105"
                        >
                            Resume Session
                        </Button>
                        <p className="mt-12 text-[10px] md:text-xs tracking-[0.5em] font-bold text-white/20 uppercase">
                            Study Spark Deep Work Protocol v1.4.2 Active
                        </p>
                    </div>
                </div>
            )}

            <Card className="border-study-purple/30 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-sm">
                <CardHeader className="bg-muted/50 pb-4 border-b border-study-purple/10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Camera className="h-5 w-5 text-study-purple" />
                            AI Focus Monitor
                        </CardTitle>
                        <div className="flex items-center space-x-3">
                            <Label htmlFor="monitor-mode" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {isMonitoring ? "Active" : "Ready"}
                            </Label>
                            <Switch
                                id="monitor-mode"
                                checked={isMonitoring}
                                onCheckedChange={setIsMonitoring}
                                disabled={!model}
                                className="data-[state=checked]:bg-study-purple"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0 relative bg-zinc-950 aspect-video flex items-center justify-center overflow-hidden">
                    {!isMonitoring && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-zinc-900/50 z-10">
                            <div className="p-4 rounded-full bg-study-purple/10 mb-4 tracking-tighter">
                                <EyeOff className="h-8 w-8 text-study-purple/40" />
                            </div>
                            <p className="text-sm font-medium">Monitoring Paused</p>
                        </div>
                    )}

                    {isMonitoring && isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 bg-black/40 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-study-purple mb-4"></div>
                            <p className="text-xs font-bold uppercase tracking-widest text-study-purple">Calibrating Lens...</p>
                        </div>
                    )}

                    {cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive bg-zinc-950 z-20 p-6 text-center">
                            <AlertCircle className="h-12 w-12 mb-4 animate-bounce" />
                            <h3 className="font-bold text-lg mb-1">Optics Offline</h3>
                            <p className="text-sm opacity-80">{cameraError}</p>
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        className={`w-full h-full object-cover transition-opacity duration-1000 ${isMonitoring ? 'opacity-100' : 'opacity-0'}`}
                        muted
                        playsInline
                    />

                    {/* Status HUD */}
                    {isMonitoring && !isLoading && !cameraError && (
                        <div className={`absolute bottom-6 left-6 right-6 p-4 rounded-2xl backdrop-blur-xl transition-all duration-500 border ${isFaceDetected
                            ? "bg-black/40 border-green-500/30 text-green-400"
                            : "bg-red-500/20 border-red-500/50 text-red-500"
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${isFaceDetected ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">
                                        {isFaceDetected ? "Subject In Frame" : "Identity Lost"}
                                    </span>
                                </div>
                                <div className="text-[10px] font-mono opacity-50">
                                    {isFaceDetected ? "STABLE" : "WARNING"}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
