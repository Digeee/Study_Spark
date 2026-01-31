import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyStats } from "@/types/study";
import { format, parseISO } from "date-fns";

interface StudyChartProps {
  data: DailyStats[];
}

const COLORS = [
  "hsl(262, 83%, 58%)", // purple
  "hsl(217, 91%, 60%)", // blue
  "hsl(330, 85%, 60%)", // pink
  "hsl(25, 95%, 53%)",  // orange
  "hsl(142, 71%, 45%)", // green
  "hsl(187, 85%, 53%)", // cyan
  "hsl(262, 83%, 58%)", // purple (repeat)
];

export function StudyChart({ data }: StudyChartProps) {
  const chartData = data.map((d, index) => ({
    day: format(parseISO(d.date), "EEE"),
    minutes: d.totalMinutes,
    hours: (d.totalMinutes / 60).toFixed(1),
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span>📊</span> Weekly Study Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => `${Math.round(value / 60)}h`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-card p-2 shadow-lg">
                        <p className="font-semibold">{payload[0].payload.hours} hours</p>
                        <p className="text-sm text-muted-foreground">
                          {payload[0].payload.minutes} minutes
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
