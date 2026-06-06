"use client";

import { useState } from "react";
import {
  Terminal,
  Send,
  Trash2,
  Webhook,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCustomersContext } from "@/components/providers/customers-provider";
import { generateId } from "@/lib/utils";
import type { ApiLogEntry } from "@/types/customer";

const ENDPOINTS = [
  { value: "/api/customers", label: "GET /api/customers", method: "GET" },
  { value: "/api/metrics", label: "GET /api/metrics", method: "GET" },
  { value: "/api/customers/segment", label: "GET /api/customers/segment?segment=High Value", method: "GET" },
  { value: "/api/customers/churn", label: "GET /api/customers/churn?risk=High Risk", method: "GET" },
  { value: "/api/webhook", label: "POST /api/webhook", method: "POST" },
];

export default function ApiPlaygroundPage() {
  const { customers } = useCustomersContext();
  const [endpoint, setEndpoint] = useState("/api/customers");
  const [method, setMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        event: "customer.updated",
        data: { customer_id: "CUST-0001", action: "purchase" },
      },
      null,
      2
    )
  );
  const [response, setResponse] = useState<string>("");
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookResult, setWebhookResult] = useState<string>("");

  const sendRequest = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
      };

      if (method === "POST" && endpoint === "/api/webhook") {
        options.body = requestBody;
      }

      if (method === "GET" && endpoint.includes("/api/customers")) {
        if (endpoint.includes("segment")) {
          const res = await fetch("/api/customers/segment?segment=High%20Value");
          const data = await res.json();
          setResponse(JSON.stringify(data, null, 2));
          setResponseStatus(res.status);
          addLog("GET", "/api/customers/segment?segment=High Value", res.status, Date.now() - startTime, undefined, data);
          setIsLoading(false);
          return;
        }
        if (endpoint.includes("churn")) {
          const res = await fetch("/api/customers/churn?risk=High%20Risk");
          const data = await res.json();
          setResponse(JSON.stringify(data, null, 2));
          setResponseStatus(res.status);
          addLog("GET", "/api/customers/churn?risk=High Risk", res.status, Date.now() - startTime, undefined, data);
          setIsLoading(false);
          return;
        }
      }

      const url = endpoint.startsWith("/api/webhook") ? "/api/webhook" : endpoint;
      const res = await fetch(url, options);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setResponseStatus(res.status);

      addLog(
        method,
        url,
        res.status,
        Date.now() - startTime,
        method === "POST" ? JSON.parse(requestBody) : undefined,
        data
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Request failed";
      setResponse(JSON.stringify({ error: errorMsg }, null, 2));
      setResponseStatus(500);
      addLog(method, endpoint, 500, Date.now() - startTime);
    } finally {
      setIsLoading(false);
    }
  };

  const addLog = (
    method: string,
    endpoint: string,
    status: number,
    duration: number,
    requestBody?: unknown,
    responseBody?: unknown
  ) => {
    const entry: ApiLogEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      status,
      duration,
      requestBody,
      responseBody,
    };
    setLogs((prev) => [entry, ...prev].slice(0, 20));
  };

  const testWebhook = async () => {
    setIsLoading(true);
    try {
      const payload = {
        event: "webhook.test",
        url: webhookUrl || "internal",
        timestamp: new Date().toISOString(),
        data: {
          message: "Test webhook from API Playground",
          customerCount: customers.length,
        },
      };

      const res = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setWebhookResult(JSON.stringify(data, null, 2));
      addLog("POST", "/api/webhook (test)", res.status, 0, payload, data);
    } catch (err) {
      setWebhookResult(
        JSON.stringify(
          { error: err instanceof Error ? err.message : "Webhook test failed" },
          null,
          2
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar
        title="API Playground"
        description="Test and explore the CDP REST API"
        badge="Developer"
      />
      <div className="space-y-6 p-4 lg:p-8">
        <Tabs defaultValue="request">
          <TabsList>
            <TabsTrigger value="request">
              <Send className="mr-1 h-4 w-4" />
              Send Request
            </TabsTrigger>
            <TabsTrigger value="webhook">
              <Webhook className="mr-1 h-4 w-4" />
              Test Webhooks
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Clock className="mr-1 h-4 w-4" />
              Request Logs ({logs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Request Builder
                  </CardTitle>
                  <CardDescription>
                    Select an endpoint and send API requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Endpoint</Label>
                    <Select
                      value={endpoint}
                      onValueChange={(v) => {
                        setEndpoint(v);
                        const ep = ENDPOINTS.find((e) => e.value === v);
                        if (ep) setMethod(ep.method);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENDPOINTS.map((ep) => (
                          <SelectItem key={ep.value} value={ep.value}>
                            {ep.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Method</Label>
                      <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Base URL</Label>
                      <Input value="http://localhost:3000" readOnly />
                    </div>
                  </div>

                  {method === "POST" && (
                    <div className="space-y-2">
                      <Label>Request Body (JSON)</Label>
                      <Textarea
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        rows={8}
                        className="font-mono text-xs"
                      />
                    </div>
                  )}

                  <Button
                    onClick={sendRequest}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isLoading ? "Sending..." : "Send Request"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Response</CardTitle>
                    {responseStatus !== null && (
                      <Badge
                        variant={
                          responseStatus >= 200 && responseStatus < 300
                            ? "success"
                            : "danger"
                        }
                      >
                        {responseStatus}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {response ? (
                    <pre className="max-h-[500px] overflow-auto rounded-lg bg-muted p-4 font-mono text-xs">
                      {response}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center py-16 text-center">
                      <Terminal className="mb-4 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Send a request to see the JSON response here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="webhook" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Webhook Tester
                  </CardTitle>
                  <CardDescription>
                    Simulate webhook events to test integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Webhook URL (optional)</Label>
                    <Input
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-app.com/webhooks/cdp"
                    />
                  </div>
                  <Button
                    onClick={testWebhook}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Webhook className="mr-2 h-4 w-4" />
                    Send Test Webhook
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Webhook Response</CardTitle>
                </CardHeader>
                <CardContent>
                  {webhookResult ? (
                    <pre className="max-h-[300px] overflow-auto rounded-lg bg-muted p-4 font-mono text-xs">
                      {webhookResult}
                    </pre>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">
                      Webhook response will appear here.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Request Logs</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogs([])}
                    disabled={logs.length === 0}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Clear Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No requests logged yet. Send a request to start logging.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-lg border p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{log.method}</Badge>
                            <code className="text-sm">{log.endpoint}</code>
                          </div>
                          <div className="flex items-center gap-2">
                            {log.status >= 200 && log.status < 300 ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <Badge
                              variant={
                                log.status >= 200 && log.status < 300
                                  ? "success"
                                  : "danger"
                              }
                            >
                              {log.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {log.duration}ms
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 font-mono text-sm">
              <div className="rounded-lg border p-4">
                <p className="font-semibold">GET /api/customers</p>
                <p className="text-muted-foreground">
                  Returns all customer records with pagination support.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-semibold">GET /api/metrics</p>
                <p className="text-muted-foreground">
                  Returns dashboard metrics, segment stats, and churn analysis.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-semibold">
                  GET /api/customers/segment?segment=High Value
                </p>
                <p className="text-muted-foreground">
                  Filter customers by segment (High Value, Medium Value, Low
                  Value).
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-semibold">
                  GET /api/customers/churn?risk=High Risk
                </p>
                <p className="text-muted-foreground">
                  Filter customers by churn risk level.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-semibold">POST /api/webhook</p>
                <p className="text-muted-foreground">
                  Receive and process webhook events from external systems.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
