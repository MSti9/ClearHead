import type { JournalEntry } from '@/stores/journalStore';

// Predefined tag categories with associated keywords
const TAG_KEYWORDS: Record<string, string[]> = {
  work: ['work', 'job', 'office', 'boss', 'colleague', 'meeting', 'project', 'deadline', 'career', 'promotion', 'salary', 'coworker', 'employee', 'manager', 'business', 'client', 'professional'],
  family: ['family', 'mom', 'dad', 'mother', 'father', 'parent', 'sibling', 'brother', 'sister', 'child', 'children', 'kid', 'son', 'daughter', 'husband', 'wife', 'spouse', 'grandparent', 'grandmother', 'grandfather', 'aunt', 'uncle', 'cousin'],
  relationships: ['friend', 'friendship', 'partner', 'relationship', 'dating', 'love', 'breakup', 'marriage', 'together', 'connection', 'bond', 'trust'],
  health: ['health', 'exercise', 'workout', 'gym', 'sleep', 'tired', 'energy', 'sick', 'doctor', 'medicine', 'diet', 'weight', 'body', 'pain', 'headache', 'rest', 'fitness', 'running', 'walk'],
  stress: ['stress', 'anxious', 'anxiety', 'worried', 'worry', 'overwhelmed', 'pressure', 'nervous', 'panic', 'fear', 'scared', 'tension', 'burnout', 'exhausted', 'frustrated', 'frustration'],
  grief: ['grief', 'loss', 'miss', 'missing', 'passed', 'death', 'died', 'mourn', 'funeral', 'gone', 'remember', 'memorial'],
  joy: ['happy', 'happiness', 'joy', 'joyful', 'excited', 'excitement', 'amazing', 'wonderful', 'fantastic', 'great', 'celebrate', 'celebration', 'fun', 'laugh', 'smile', 'blessed'],
  gratitude: ['grateful', 'gratitude', 'thankful', 'appreciate', 'appreciation', 'blessed', 'lucky', 'fortunate', 'thanks'],
  growth: ['growth', 'learn', 'learning', 'improve', 'improvement', 'progress', 'goal', 'goals', 'achieve', 'achievement', 'success', 'better', 'change', 'changing', 'develop'],
  money: ['money', 'financial', 'finances', 'budget', 'debt', 'savings', 'expense', 'income', 'bills', 'pay', 'afford', 'cost', 'investment'],
  faith: ['faith', 'god', 'pray', 'prayer', 'church', 'spiritual', 'believe', 'belief', 'soul', 'blessing', 'worship', 'meditation', 'meditate', 'mindful'],
  creativity: ['creative', 'creativity', 'art', 'write', 'writing', 'music', 'paint', 'draw', 'design', 'create', 'imagine', 'inspiration', 'inspired', 'idea', 'ideas'],
};

// Emotion keywords for sentiment
const EMOTION_KEYWORDS: Record<string, string[]> = {
  positive: ['happy', 'joy', 'love', 'grateful', 'excited', 'hopeful', 'proud', 'calm', 'peaceful', 'content', 'amazing', 'wonderful', 'great', 'good', 'better', 'best', 'smile', 'laugh', 'fun'],
  negative: ['sad', 'angry', 'frustrated', 'anxious', 'worried', 'stressed', 'upset', 'hurt', 'lonely', 'scared', 'afraid', 'tired', 'exhausted', 'overwhelmed', 'disappointed', 'annoyed', 'irritated'],
  neutral: ['okay', 'fine', 'normal', 'usual', 'regular', 'same', 'nothing', 'meh'],
};

export interface EntryTags {
  themes: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
}

/**
 * Extract tags from entry content using keyword matching
 */
export function extractTagsFromContent(content: string): EntryTags {
  const lowerContent = content.toLowerCase();
  const words = lowerContent.split(/\W+/);

  // Find matching themes
  const themes: string[] = [];
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    const hasMatch = keywords.some((keyword) => {
      // Check for whole word match
      return words.includes(keyword) || lowerContent.includes(keyword);
    });
    if (hasMatch) {
      themes.push(tag);
    }
  }

  // Determine sentiment
  let positiveCount = 0;
  let negativeCount = 0;

  for (const keyword of EMOTION_KEYWORDS.positive) {
    if (words.includes(keyword) || lowerContent.includes(keyword)) {
      positiveCount++;
    }
  }

  for (const keyword of EMOTION_KEYWORDS.negative) {
    if (words.includes(keyword) || lowerContent.includes(keyword)) {
      negativeCount++;
    }
  }

  let sentiment: EntryTags['sentiment'] = 'neutral';
  if (positiveCount > 0 && negativeCount > 0) {
    sentiment = 'mixed';
  } else if (positiveCount > negativeCount) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
  }

  return { themes, sentiment };
}

/**
 * Use AI to extract more nuanced tags (optional enhancement)
 */
export async function extractTagsWithAI(content: string): Promise<EntryTags> {
  // First get basic tags from keywords
  const basicTags = extractTagsFromContent(content);

  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
  if (!apiKey || content.length < 50) {
    return basicTags;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You analyze journal entries and extract theme tags. Return ONLY valid JSON.
Available themes: work, family, relationships, health, stress, grief, joy, gratitude, growth, money, faith, creativity
Sentiment options: positive, negative, neutral, mixed`,
          },
          {
            role: 'user',
            content: `Analyze this journal entry and return JSON with themes array and sentiment:

"${content.substring(0, 500)}"

Return format: {"themes": ["tag1", "tag2"], "sentiment": "positive|negative|neutral|mixed"}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const result = data.choices?.[0]?.message?.content?.trim();
      if (result) {
        const parsed = JSON.parse(result);
        return {
          themes: parsed.themes || basicTags.themes,
          sentiment: parsed.sentiment || basicTags.sentiment,
        };
      }
    }
  } catch {
    // Fall back to basic tags
  }

  return basicTags;
}

/**
 * Get all unique tags from entries
 */
export function getAllTags(entries: JournalEntry[]): string[] {
  const tagSet = new Set<string>();

  for (const entry of entries) {
    if (entry.tags) {
      for (const tag of entry.tags) {
        tagSet.add(tag);
      }
    }
  }

  return Array.from(tagSet).sort();
}

/**
 * Filter entries by tag
 */
export function filterEntriesByTag(entries: JournalEntry[], tag: string): JournalEntry[] {
  return entries.filter((entry) => entry.tags?.includes(tag));
}

/**
 * Get tag statistics
 */
export function getTagStats(entries: JournalEntry[]): Record<string, number> {
  const stats: Record<string, number> = {};

  for (const entry of entries) {
    if (entry.tags) {
      for (const tag of entry.tags) {
        stats[tag] = (stats[tag] || 0) + 1;
      }
    }
  }

  return stats;
}

/**
 * Tag display configuration
 */
export const TAG_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  work: { color: '#5A7A8B', bgColor: '#EEF2F5', label: 'Work' },
  family: { color: '#7C6BA0', bgColor: '#F0EEF8', label: 'Family' },
  relationships: { color: '#C4775A', bgColor: '#FEF3EE', label: 'Relationships' },
  health: { color: '#5C7A65', bgColor: '#EEF4F0', label: 'Health' },
  stress: { color: '#8B7355', bgColor: '#F5F2EE', label: 'Stress' },
  grief: { color: '#6B7280', bgColor: '#F3F4F6', label: 'Grief' },
  joy: { color: '#C49A5A', bgColor: '#FEF9EE', label: 'Joy' },
  gratitude: { color: '#7C8B75', bgColor: '#E8EDE6', label: 'Gratitude' },
  growth: { color: '#059669', bgColor: '#D1FAE5', label: 'Growth' },
  money: { color: '#0D9488', bgColor: '#CCFBF1', label: 'Money' },
  faith: { color: '#7C3AED', bgColor: '#EDE9FE', label: 'Faith' },
  creativity: { color: '#EC4899', bgColor: '#FCE7F3', label: 'Creativity' },
};
