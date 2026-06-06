"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SegmentPieChart } from "@/components/dashboard/segment-pie-chart";
import { RevenueBySegmentChart } from "@/components/dashboard/revenue-by-segment-chart";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { useCustomersContext } from "@/components/providers/customers-provider";
import {
  calculateSegmentStats,
  enrichCustomers,
} from "@/lib/analytics";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import type { CustomerSegment } from "@/types/customer";

const SEGMENTS: CustomerSegment[] = ["High Value", "Medium Value", "Low Value"];

function getSegmentBadgeVariant(segment: CustomerSegment) {
  switch (segment) {
    case "High Value":
      return "success" as const;
    case "Medium Value":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

export default function SegmentationPage() {
  const { customers, isLoading } = useCustomersContext();
  const [activeSegment, setActiveSegment] = useState<CustomerSegment>("High Value");

  const segmentStats = useMemo(
    () => calculateSegmentStats(customers),
    [customers]
  );

  const enriched = useMemo(
    () => enrichCustomers(customers),
    [customers]
  );

  const filteredCustomers = enriched.filter((c) => c.segment === activeSegment);

  if (isLoading) {
    return (
      <>
        <Navbar title="Customer Segmentation" />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <Navbar
        title="Customer Segmentation"
        description="Automatic RFM-based customer classification"
      />
      <div className="space-y-6 p-4 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {segmentStats.map((stat) => (
            <Card
              key={stat.segment}
              className={`cursor-pointer transition-shadow hover:shadow-md ${
                activeSegment === stat.segment ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setActiveSegment(stat.segment)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.segment}
                  </CardTitle>
                  <Badge variant={getSegmentBadgeVariant(stat.segment)}>
                    {formatPercent(stat.percentage)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(stat.count)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(stat.revenue)} revenue
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          <strong>Segmentation Rules:</strong> High Value (revenue &gt; $10,000)
          · Medium Value ($5,000–$10,000) · Low Value (&lt; $5,000)
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SegmentPieChart data={segmentStats} />
          <RevenueBySegmentChart data={segmentStats} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeSegment} Customers ({filteredCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="high-value">
              <TabsList>
                {SEGMENTS.map((seg) => (
                  <TabsTrigger
                    key={seg}
                    value={seg.toLowerCase().replace(" ", "-")}
                    onClick={() => setActiveSegment(seg)}
                  >
                    {seg}
                  </TabsTrigger>
                ))}
              </TabsList>
              {SEGMENTS.map((seg) => (
                <TabsContent key={seg} value={seg.toLowerCase().replace(" ", "-")}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 pr-4 font-medium">Customer</th>
                          <th className="pb-3 pr-4 font-medium">Revenue</th>
                          <th className="pb-3 pr-4 font-medium">Orders</th>
                          <th className="pb-3 pr-4 font-medium">Churn Risk</th>
                          <th className="pb-3 font-medium">Last Purchase</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enriched
                          .filter((c) => c.segment === seg)
                          .sort((a, b) => b.revenue - a.revenue)
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
                              <td className="py-3 pr-4">{customer.orders}</td>
                              <td className="py-3 pr-4">
                                <Badge
                                  variant={
                                    customer.churnRisk === "High Risk"
                                      ? "danger"
                                      : customer.churnRisk === "Medium Risk"
                                        ? "warning"
                                        : "success"
                                  }
                                >
                                  {customer.churnRisk}
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
