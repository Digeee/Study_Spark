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
    <Card className="overflow-hidden border-border/50 transition-all hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("mt-1 text-2xl font-bold", colorClass)}>{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn("rounded-lg bg-secondary p-2", colorClass)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
