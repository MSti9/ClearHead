import { Hono } from "hono";

const aiRouter = new Hono();

// ──────────────────────────────────────────────
// POST /api/ai/transcribe — Proxy for OpenAI Whisper
// ──────────────────────────────────────────────
aiRouter.post("/transcribe", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No audio file provided" }, 400);
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "gpt-4o-mini-transcribe");
    formData.append("response_format", "json");

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Transcription API error:", errorText);
      return c.json({ error: "Transcription failed" }, response.status);
    }

    const result = await response.json();
    return c.json(result);
  } catch (error) {
    console.error("Transcription proxy error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ──────────────────────────────────────────────
// POST /api/ai/chat — Proxy for Anthropic Claude Sonnet 4.5
// ──────────────────────────────────────────────
aiRouter.post("/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { messages, temperature, max_tokens } = body;

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "messages array is required" }, 400);
    }

    // Extract system message (Anthropic uses a separate "system" field)
    let system: string | undefined;
    const anthropicMessages: { role: string; content: string }[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        system = msg.content;
      } else {
        anthropicMessages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        });
      }
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: max_tokens ?? 500,
        temperature: temperature ?? 0.7,
        ...(system ? { system } : {}),
        messages: anthropicMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return c.json({ error: "Chat completion failed" }, response.status);
    }

    const result = await response.json();

    // Normalize to OpenAI-compatible format so the mobile client doesn't need changes
    const content =
      result.content?.[0]?.type === "text" ? result.content[0].text : null;

    return c.json({
      choices: [{ message: { content } }],
    });
  } catch (error) {
    console.error("Chat proxy error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ──────────────────────────────────────────────
// POST /api/ai/tts — Proxy for OpenAI Text-to-Speech
// ──────────────────────────────────────────────
aiRouter.post("/tts", async (c) => {
  try {
    const body = await c.req.json();
    const { text, voice } = body;

    if (!text) {
      return c.json({ error: "text is required" }, 400);
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice || "nova", // nova: warm, friendly female voice
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS API error:", errorText);
      return c.json({ error: "Text-to-speech failed" }, response.status);
    }

    // Return the audio as binary
    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("TTS proxy error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { aiRouter };
