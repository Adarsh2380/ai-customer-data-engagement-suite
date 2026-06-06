"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { useCustomersContext } from "@/components/providers/customers-provider";
import {
  calculateChurnStats,
  enrichCustomers,
} from "@/lib/analytics";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import type { ChurnRisk } from "@/types/customer";

const RISK_COLORS: Record<ChurnRisk, string> = {
  "High Risk": "#ef4444",
  "Medium Risk": "#f59e0b",
  "Low Risk": "#22c55e",
};

const RISKS: ChurnRisk[] = ["High Risk", "Medium Risk", "Low Risk"];

export default function ChurnPage() {
  const { customers, isLoading } = useCustomersContext();
  const [activeRisk, setActiveRisk] = useState<ChurnRisk>("High Risk");

  const churnStats = useMemo(
    () => calculateChurnStats(customers),
    [customers]
  );

  const enriched = useMemo(
    () => enrichCustomers(customers),
    [customers]
  );

  const chartData = churnStats.map((s) => ({
    risk: s.risk.replace(" Risk", ""),
    count: s.count,
    fill: RISK_COLORS[s.risk],
  }));

  if (isLoading) {
    return (
      <>
        <Navbar title="Churn Analysis" />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <Navbar
        title="Churn Prediction"
        description="Identify at-risk customers before they leave"
      />
      <div className="space-y-6 p-4 lg:p-8">
        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          <strong>Churn Logic:</strong> High Risk (&gt;90 days since last
          purchase) · Medium Risk (&gt;60 days) · Low Risk (≤60 days)
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {churnStats.map((stat) => (
            <Card
              key={stat.risk}
              className={`cursor-pointer transition-shadow hover:shadow-md ${
                activeRisk === stat.risk ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setActiveRisk(stat.risk)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.risk}
                  </CardTitle>
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[stat.risk] }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(stat.count)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatPercent(stat.percentage)} of customers
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Churn Risk Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="risk"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>At-Risk Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {RISKS.map((risk) => {
                const stat = churnStats.find((s) => s.risk === risk)!;
                const revenue = enriched
                  .filter((c) => c.churnRisk === risk)
                  .reduce((sum, c) => sum + c.revenue, 0);
                return (
                  <div
                    key={risk}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: RISK_COLORS[risk] }}
                      />
                      <div>
                        <p className="font-medium">{risk}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(stat.count)} customers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(revenue)}</p>
                      <p className="text-xs text-muted-foreground">at risk</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Lists by Churn Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="high-risk">
              <TabsList>
                {RISKS.map((risk) => (
                  <TabsTrigger
                    key={risk}
                    value={risk.toLowerCase().replace(" ", "-")}
                    onClick={() => setActiveRisk(risk)}
                  >
                    {risk} (
                    {enriched.filter((c) => c.churnRisk === risk).length})
                  </TabsTrigger>
                ))}
              </TabsList>
              {RISKS.map((risk) => (
                <TabsContent
                  key={risk}
                  value={risk.toLowerCase().replace(" ", "-")}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 pr-4 font-medium">Customer</th>
                          <th className="pb-3 pr-4 font-medium">Revenue</th>
                          <th className="pb-3 pr-4 font-medium">Segment</th>
                          <th className="pb-3 pr-4 font-medium">
                            Days Inactive
                          </th>
                          <th className="pb-3 font-medium">Last Purchase</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enriched
                          .filter((c) => c.churnRisk === risk)
                          .sort(
                            (a, b) =>
                              b.daysSinceLastPurchase - a.daysSinceLastPurchase
                          )
                          .map((customer) => (
                            <tr
                              key={customer.customer_id}
                              className="border-b last:border-0"
                            >
                              <td className="py-3 pr-4">
                                <p className="font-medium">
                                  {customer.customer_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {customer.email}
                                </p>
                              </td>
                              <td className="py-3 pr-4 font-medium">
                                {formatCurrency(customer.revenue)}
                              </td>
                              <td className="py-3 pr-4">
                                <Badge variant="outline">
                                  {customer.segment}
                                </Badge>
                              </td>
                              <td className="py-3 pr-4">
                                <Badge
                                  variant={
                                    customer.daysSinceLastPurchase > 90
                                      ? "danger"
                                      : customer.daysSinceLastPurchase > 60
                                        ? "warning"
                                        : "success"
                                  }
                                >
                                  {customer.daysSinceLastPurchase} days
                                </Badge>
                              </td>
                              <td className="py-3 text-muted-foreground">
                                {customer.last_purchase_date}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
