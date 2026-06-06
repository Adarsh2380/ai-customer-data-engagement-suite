import { NextResponse } from "next/server";
import { SAMPLE_CUSTOMERS } from "@/lib/sample-data";
import { enrichCustomers } from "@/lib/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const segment = searchParams.get("segment");

  let customers = enrichCustomers(SAMPLE_CUSTOMERS);

  if (segment) {
    customers = customers.filter((c) => c.segment === segment);
  }

  const start = (page - 1) * limit;
  const paginated = customers.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: paginated,
    pagination: {
      page,
      limit,
      total: customers.length,
      totalPages: Math.ceil(customers.length / limit),
    },
    meta: {
      timestamp: new Date().toISOString(),
      source: "sample_dataset",
    },
  });
}
