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
// POST /api/ai/chat — Proxy for OpenAI Chat Completions
// ──────────────────────────────────────────────
aiRouter.post("/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { messages, temperature, max_tokens, model } = body;

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "messages array is required" }, 400);
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages,
          temperature: temperature ?? 0.7,
          max_tokens: max_tokens ?? 500,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Chat API error:", errorText);
      return c.json({ error: "Chat completion failed" }, response.status);
    }

    const result = await response.json();
    return c.json(result);
  } catch (error) {
    console.error("Chat proxy error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ──────────────────────────────────────────────
// POST /api/ai/tts — Proxy for ElevenLabs Text-to-Speech
// ──────────────────────────────────────────────
aiRouter.post("/tts", async (c) => {
  try {
    const body = await c.req.json();
    const { text, voice_id, model_id, voice_settings } = body;

    if (!text) {
      return c.json({ error: "text is required" }, 400);
    }

    const voiceId = voice_id || "21m00Tcm4TlvDq8ikWAM"; // Rachel default
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: model_id || "eleven_flash_v2_5",
        voice_settings: voice_settings || {
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
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
