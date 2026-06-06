import { NextResponse } from "next/server";

interface WebhookPayload {
  event?: string;
  url?: string;
  timestamp?: string;
  data?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const payload: WebhookPayload = await request.json();

    if (!payload.event) {
      return NextResponse.json(
        { success: false, error: "Missing required field: event" },
        { status: 400 }
      );
    }

    const processedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: "Webhook received and processed",
      received: {
        event: payload.event,
        timestamp: payload.timestamp ?? processedAt,
        data: payload.data ?? {},
      },
      processed: {
        id: `wh_${Date.now()}`,
        status: "processed",
        processedAt,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook endpoint is active",
    usage: {
      method: "POST",
      contentType: "application/json",
      body: {
        event: "string (required)",
        data: "object (optional)",
        timestamp: "string (optional)",
      },
    },
  });
}
