import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudySession } from "@/types/study";

interface SubjectChartProps {
  sessions: StudySession[];
}

const COLORS = [
  "hsl(145, 63%, 49%)",
  "hsl(20, 100%, 65%)",
  "hsl(217, 91%, 60%)",
  "hsl(187, 85%, 53%)",
  "hsl(330, 85%, 60%)",
  "hsl(35, 91%, 54%)",
];

export function SubjectChart({ sessions }: SubjectChartProps) {
  // Aggregate by subject
  const subjectData: Record<string, number> = {};
  sessions.forEach((s) => {
    subjectData[s.subject] = (subjectData[s.subject] || 0) + s.duration_minutes;
  });

  const chartData = Object.entries(subjectData)
    .map(([name, value]) => ({
      name,
      value,
      hours: (value / 60).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 subjects

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span>📚</span> Subjects Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            No study sessions yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span>📚</span> Subjects Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-card p-2 shadow-lg">
                        <p className="font-semibold">{payload[0].payload.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {payload[0].payload.hours} hours
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
