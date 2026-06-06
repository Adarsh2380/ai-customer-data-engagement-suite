"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { useCustomersContext } from "@/components/providers/customers-provider";
import { buildCustomerSummary } from "@/lib/analytics";
import { generateId } from "@/lib/utils";
import type { ChatMessage } from "@/types/customer";

const SUGGESTED_PROMPTS = [
  "Who are my top customers?",
  "Which segment generates most revenue?",
  "Which customers may churn?",
  "What trends do you observe?",
  "What business actions should I take?",
];

export default function AIAnalystPage() {
  const { customers, isLoading } = useCustomersContext();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI Business Analyst. I have access to your customer data and can help you uncover insights, identify trends, and recommend strategic actions. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    const assistantId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: m.content }],
        }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          customerSummary: buildCustomerSummary(customers),
          history,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            )
          );
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "I apologize, but I encountered an error analyzing your data. Please ensure your GEMINI_API_KEY is configured and try again.",
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar title="AI Business Analyst" />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <Navbar
        title="AI Business Analyst"
        description="Gemini-powered customer intelligence and recommendations"
        badge="Gemini AI"
      />
      <div className="flex h-[calc(100vh-4rem)] flex-col p-4 lg:p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              onClick={() => sendMessage(prompt)}
              disabled={isStreaming}
            >
              <Sparkles className="mr-1 h-3 w-3" />
              {prompt}
            </Button>
          ))}
        </div>

        <Card className="flex flex-1 flex-col overflow-hidden">
          <CardHeader className="border-b py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-5 w-5 text-primary" />
              Business Analysis Chat
              <Badge variant="secondary" className="ml-auto">
                {customers.length} customers loaded
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.content === "" && isStreaming && (
                        <span className="inline-flex gap-1">
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce delay-100">.</span>
                          <span className="animate-bounce delay-200">.</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex gap-2"
              >
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your customer data..."
                  className="min-h-[44px] resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  disabled={isStreaming}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isStreaming}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
