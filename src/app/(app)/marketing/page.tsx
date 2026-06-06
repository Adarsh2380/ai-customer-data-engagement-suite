"use client";

import { useState } from "react";
import { Megaphone, Copy, CheckCircle2, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { useCustomersContext } from "@/components/providers/customers-provider";
import { buildCustomerSummary } from "@/lib/analytics";
import type { CampaignType, CampaignResponse } from "@/types/customer";

const CAMPAIGN_TYPES: { value: CampaignType; label: string; description: string }[] = [
  {
    value: "promotional_email",
    label: "Promotional Email",
    description: "Drive sales with targeted promotional offers",
  },
  {
    value: "loyalty_campaign",
    label: "Loyalty Campaign",
    description: "Reward and retain your best customers",
  },
  {
    value: "sms_campaign",
    label: "SMS Campaign",
    description: "Short-form mobile messaging campaigns",
  },
  {
    value: "re_engagement",
    label: "Re-engagement Campaign",
    description: "Win back inactive or at-risk customers",
  },
];

export default function MarketingPage() {
  const { customers, isLoading } = useCustomersContext();
  const [campaignType, setCampaignType] = useState<CampaignType>("promotional_email");
  const [objective, setObjective] = useState("");
  const [targetSegment, setTargetSegment] = useState<string>("All");
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaign, setCampaign] = useState<CampaignResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!objective.trim()) return;

    setIsGenerating(true);
    setError(null);
    setCampaign(null);

    try {
      const response = await fetch("/api/ai/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: objective.trim(),
          campaignType,
          targetSegment: targetSegment === "All" ? undefined : targetSegment,
          customerSummary: buildCustomerSummary(customers),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate campaign");
      }

      const data = await response.json();
      setCampaign(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!campaign) return;
    const text = [
      campaign.subject && `Subject: ${campaign.subject}`,
      `Headline: ${campaign.headline}`,
      "",
      campaign.body,
      "",
      `CTA: ${campaign.callToAction}`,
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <>
        <Navbar title="Marketing Campaign Generator" />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <Navbar
        title="Marketing Campaign Generator"
        description="AI-powered personalized marketing copy"
        badge="Gemini AI"
      />
      <div className="space-y-6 p-4 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Campaign Configuration
              </CardTitle>
              <CardDescription>
                Define your campaign objective and target audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select
                  value={campaignType}
                  onValueChange={(v) => setCampaignType(v as CampaignType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {CAMPAIGN_TYPES.find((t) => t.value === campaignType)?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Target Segment</Label>
                <Select value={targetSegment} onValueChange={setTargetSegment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Customers</SelectItem>
                    <SelectItem value="High Value">High Value</SelectItem>
                    <SelectItem value="Medium Value">Medium Value</SelectItem>
                    <SelectItem value="Low Value">Low Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Campaign Objective</Label>
                <Textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="e.g., Increase repeat purchases by 20% among high-value customers with a limited-time offer..."
                  rows={4}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!objective.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Megaphone className="mr-2 h-4 w-4" />
                    Generate Campaign
                  </>
                )}
              </Button>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Campaign</CardTitle>
                {campaign && (
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!campaign && !isGenerating && (
                <div className="flex flex-col items-center py-16 text-center">
                  <Megaphone className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    Configure your campaign and click Generate to create
                    AI-powered marketing copy.
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="flex flex-col items-center py-16">
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Crafting your campaign...
                  </p>
                </div>
              )}

              {campaign && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{campaign.campaignType.replace(/_/g, " ")}</Badge>
                    <Badge variant="secondary">{campaign.targetSegment}</Badge>
                  </div>

                  {campaign.subject && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Subject Line
                      </Label>
                      <Input
                        value={campaign.subject}
                        readOnly
                        className="mt-1 font-medium"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Headline
                    </Label>
                    <p className="mt-1 text-lg font-semibold">
                      {campaign.headline}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Body Copy
                    </Label>
                    <div className="mt-1 rounded-lg bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {campaign.body}
                    </div>
                  </div>

                  <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
                    <Label className="text-xs text-muted-foreground">
                      Call to Action
                    </Label>
                    <p className="mt-1 font-semibold text-primary">
                      {campaign.callToAction}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
