import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY is not set. /api/generate will return an error.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, messages } = body;

    if (!prompt && !messages) {
      return NextResponse.json({ error: "プロンプトまたはメッセージ履歴が指定されていません。" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured on server." }, { status: 500 });
    }

    // messagesがあれば履歴ごと（role変換：ai→model、user→user）
    const contents = messages
      ? messages.map((m: { role: string; text: string }) => ({
          role: m.role === "ai" ? "model" : "user",
          parts: [{ text: m.text }],
        }))
      : [{ role: "user", parts: [{ text: prompt }] }];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    return NextResponse.json({ text: response.text });
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
