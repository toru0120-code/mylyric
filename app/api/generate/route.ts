import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { system, messages, maxTokens } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "APIキーが設定されていません" }, { status: 500 });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: maxTokens || 1500,
        stream: true,
        system: system,
        messages: messages,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = "APIエラーが発生しました";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {}
      return Response.json({ error: errorMessage }, { status: res.status });
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
