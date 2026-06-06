"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SegmentStats } from "@/types/customer";
import { formatCurrency } from "@/lib/utils";

interface RevenueBySegmentChartProps {
  data: SegmentStats[];
}

export function RevenueBySegmentChart({ data }: RevenueBySegmentChartProps) {
  const chartData = data.map((d) => ({
    segment: d.segment.replace(" Value", ""),
    revenue: d.revenue,
    count: d.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Segment</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="segment"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
              }}
            />
            <Bar
              dataKey="revenue"
              fill="hsl(221, 83%, 53%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
