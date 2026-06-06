"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SegmentStats } from "@/types/customer";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#2563eb", "#7c3aed", "#0891b2"];

interface SegmentPieChartProps {
  data: SegmentStats[];
  title?: string;
}

export function SegmentPieChart({
  data,
  title = "Customer Segment Distribution",
}: SegmentPieChartProps) {
  const chartData = data.map((d) => ({
    name: d.segment,
    value: d.count,
    revenue: d.revenue,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _name: string, item) => [
                `${value} customers (${formatCurrency(item.payload.revenue as number)})`,
                item.payload.name as string,
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
