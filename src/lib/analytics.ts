import type {
  Customer,
  CustomerSegment,
  ChurnRisk,
  SegmentedCustomer,
  DashboardMetrics,
  SegmentStats,
  ChurnStats,
  RevenueTrendPoint,
} from "@/types/customer";

export function getSegment(revenue: number): CustomerSegment {
  if (revenue > 10000) return "High Value";
  if (revenue >= 5000) return "Medium Value";
  return "Low Value";
}

export function getDaysSinceLastPurchase(lastPurchaseDate: string): number {
  const last = new Date(lastPurchaseDate);
  const now = new Date();
  const diff = now.getTime() - last.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getChurnRisk(lastPurchaseDate: string): ChurnRisk {
  const days = getDaysSinceLastPurchase(lastPurchaseDate);
  if (days > 90) return "High Risk";
  if (days > 60) return "Medium Risk";
  return "Low Risk";
}

export function enrichCustomers(customers: Customer[]): SegmentedCustomer[] {
  return customers.map((customer) => ({
    ...customer,
    segment: getSegment(customer.revenue),
    churnRisk: getChurnRisk(customer.last_purchase_date),
    daysSinceLastPurchase: getDaysSinceLastPurchase(customer.last_purchase_date),
  }));
}

export function calculateDashboardMetrics(
  customers: Customer[]
): DashboardMetrics {
  const enriched = enrichCustomers(customers);
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.revenue, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const repeatCustomers = customers.filter((c) => c.orders > 1).length;
  const retentionRate =
    totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
  const churnRiskCount = enriched.filter(
    (c) => c.churnRisk === "High Risk" || c.churnRisk === "Medium Risk"
  ).length;

  return {
    totalCustomers,
    totalRevenue,
    averageOrderValue,
    repeatCustomers,
    retentionRate,
    churnRiskCount,
  };
}

export function calculateSegmentStats(customers: Customer[]): SegmentStats[] {
  const enriched = enrichCustomers(customers);
  const totalRevenue = enriched.reduce((sum, c) => sum + c.revenue, 0);
  const segments: CustomerSegment[] = ["High Value", "Medium Value", "Low Value"];

  return segments.map((segment) => {
    const segmentCustomers = enriched.filter((c) => c.segment === segment);
    const revenue = segmentCustomers.reduce((sum, c) => sum + c.revenue, 0);
    return {
      segment,
      count: segmentCustomers.length,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    };
  });
}

export function calculateChurnStats(customers: Customer[]): ChurnStats[] {
  const enriched = enrichCustomers(customers);
  const risks: ChurnRisk[] = ["High Risk", "Medium Risk", "Low Risk"];

  return risks.map((risk) => {
    const riskCustomers = enriched.filter((c) => c.churnRisk === risk);
    return {
      risk,
      count: riskCustomers.length,
      percentage:
        enriched.length > 0
          ? (riskCustomers.length / enriched.length) * 100
          : 0,
    };
  });
}

export function getTopCustomers(
  customers: Customer[],
  limit = 10
): SegmentedCustomer[] {
  return enrichCustomers(customers)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function generateRevenueTrend(
  customers: Customer[]
): RevenueTrendPoint[] {
  const months: RevenueTrendPoint[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });

    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const activeInMonth = customers.filter((c) => {
      const purchaseDate = new Date(c.last_purchase_date);
      return purchaseDate >= monthStart && purchaseDate <= monthEnd;
    });

    const revenue = activeInMonth.reduce((sum, c) => sum + c.revenue / 6, 0);

    months.push({
      month: monthKey,
      revenue: Math.round(revenue),
      customers: activeInMonth.length,
    });
  }

  return months;
}

export function buildCustomerSummary(customers: Customer[]): string {
  const metrics = calculateDashboardMetrics(customers);
  const segments = calculateSegmentStats(customers);
  const churn = calculateChurnStats(customers);
  const top = getTopCustomers(customers, 5);

  return `
Customer Data Summary:
- Total Customers: ${metrics.totalCustomers}
- Total Revenue: $${metrics.totalRevenue.toLocaleString()}
- Average Order Value: $${metrics.averageOrderValue.toFixed(2)}
- Repeat Customers: ${metrics.repeatCustomers} (${metrics.retentionRate.toFixed(1)}% retention)
- At-Risk Customers: ${metrics.churnRiskCount}

Segment Breakdown:
${segments.map((s) => `- ${s.segment}: ${s.count} customers, $${s.revenue.toLocaleString()} revenue (${s.percentage.toFixed(1)}%)`).join("\n")}

Churn Risk:
${churn.map((c) => `- ${c.risk}: ${c.count} customers (${c.percentage.toFixed(1)}%)`).join("\n")}

Top 5 Customers:
${top.map((c, i) => `${i + 1}. ${c.customer_name} - $${c.revenue.toLocaleString()} (${c.segment}, ${c.churnRisk})`).join("\n")}
`.trim();
}
