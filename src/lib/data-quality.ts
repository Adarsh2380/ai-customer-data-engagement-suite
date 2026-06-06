import type { Customer, DataQualityIssue, DataQualityReport } from "@/types/customer";
import { generateId } from "@/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function analyzeDataQuality(customers: Customer[]): DataQualityReport {
  const issues: DataQualityIssue[] = [];
  const seenIds = new Map<string, number>();
  const seenEmails = new Map<string, number>();

  customers.forEach((customer, index) => {
    const rowNum = index + 1;

    if (!customer.customer_id?.trim()) {
      issues.push({
        id: generateId(),
        customerId: `row-${rowNum}`,
        category: "missing_value",
        field: "customer_id",
        message: `Row ${rowNum}: Missing customer ID`,
        suggestedFix: "Assign a unique customer ID",
      });
    } else {
      const idCount = (seenIds.get(customer.customer_id) ?? 0) + 1;
      seenIds.set(customer.customer_id, idCount);
      if (idCount > 1) {
        issues.push({
          id: generateId(),
          customerId: customer.customer_id,
          category: "duplicate",
          field: "customer_id",
          message: `Duplicate customer ID: ${customer.customer_id}`,
          suggestedFix: "Merge or remove duplicate records",
        });
      }
    }

    if (!customer.customer_name?.trim()) {
      issues.push({
        id: generateId(),
        customerId: customer.customer_id || `row-${rowNum}`,
        category: "empty_name",
        field: "customer_name",
        message: `Row ${rowNum}: Empty customer name`,
        suggestedFix: "Fill in customer name from email or external source",
      });
    }

    if (!customer.email?.trim()) {
      issues.push({
        id: generateId(),
        customerId: customer.customer_id || `row-${rowNum}`,
        category: "missing_value",
        field: "email",
        message: `Row ${rowNum}: Missing email address`,
        suggestedFix: "Collect email from customer profile",
      });
    } else if (!validateEmail(customer.email)) {
      issues.push({
        id: generateId(),
        customerId: customer.customer_id || `row-${rowNum}`,
        category: "invalid_email",
        field: "email",
        message: `Invalid email format: ${customer.email}`,
        suggestedFix: "Correct email format to name@domain.com",
      });
    } else {
      const emailKey = customer.email.toLowerCase();
      const emailCount = (seenEmails.get(emailKey) ?? 0) + 1;
      seenEmails.set(emailKey, emailCount);
      if (emailCount > 1) {
        issues.push({
          id: generateId(),
          customerId: customer.customer_id,
          category: "duplicate",
          field: "email",
          message: `Duplicate email: ${customer.email}`,
          suggestedFix: "Merge duplicate accounts or update email",
        });
      }
    }

    if (
      customer.revenue === null ||
      customer.revenue === undefined ||
      isNaN(Number(customer.revenue)) ||
      Number(customer.revenue) < 0
    ) {
      issues.push({
        id: generateId(),
        customerId: customer.customer_id || `row-${rowNum}`,
        category: "invalid_revenue",
        field: "revenue",
        message: `Invalid revenue value: ${customer.revenue}`,
        suggestedFix: "Set revenue to a valid non-negative number",
      });
    }

    if (
      customer.orders === null ||
      customer.orders === undefined ||
      isNaN(Number(customer.orders)) ||
      Number(customer.orders) < 0
    ) {
      issues.push({
        id: generateId(),
        customerId: customer.customer_id || `row-${rowNum}`,
        category: "missing_value",
        field: "orders",
        message: `Invalid order count: ${customer.orders}`,
        suggestedFix: "Set orders to a valid non-negative integer",
      });
    }
  });

  const categories: Record<string, number> = {};
  issues.forEach((issue) => {
    categories[issue.category] = (categories[issue.category] ?? 0) + 1;
  });

  return {
    issues,
    totalIssues: issues.length,
    categories,
  };
}

export function cleanCustomerData(customers: Customer[]): Customer[] {
  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();
  const cleaned: Customer[] = [];

  for (const customer of customers) {
    if (!customer.customer_id?.trim()) continue;
    if (seenIds.has(customer.customer_id)) continue;

    const email = customer.email?.trim().toLowerCase() ?? "";
    if (email && seenEmails.has(email)) continue;

    const name = customer.customer_name?.trim();
    if (!name) continue;

    const revenue = Number(customer.revenue);
    if (isNaN(revenue) || revenue < 0) continue;

    const orders = Number(customer.orders);
    if (isNaN(orders) || orders < 0) continue;

    if (email && !validateEmail(email)) continue;

    seenIds.add(customer.customer_id);
    if (email) seenEmails.add(email);

    cleaned.push({
      customer_id: customer.customer_id.trim(),
      customer_name: name,
      email: email || `${customer.customer_id}@placeholder.com`,
      orders: Math.round(orders),
      revenue: Math.round(revenue * 100) / 100,
      last_purchase_date: customer.last_purchase_date || new Date().toISOString().split("T")[0],
    });
  }

  return cleaned;
}

export const ISSUE_CATEGORY_LABELS: Record<string, string> = {
  duplicate: "Duplicate Records",
  missing_value: "Missing Values",
  invalid_email: "Invalid Emails",
  invalid_revenue: "Invalid Revenue",
  empty_name: "Empty Customer Names",
};
