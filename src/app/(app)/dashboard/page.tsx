"use client";

import {
  Users,
  DollarSign,
  ShoppingCart,
  Repeat,
  Heart,
  AlertTriangle,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart";
import { SegmentPieChart } from "@/components/dashboard/segment-pie-chart";
import { RevenueBySegmentChart } from "@/components/dashboard/revenue-by-segment-chart";
import { TopCustomersTable } from "@/components/dashboard/top-customers-table";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { useCustomersContext } from "@/components/providers/customers-provider";
import {
  calculateDashboardMetrics,
  calculateSegmentStats,
  generateRevenueTrend,
  getTopCustomers,
} from "@/lib/analytics";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function DashboardPage() {
  const { customers, isLoading, isUsingSample } = useCustomersContext();

  if (isLoading) {
    return (
      <>
        <Navbar title="Executive Dashboard" />
        <DashboardSkeleton />
      </>
    );
  }

  const metrics = calculateDashboardMetrics(customers);
  const segmentStats = calculateSegmentStats(customers);
  const revenueTrend = generateRevenueTrend(customers);
  const topCustomers = getTopCustomers(customers, 8);

  return (
    <>
      <Navbar
        title="Executive Dashboard"
        description="Real-time customer analytics and business intelligence"
        badge={isUsingSample ? "Sample Data" : "Live Data"}
      />
      <div className="space-y-6 p-4 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Total Customers"
            value={formatNumber(metrics.totalCustomers)}
            icon={Users}
            trend={12.5}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            icon={DollarSign}
            trend={8.2}
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(metrics.averageOrderValue)}
            icon={ShoppingCart}
            trend={3.1}
          />
          <StatCard
            title="Repeat Customers"
            value={formatNumber(metrics.repeatCustomers)}
            icon={Repeat}
            trend={5.7}
          />
          <StatCard
            title="Retention Rate"
            value={formatPercent(metrics.retentionRate)}
            icon={Heart}
            trend={2.3}
          />
          <StatCard
            title="Churn Risk"
            value={formatNumber(metrics.churnRiskCount)}
            icon={AlertTriangle}
            description="Medium & high risk"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueTrendChart data={revenueTrend} />
          <SegmentPieChart data={segmentStats} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueBySegmentChart data={segmentStats} />
          <TopCustomersTable customers={topCustomers} />
        </div>
      </div>
    </>
  );
}
