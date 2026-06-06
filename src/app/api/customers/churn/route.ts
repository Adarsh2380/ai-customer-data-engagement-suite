import { NextResponse } from "next/server";
import { SAMPLE_CUSTOMERS } from "@/lib/sample-data";
import { enrichCustomers } from "@/lib/analytics";
import type { ChurnRisk } from "@/types/customer";

const VALID_RISKS: ChurnRisk[] = ["High Risk", "Medium Risk", "Low Risk"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const risk = searchParams.get("risk") as ChurnRisk | null;

  if (!risk || !VALID_RISKS.includes(risk)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid risk level. Use: High Risk, Medium Risk, or Low Risk",
      },
      { status: 400 }
    );
  }

  const customers = enrichCustomers(SAMPLE_CUSTOMERS).filter(
    (c) => c.churnRisk === risk
  );

  const totalRevenue = customers.reduce((sum, c) => sum + c.revenue, 0);

  return NextResponse.json({
    success: true,
    risk,
    count: customers.length,
    totalRevenueAtRisk: totalRevenue,
    data: customers,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
