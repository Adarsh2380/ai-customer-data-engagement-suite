import Papa from "papaparse";
import type { Customer } from "@/types/customer";

const REQUIRED_COLUMNS = [
  "customer_id",
  "customer_name",
  "email",
  "orders",
  "revenue",
  "last_purchase_date",
];

export interface ParseResult {
  success: boolean;
  data: Customer[];
  errors: string[];
}

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const errors: string[] = [];

        if (results.errors.length > 0) {
          results.errors.forEach((err) => {
            errors.push(err.message);
          });
        }

        const headers = results.meta.fields ?? [];
        const missingColumns = REQUIRED_COLUMNS.filter(
          (col) => !headers.includes(col)
        );

        if (missingColumns.length > 0) {
          resolve({
            success: false,
            data: [],
            errors: [
              `Missing required columns: ${missingColumns.join(", ")}`,
              ...errors,
            ],
          });
          return;
        }

        const data: Customer[] = results.data
          .filter((row) => Object.values(row).some((v) => v?.trim()))
          .map((row) => ({
            customer_id: row.customer_id?.trim() ?? "",
            customer_name: row.customer_name?.trim() ?? "",
            email: row.email?.trim() ?? "",
            orders: parseInt(row.orders ?? "0", 10) || 0,
            revenue: parseFloat(row.revenue ?? "0") || 0,
            last_purchase_date: row.last_purchase_date?.trim() ?? "",
          }));

        resolve({
          success: true,
          data,
          errors,
        });
      },
      error: (error) => {
        resolve({
          success: false,
          data: [],
          errors: [error.message],
        });
      },
    });
  });
}

export function parseCSVString(csv: string): ParseResult {
  const results = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  const errors: string[] = results.errors.map((e) => e.message);
  const headers = results.meta.fields ?? [];
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !headers.includes(col)
  );

  if (missingColumns.length > 0) {
    return {
      success: false,
      data: [],
      errors: [`Missing required columns: ${missingColumns.join(", ")}`, ...errors],
    };
  }

  const data: Customer[] = results.data
    .filter((row) => Object.values(row).some((v) => v?.trim()))
    .map((row) => ({
      customer_id: row.customer_id?.trim() ?? "",
      customer_name: row.customer_name?.trim() ?? "",
      email: row.email?.trim() ?? "",
      orders: parseInt(row.orders ?? "0", 10) || 0,
      revenue: parseFloat(row.revenue ?? "0") || 0,
      last_purchase_date: row.last_purchase_date?.trim() ?? "",
    }));

  return { success: true, data, errors };
}
