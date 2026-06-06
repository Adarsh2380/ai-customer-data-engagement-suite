import { NextResponse } from "next/server";
import { SAMPLE_CUSTOMERS } from "@/lib/sample-data";
import { enrichCustomers } from "@/lib/analytics";
import type { CustomerSegment } from "@/types/customer";

const VALID_SEGMENTS: CustomerSegment[] = [
  "High Value",
  "Medium Value",
  "Low Value",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const segment = searchParams.get("segment") as CustomerSegment | null;

  if (!segment || !VALID_SEGMENTS.includes(segment)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid segment. Use: High Value, Medium Value, or Low Value",
      },
      { status: 400 }
    );
  }

  const customers = enrichCustomers(SAMPLE_CUSTOMERS).filter(
    (c) => c.segment === segment
  );

  const totalRevenue = customers.reduce((sum, c) => sum + c.revenue, 0);

  return NextResponse.json({
    success: true,
    segment,
    count: customers.length,
    totalRevenue,
    data: customers,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
