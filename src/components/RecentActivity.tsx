import { StudySession } from "@/types/study";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentActivityProps {
  sessions: StudySession[];
}

const subjectColors = [
  "bg-study-purple/20 text-study-purple border-study-purple/30",
  "bg-study-blue/20 text-study-blue border-study-blue/30",
  "bg-study-pink/20 text-study-pink border-study-pink/30",
  "bg-study-orange/20 text-study-orange border-study-orange/30",
  "bg-study-green/20 text-study-green border-study-green/30",
  "bg-study-cyan/20 text-study-cyan border-study-cyan/30",
];

const getSubjectColor = (subject: string) => {
  const hash = subject.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return subjectColors[hash % subjectColors.length];
};

export function RecentActivity({ sessions }: RecentActivityProps) {
  const recentSessions = sessions.slice(0, 5);

  if (recentSessions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span>📝</span> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            No study sessions yet. Start studying to see your activity here!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span>📝</span> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentSessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3"
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={getSubjectColor(session.subject)}
              >
                {session.subject}
              </Badge>
              <div>
                <p className="font-medium">
                  {session.duration_minutes >= 60
                    ? `${(session.duration_minutes / 60).toFixed(1)} hours`
                    : `${session.duration_minutes} mins`}
                </p>
                {session.goal && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    🎯 {session.goal}
                  </p>
                )}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {format(parseISO(session.study_date), "MMM d")}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
