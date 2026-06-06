"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3 text-emerald-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span
              className={cn(
                trend >= 0 ? "text-emerald-600" : "text-red-600"
              )}
            >
              {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
