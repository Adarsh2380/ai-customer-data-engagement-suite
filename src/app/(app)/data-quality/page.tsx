"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Wand2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { useCustomersContext } from "@/components/providers/customers-provider";
import {
  analyzeDataQuality,
  cleanCustomerData,
  ISSUE_CATEGORY_LABELS,
} from "@/lib/data-quality";

export default function DataQualityPage() {
  const { customers, updateCustomers, isLoading } = useCustomersContext();
  const [cleaned, setCleaned] = useState(false);

  const report = useMemo(
    () => analyzeDataQuality(customers),
    [customers]
  );

  const qualityScore = useMemo(() => {
    if (customers.length === 0) return 0;
    const maxIssues = customers.length * 3;
    const score = Math.max(
      0,
      Math.round(((maxIssues - report.totalIssues) / maxIssues) * 100)
    );
    return Math.min(100, score);
  }, [customers.length, report.totalIssues]);

  const handleClean = () => {
    const cleanedData = cleanCustomerData(customers);
    updateCustomers(cleanedData);
    setCleaned(true);
    setTimeout(() => setCleaned(false), 3000);
  };

  if (isLoading) {
    return (
      <>
        <Navbar title="Data Quality Center" />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <Navbar
        title="Data Quality Center"
        description="Automated data validation and cleaning"
      />
      <div className="space-y-6 p-4 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quality Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{qualityScore}%</div>
              <Progress value={qualityScore} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {report.totalIssues}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Records Analyzed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Error Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Object.keys(report.categories).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleClean} disabled={report.totalIssues === 0}>
            <Wand2 className="mr-2 h-4 w-4" />
            One-Click Data Cleaning
          </Button>
          {cleaned && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Data cleaned successfully!
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Issue Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(ISSUE_CATEGORY_LABELS).map(([key, label]) => {
                const count = report.categories[key] ?? 0;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="text-sm">{label}</span>
                    <Badge variant={count > 0 ? "danger" : "success"}>
                      {count}
                    </Badge>
                  </div>
                );
              })}
              {report.totalIssues === 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  No data quality issues detected!
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Detected Issues & Suggested Fixes
              </CardTitle>
              <CardDescription>
                {report.totalIssues} issues found across {customers.length}{" "}
                records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.issues.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-500" />
                  <p className="text-lg font-medium">All Clear!</p>
                  <p className="text-sm text-muted-foreground">
                    Your customer data passes all quality checks.
                  </p>
                </div>
              ) : (
                <div className="max-h-[500px] space-y-3 overflow-y-auto">
                  {report.issues.slice(0, 50).map((issue) => (
                    <div
                      key={issue.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="outline">
                          {ISSUE_CATEGORY_LABELS[issue.category]}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">
                          {issue.customerId}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{issue.message}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Fix: {issue.suggestedFix}
                      </p>
                    </div>
                  ))}
                  {report.issues.length > 50 && (
                    <p className="text-center text-sm text-muted-foreground">
                      Showing 50 of {report.issues.length} issues
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
