import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, BookOpen, Target, Zap, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      title: "Welcome to Study Spark!",
      description: "Your personal AI-powered study companion",
      icon: <BookOpen className="h-12 w-12 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Study Spark helps you organize your studies, track progress, and learn smarter with AI assistance.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Track study sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">AI-powered insights</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Document analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Smart flashcards</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Getting Started",
      description: "Let's set up your study environment",
      icon: <Target className="h-12 w-12 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Here's what you can do right away:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
              <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Upload Documents</h4>
                <p className="text-sm text-muted-foreground">Add PDFs, notes, or textbooks for AI analysis</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
              <Zap className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Log Study Sessions</h4>
                <p className="text-sm text-muted-foreground">Track time spent on different subjects</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
              <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Get AI Insights</h4>
                <p className="text-sm text-muted-foreground">Receive personalized learning recommendations</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Start Your Journey",
      description: "Ready to begin your learning adventure?",
      icon: <Zap className="h-12 w-12 text-yellow-500" />,
      content: (
        <div className="space-y-4 text-center">
          <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 w-20 h-20 mx-auto flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold">You're All Set!</h3>
          <p className="text-muted-foreground">
            Start by adding your first study session or uploading a document to get personalized insights.
          </p>
          <div className="pt-4">
            <Badge variant="secondary" className="text-sm">
              Pro Tip: Log at least 15 minutes daily to build your study streak!
            </Badge>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];

  const nextStep = () => {
    if (step < steps.length) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      // Celebrate completion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onClose();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  // Auto-show onboarding for new users
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      // Show onboarding automatically for first-time users
      localStorage.setItem("hasSeenOnboarding", "true");
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Getting Started</DialogTitle>
        </DialogHeader>
        
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4">
                {currentStep.icon}
              </div>
              <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
              <CardDescription className="text-base">
                {currentStep.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep.content}
              
              <div className="flex justify-between items-center pt-6">
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index + 1 <= step 
                          ? "w-6 bg-primary" 
                          : "w-2 bg-muted"
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex gap-2">
                  {step > 1 && (
                    <Button variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                  )}
                  <Button onClick={nextStep}>
                    {step === steps.length ? "Get Started" : "Next"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}