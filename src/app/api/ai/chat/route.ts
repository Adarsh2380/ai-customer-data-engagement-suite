import { streamChatResponse } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { message, customerSummary, history } = await request.json();

    if (!message || !customerSummary) {
      return new Response(
        JSON.stringify({ error: "Missing message or customer data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = await streamChatResponse(
      customerSummary,
      message,
      history ?? []
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI chat failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
