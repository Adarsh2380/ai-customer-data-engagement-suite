import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CampaignType } from "@/types/customer";

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

export function getGeminiModel() {
  return getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
}

export async function streamChatResponse(
  systemContext: string,
  userMessage: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<ReadableStream<Uint8Array>> {
  const model = getGeminiModel();

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: `You are an expert business analyst for a retail customer data platform. Analyze the following customer data and provide professional, actionable business insights. Be concise but thorough. Use specific numbers from the data when available.

${systemContext}`,
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "I understand. I have access to your customer data and I'm ready to provide professional business analysis and recommendations. What would you like to know?",
          },
        ],
      },
      ...history,
    ],
  });

  const result = await chat.sendMessageStream(userMessage);

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  promotional_email: "Promotional Email",
  loyalty_campaign: "Loyalty Campaign",
  sms_campaign: "SMS Campaign",
  re_engagement: "Re-engagement Campaign",
};

export async function generateCampaign(
  customerSummary: string,
  objective: string,
  campaignType: CampaignType,
  targetSegment?: string
): Promise<string> {
  const model = getGeminiModel();

  const prompt = `You are an expert marketing strategist. Generate a professional ${CAMPAIGN_TYPE_LABELS[campaignType]} for a retail business.

Customer Data Context:
${customerSummary}

Campaign Objective: ${objective}
Target Segment: ${targetSegment ?? "All customers"}

Respond in JSON format with these exact fields:
{
  "subject": "email subject line (for email campaigns, empty string for SMS)",
  "headline": "campaign headline",
  "body": "full marketing copy (2-3 paragraphs, professional tone)",
  "callToAction": "clear call to action text"
}

Only respond with valid JSON, no markdown or extra text.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
