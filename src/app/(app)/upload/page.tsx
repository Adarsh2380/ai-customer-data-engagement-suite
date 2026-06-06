"use client";

import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useCustomersContext } from "@/components/providers/customers-provider";
import { parseCSV } from "@/lib/csv-parser";
import { customersToCSV } from "@/lib/sample-data";
import { formatNumber, formatCurrency } from "@/lib/utils";

export default function UploadPage() {
  const { customers, updateCustomers, resetToSample, isUsingSample } =
    useCustomersContext();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".csv")) {
        setUploadStatus({ type: "error", message: "Please upload a CSV file." });
        return;
      }

      setIsUploading(true);
      setUploadStatus(null);

      try {
        const result = await parseCSV(file);
        if (!result.success || result.data.length === 0) {
          setUploadStatus({
            type: "error",
            message: result.errors.join("; ") || "Failed to parse CSV file.",
          });
          return;
        }

        updateCustomers(result.data);
        setUploadStatus({
          type: "success",
          message: `Successfully imported ${result.data.length} customer records.`,
        });
      } catch {
        setUploadStatus({
          type: "error",
          message: "An unexpected error occurred while parsing the file.",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [updateCustomers]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDownloadSample = () => {
    const csv = customersToCSV(customers);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar
        title="Customer Data Upload"
        description="Import customer datasets via CSV for analysis"
        badge={isUsingSample ? "Sample Data" : "Custom Data"}
      />
      <div className="space-y-6 p-4 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Required columns: customer_id, customer_name, email, orders,
                revenue, last_purchase_date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                <p className="mb-2 text-lg font-medium">
                  Drag & drop your CSV file here
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  or click to browse from your computer
                </p>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="csv-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                <Button
                  disabled={isUploading}
                  type="button"
                  onClick={() => document.getElementById("csv-upload")?.click()}
                >
                  {isUploading ? "Uploading..." : "Select CSV File"}
                </Button>
              </div>

              {uploadStatus && (
                <div
                  className={`mt-4 flex items-center gap-2 rounded-lg p-4 text-sm ${
                    uploadStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {uploadStatus.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {uploadStatus.message}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Dataset</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Records</span>
                  <span className="font-semibold">
                    {formatNumber(customers.length)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Source</span>
                  <Badge variant={isUsingSample ? "secondary" : "success"}>
                    {isUsingSample ? "Sample" : "Uploaded"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Revenue
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(
                      customers.reduce((s, c) => s + c.revenue, 0)
                    )}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = "/sample-customers.csv";
                    a.download = "sample-customers.csv";
                    a.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Sample CSV
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownloadSample}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Current Data
                </Button>
                {!isUsingSample && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={resetToSample}
                  >
                    Reset to Sample Data
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Expected Format</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted p-3 font-mono text-xs">
                  customer_id,customer_name,email,orders,revenue,last_purchase_date
                  <br />
                  CUST-0001,John Smith,john@email.com,12,8500,2025-03-15
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {customers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Data Preview
              </CardTitle>
              <CardDescription>
                Showing first 10 records from your dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">ID</th>
                      <th className="pb-3 pr-4 font-medium">Name</th>
                      <th className="pb-3 pr-4 font-medium">Email</th>
                      <th className="pb-3 pr-4 font-medium">Orders</th>
                      <th className="pb-3 pr-4 font-medium">Revenue</th>
                      <th className="pb-3 font-medium">Last Purchase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.slice(0, 10).map((c) => (
                      <tr key={c.customer_id} className="border-b last:border-0">
                        <td className="py-2.5 pr-4 font-mono text-xs">
                          {c.customer_id}
                        </td>
                        <td className="py-2.5 pr-4">{c.customer_name}</td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {c.email}
                        </td>
                        <td className="py-2.5 pr-4">{c.orders}</td>
                        <td className="py-2.5 pr-4">
                          {formatCurrency(c.revenue)}
                        </td>
                        <td className="py-2.5">{c.last_purchase_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {customers.length === 0 && (
          <EmptyState
            icon={Upload}
            title="No customer data"
            description="Upload a CSV file or use the sample dataset to get started with analysis."
          />
        )}
      </div>
    </>
  );
}
