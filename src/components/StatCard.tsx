import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  colorClass?: string;
}

export function StatCard({ title, value, icon, subtitle, colorClass }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] glass-card border-none">
      <div className={cn("absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.06] bg-current", colorClass)} />
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className={cn("inline-flex w-12 h-12 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-soft", colorClass, "bg-current/10")}>
            <div className={colorClass}>
              {icon}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/60">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className={cn("text-3xl font-bold tracking-tight", colorClass)}>{value}</p>
            </div>
            {subtitle && (
              <p className="mt-2 text-xs font-medium text-muted-foreground/50 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-current" />
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
