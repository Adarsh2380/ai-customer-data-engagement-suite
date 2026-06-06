import type { Customer } from "@/types/customer";
import { STORAGE_KEY } from "@/types/customer";
import { SAMPLE_CUSTOMERS } from "@/lib/sample-data";

export function getStoredCustomers(): Customer[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Customer[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCustomers(customers: Customer[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function clearStoredCustomers(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getDefaultCustomers(): Customer[] {
  return SAMPLE_CUSTOMERS;
}

export function loadCustomers(): Customer[] {
  return getStoredCustomers() ?? getDefaultCustomers();
}
