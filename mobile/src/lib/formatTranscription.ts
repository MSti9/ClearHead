/**
 * Format voice transcriptions into readable, well-structured text
 * Uses AI to add paragraph breaks, proper punctuation, and improve readability
 */

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;

export async function formatTranscription(rawText: string): Promise<string> {
  if (!rawText || rawText.trim().length === 0) {
    return rawText;
  }

  // If text is already short, no need to format
  if (rawText.trim().split(' ').length < 30) {
    return rawText;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a text formatter for journal entries. Your job is to take voice transcriptions and format them into readable, well-structured text.

Rules:
1. Break the text into natural paragraphs based on topic/thought changes
2. Add proper spacing between paragraphs (use double line breaks: \\n\\n)
3. Fix obvious grammar issues and run-on sentences
4. Keep the original meaning and words - just improve structure
5. Make it easy and pleasant to read
6. Don't add any commentary, titles, or extra content
7. Return ONLY the formatted text, nothing else
8. Preserve the conversational, personal tone
9. If there are clear topic shifts, start a new paragraph

Example input: "I've been thinking about work lately it's been really stressful my boss keeps piling on more projects and I don't know how to handle it all also I've been feeling tired all the time maybe I need a vacation or something I should probably talk to someone about this"

Example output:
I've been thinking about work lately. It's been really stressful - my boss keeps piling on more projects and I don't know how to handle it all.

Also, I've been feeling tired all the time. Maybe I need a vacation or something.

I should probably talk to someone about this.`,
          },
          {
            role: 'user',
            content: rawText,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Formatting API error:', errorText);
      return rawText; // Return original on error
    }

    const result = await response.json();
    const formattedText = result.choices[0]?.message?.content?.trim();

    if (!formattedText) {
      return rawText;
    }

    return formattedText;
  } catch (error) {
    console.error('Failed to format transcription:', error);
    return rawText; // Return original text on error
  }
}

/**
 * Simple fallback formatting without AI
 * Splits text into sentences and groups them into paragraphs
 */
export function simpleFormat(text: string): string {
  if (!text || text.trim().length === 0) {
    return text;
  }

  // Split into sentences (basic approach)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  // Group sentences into paragraphs (every 3-4 sentences)
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];

  sentences.forEach((sentence, index) => {
    currentParagraph.push(sentence.trim());

    // Start new paragraph after 3-4 sentences or if there's a topic shift
    if (
      currentParagraph.length >= 3 ||
      (index > 0 && hasTopicShift(sentences[index - 1], sentence))
    ) {
      paragraphs.push(currentParagraph.join(' '));
      currentParagraph = [];
    }
  });

  // Add remaining sentences
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(' '));
  }

  return paragraphs.join('\n\n');
}

/**
 * Detect if there's a topic shift between sentences
 */
function hasTopicShift(prev: string, current: string): boolean {
  const transitionWords = [
    'also',
    'anyway',
    'meanwhile',
    'on the other hand',
    'by the way',
    'speaking of',
    'oh and',
    'another thing',
  ];

  const currentLower = current.toLowerCase();
  return transitionWords.some((word) => currentLower.startsWith(word));
}
