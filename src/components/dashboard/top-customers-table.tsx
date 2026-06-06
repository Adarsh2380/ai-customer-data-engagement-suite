"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SegmentedCustomer } from "@/types/customer";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TopCustomersTableProps {
  customers: SegmentedCustomer[];
}

function getSegmentVariant(segment: string) {
  switch (segment) {
    case "High Value":
      return "success" as const;
    case "Medium Value":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

export function TopCustomersTable({ customers }: TopCustomersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Customer</th>
                <th className="pb-3 pr-4 font-medium">Revenue</th>
                <th className="pb-3 pr-4 font-medium">Orders</th>
                <th className="pb-3 pr-4 font-medium">Segment</th>
                <th className="pb-3 font-medium">Last Purchase</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr key={customer.customer_id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{customer.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-medium">
                    {formatCurrency(customer.revenue)}
                  </td>
                  <td className="py-3 pr-4">{customer.orders}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={getSegmentVariant(customer.segment)}>
                      {customer.segment}
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {formatDate(customer.last_purchase_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
