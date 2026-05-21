import { Hono } from "hono";
import { z } from "zod";

const aiRouter = new Hono();

// ──────────────────────────────────────────────
// Mode 1 reflection contract
// ──────────────────────────────────────────────
const reflectionSchema = z.object({
  what_you_said: z.string().min(1),
  whats_underneath: z.string().min(1),
  let_go_of: z.string().min(1).nullable(),
  support_message: z.string().min(1).nullable(),
  safety_flag: z.boolean(),
});

type Reflection = z.infer<typeof reflectionSchema>;

const reflectRequestSchema = z.object({
  dump: z.string().trim().min(1).max(20000),
});

const MODE_1_SYSTEM_PROMPT = `Turn a one-pass brain dump into a clean 3-part reflection. Return ONLY this JSON, no preamble: { "what_you_said": string, "whats_underneath": string, "let_go_of": string|null, "support_message": string|null, "safety_flag": boolean }.

- what_you_said: their dump cleaned up — clear, tight, 1–3 sentences. Words untangled, nothing added. Don't fold their emotional state in here.
- whats_underneath: one plain sentence naming the real thing they're circling. Bounded to what they SAID — name it plainly, never diagnose who they ARE.
- let_go_of: one short grounding line to put down. Grounding, not advice. Never "you should," never a fix, never clinical.

Tone: light, dry, steady. Warm not tender, calm not somber, blunt without cold. Meet their intensity, then lift — never heavier than what they brought in.

Never: ask questions, pathologize, flatter identity ("you're the strong one"), moralize, add tasks, or sound like a therapist.

SAFETY OVERRIDE: if the dump signals self-harm, suicidal intent, abuse, or intent to harm someone — set safety_flag true and let_go_of null. Put a brief, plain acknowledgment in whats_underneath (don't mirror dark phrasing back) and a functional line in support_message: "Please reach out now. In the US, call or text 988. If you might be in immediate danger, call emergency services." Don't minimize, don't be breezy, don't promise confidentiality.

For non-safety responses, set safety_flag false and support_message null.`;

// Strip ```json fences and stray prose around a JSON object.
function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced && fenced[1]) return fenced[1].trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

async function callClaudeForReflection(dump: string): Promise<
  { ok: true; data: Reflection } | { ok: false; reason: string; raw?: string }
> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 600,
      temperature: 0.5,
      system: MODE_1_SYSTEM_PROMPT,
      messages: [{ role: "user", content: dump }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return { ok: false, reason: `claude_http_${response.status}: ${errText.slice(0, 200)}` };
  }

  const result = await response.json();
  const raw = result.content?.[0]?.type === "text" ? result.content[0].text : null;
  if (!raw) {
    return { ok: false, reason: "claude_no_text_content" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch (err) {
    return { ok: false, reason: `json_parse_error: ${(err as Error).message}`, raw };
  }

  const validated = reflectionSchema.safeParse(parsed);
  if (!validated.success) {
    return { ok: false, reason: `schema_error: ${validated.error.message}`, raw };
  }

  // Enforce the safety invariant: if safety_flag true, let_go_of must be null and support_message must be set.
  if (validated.data.safety_flag) {
    if (validated.data.let_go_of !== null) {
      return { ok: false, reason: "safety_invariant: let_go_of must be null when safety_flag is true", raw };
    }
    if (!validated.data.support_message) {
      return { ok: false, reason: "safety_invariant: support_message required when safety_flag is true", raw };
    }
  }

  return { ok: true, data: validated.data };
}

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

// ──────────────────────────────────────────────
// POST /api/ai/reflect — Mode 1 hero loop. Takes a one-pass brain dump
// (text typed by the user OR a Whisper transcript), returns the
// 5-field reflection contract. Validated by Zod; one retry on parse
// or schema failure.
// ──────────────────────────────────────────────
aiRouter.post("/reflect", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json_body" }, 400);
  }

  const parsedReq = reflectRequestSchema.safeParse(body);
  if (!parsedReq.success) {
    return c.json(
      { error: "invalid_request", details: parsedReq.error.flatten() },
      400
    );
  }

  const { dump } = parsedReq.data;

  try {
    let attempt = await callClaudeForReflection(dump);

    if (!attempt.ok) {
      console.warn("Reflection first attempt failed:", attempt.reason);
      attempt = await callClaudeForReflection(dump);
    }

    if (!attempt.ok) {
      console.error("Reflection retry failed:", attempt.reason);
      return c.json(
        { error: "reflection_failed", reason: attempt.reason },
        502
      );
    }

    return c.json(attempt.data);
  } catch (err) {
    console.error("Reflection unexpected error:", err);
    return c.json({ error: "internal_server_error" }, 500);
  }
});

export { aiRouter };
