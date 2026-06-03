import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { system, messages, maxTokens } = await req.json();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-６",
        max_tokens: maxTokens || 1500,
        stream: true,
        system,
        messages,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      return Response.json({ error: error.error?.message || "エラーが発生しました" }, { status: res.status });
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "エラーが発生しました" },
      { status: 500 }
    );
  }
}
