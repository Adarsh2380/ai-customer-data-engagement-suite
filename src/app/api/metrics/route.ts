import { NextResponse } from "next/server";
import { SAMPLE_CUSTOMERS } from "@/lib/sample-data";
import {
  calculateDashboardMetrics,
  calculateSegmentStats,
  calculateChurnStats,
  generateRevenueTrend,
  getTopCustomers,
} from "@/lib/analytics";

export async function GET() {
  const metrics = calculateDashboardMetrics(SAMPLE_CUSTOMERS);
  const segments = calculateSegmentStats(SAMPLE_CUSTOMERS);
  const churn = calculateChurnStats(SAMPLE_CUSTOMERS);
  const revenueTrend = generateRevenueTrend(SAMPLE_CUSTOMERS);
  const topCustomers = getTopCustomers(SAMPLE_CUSTOMERS, 5);

  return NextResponse.json({
    success: true,
    data: {
      metrics,
      segments,
      churn,
      revenueTrend,
      topCustomers,
    },
    meta: {
      timestamp: new Date().toISOString(),
      customerCount: SAMPLE_CUSTOMERS.length,
    },
  });
}
