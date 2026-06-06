export interface Customer {
  customer_id: string;
  customer_name: string;
  email: string;
  orders: number;
  revenue: number;
  last_purchase_date: string;
}

export type CustomerSegment = "High Value" | "Medium Value" | "Low Value";

export type ChurnRisk = "High Risk" | "Medium Risk" | "Low Risk";

export interface SegmentedCustomer extends Customer {
  segment: CustomerSegment;
  churnRisk: ChurnRisk;
  daysSinceLastPurchase: number;
}

export interface DataQualityIssue {
  id: string;
  customerId: string;
  category:
    | "duplicate"
    | "missing_value"
    | "invalid_email"
    | "invalid_revenue"
    | "empty_name";
  field: string;
  message: string;
  suggestedFix: string;
}

export interface DataQualityReport {
  issues: DataQualityIssue[];
  totalIssues: number;
  categories: Record<string, number>;
}

export interface DashboardMetrics {
  totalCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  repeatCustomers: number;
  retentionRate: number;
  churnRiskCount: number;
}

export interface SegmentStats {
  segment: CustomerSegment;
  count: number;
  revenue: number;
  percentage: number;
}

export interface ChurnStats {
  risk: ChurnRisk;
  count: number;
  percentage: number;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  customers: number;
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  duration: number;
  requestBody?: unknown;
  responseBody?: unknown;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export type CampaignType =
  | "promotional_email"
  | "loyalty_campaign"
  | "sms_campaign"
  | "re_engagement";

export interface CampaignRequest {
  objective: string;
  campaignType: CampaignType;
  targetSegment?: CustomerSegment;
}

export interface CampaignResponse {
  campaignType: CampaignType;
  objective: string;
  subject?: string;
  headline: string;
  body: string;
  callToAction: string;
  targetSegment: string;
}

export const STORAGE_KEY = "cdp-customer-data";
