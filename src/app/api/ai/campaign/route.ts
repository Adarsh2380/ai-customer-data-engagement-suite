import { NextResponse } from "next/server";
import { generateCampaign } from "@/lib/gemini";
import type { CampaignType } from "@/types/customer";

export async function POST(request: Request) {
  try {
    const { objective, campaignType, targetSegment, customerSummary } =
      await request.json();

    if (!objective || !campaignType || !customerSummary) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const rawResponse = await generateCampaign(
      customerSummary,
      objective,
      campaignType as CampaignType,
      targetSegment
    );

    let parsed: {
      subject?: string;
      headline?: string;
      body?: string;
      callToAction?: string;
    };
    try {
      const cleaned = rawResponse
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleaned) as typeof parsed;
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaignType,
      objective,
      subject: parsed.subject ?? "",
      headline: parsed.headline ?? "",
      body: parsed.body ?? "",
      callToAction: parsed.callToAction ?? "",
      targetSegment: targetSegment ?? "All Customers",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Campaign generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
