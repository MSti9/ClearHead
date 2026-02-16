/**
 * API client for communicating with the ClearHead backend.
 * All AI API calls are proxied through the backend so that
 * API keys are never exposed in the client bundle.
 *
 * Backend providers:
 *  - Chat completions: Anthropic Claude Sonnet 4.5
 *  - Transcription: OpenAI Whisper
 *  - Text-to-speech: OpenAI TTS
 */

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

/**
 * Proxy a chat completion request through the backend.
 */
export async function chatCompletion(params: {
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
}): Promise<{ content: string | null }> {
  const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`);
  }

  const data = await response.json();
  return { content: data.choices?.[0]?.message?.content ?? null };
}

/**
 * Proxy a transcription request through the backend.
 */
export async function transcribeAudio(uri: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as unknown as Blob);

  const response = await fetch(`${BACKEND_URL}/api/ai/transcribe`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Transcription error:', errorText);
    throw new Error('Transcription failed');
  }

  const result = await response.json();
  return result.text;
}

/**
 * Proxy a text-to-speech request through the backend (OpenAI TTS).
 * Returns the audio as a blob.
 */
export async function textToSpeech(params: {
  text: string;
  voice?: string;
}): Promise<Blob> {
  const response = await fetch(`${BACKEND_URL}/api/ai/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  return response.blob();
}
