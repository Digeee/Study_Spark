import { AppLayout } from "@/components/AppLayout";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { usePomodoroSessions } from "@/hooks/usePomodoroSessions";
import { Card, CardContent } from "@/components/ui/card";

export default function FocusMode() {
  const { sessions } = usePomodoroSessions();
  const todaySessions = sessions.filter(
    (s) => s.study_date === new Date().toISOString().split("T")[0]
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Focus Mode <span className="animate-pulse">⚡</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Use the Pomodoro technique to maximize your focus and productivity
          </p>
        </div>

        <PomodoroTimer />

        {/* Tips Card */}
        <Card className="border-study-purple/30 bg-gradient-to-br from-study-purple/5 to-study-pink/5">
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold">💡 Focus Tips</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Put your phone on silent or in another room</li>
              <li>• Close unnecessary browser tabs and apps</li>
              <li>• Have water nearby to stay hydrated</li>
              <li>• Use break time to stretch and rest your eyes</li>
            </ul>
          </CardContent>
        </Card>

        {/* Today's Focus Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Focus Sessions</p>
                <p className="text-2xl font-bold">{todaySessions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Focus Time</p>
                <p className="text-2xl font-bold">
                  {todaySessions.reduce((sum, s) => sum + s.duration_minutes, 0)} min
                </p>
              </div>
              <div className="text-4xl">🍅</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
