import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudySessions } from "@/hooks/useStudySessions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Timer } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const commonSubjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Computer Science",
  "Economics",
];

export function StudyForm() {
  const navigate = useNavigate();
  const { sessions, addSession } = useStudySessions();
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState<"minutes" | "hours">("minutes");
  const [goal, setGoal] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get recent subjects for quick selection
  const recentSubjects = [...new Set(sessions.map((s) => s.subject))].slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !duration) return;

    setIsSubmitting(true);
    const durationMinutes = durationUnit === "hours" 
      ? Math.round(parseFloat(duration) * 60)
      : parseInt(duration, 10);

    await addSession.mutateAsync({
      subject: subject.trim(),
      duration_minutes: durationMinutes,
      goal: goal.trim() || null,
      study_date: format(date, "yyyy-MM-dd"),
    });

    setIsSubmitting(false);
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📚</span> Log Study Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="What did you study?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            {/* Quick subject chips */}
            <div className="flex flex-wrap gap-2">
              {(recentSubjects.length > 0 ? recentSubjects : commonSubjects.slice(0, 5)).map((s) => (
                <Badge
                  key={s}
                  variant={subject === s ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSubject(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  step="1"
                  placeholder={durationUnit === "hours" ? "1.5" : "30"}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <div className="flex rounded-md border">
                <button
                  type="button"
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    durationUnit === "minutes"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                  onClick={() => setDurationUnit("minutes")}
                >
                  mins
                </button>
                <button
                  type="button"
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    durationUnit === "hours"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                  onClick={() => setDurationUnit("hours")}
                >
                  hours
                </button>
              </div>
            </div>
          </div>

          {/* Goal (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="goal">
              Study Goal <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="goal"
              placeholder="What do you want to accomplish? e.g., Complete Chapter 5 exercises"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-primary to-accent"
          disabled={isSubmitting || !subject.trim() || !duration}
        >
          {isSubmitting ? "Saving..." : "Log Session 📚"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/focus-mode")}
          className="flex items-center gap-2"
        >
          <Timer className="h-4 w-4" />
          Focus Mode
        </Button>
      </div>
    </form>
  );
}
