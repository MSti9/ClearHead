import type { JournalEntry } from '@/stores/journalStore';
import { chatCompletion } from '@/lib/apiClient';

export interface JournalInsight {
  id: string;
  type: 'theme' | 'emotion' | 'observation';
  title: string;
  description: string;
  count?: number;
  icon: 'Briefcase' | 'Heart' | 'Sun' | 'Cloud' | 'Users' | 'Sparkles' | 'TrendingUp' | 'Moon';
}

const INSIGHT_CACHE_KEY = 'journal_insights_cache';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

interface CachedInsights {
  insights: JournalInsight[];
  timestamp: number;
  entryCount: number;
}

export async function analyzePatterns(entries: JournalEntry[]): Promise<JournalInsight[]> {
  // Need at least 10 entries to find meaningful patterns
  if (entries.length < 10) {
    return [];
  }

  // Check cache first
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const cached = await AsyncStorage.getItem(INSIGHT_CACHE_KEY);

    if (cached) {
      const parsedCache: CachedInsights = JSON.parse(cached);
      const isRecent = Date.now() - parsedCache.timestamp < CACHE_DURATION;
      const sameEntryCount = parsedCache.entryCount === entries.length;

      // Return cached if recent and entry count hasn't changed much
      if (isRecent && sameEntryCount) {
        return parsedCache.insights;
      }
    }
  } catch {
    // Continue without cache
  }

  // Prepare entries for analysis (last 30 days or last 50 entries)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentEntries = entries
    .filter(e => new Date(e.createdAt) >= thirtyDaysAgo)
    .slice(0, 50);

  if (recentEntries.length < 10) {
    return [];
  }

  // Build context for AI
  const entrySummaries = recentEntries.map(entry => {
    const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const preview = entry.content.substring(0, 500);
    return `[${date}]: ${preview}`;
  }).join('\n\n');

  const prompt = `Analyze these journal entries and identify 2-3 meaningful patterns or insights. Focus on:
- Recurring themes or topics (work, relationships, health, hobbies, etc.)
- Emotional patterns (what makes them happy, stressed, peaceful)
- Time-based patterns (morning vs evening mood, weekend vs weekday)

Journal entries:
${entrySummaries}

Respond in this exact JSON format only, no other text:
{
  "insights": [
    {
      "type": "theme" | "emotion" | "observation",
      "title": "Short title (5-7 words max)",
      "description": "Friendly, supportive observation (1-2 sentences, speak directly to the user with 'you')",
      "icon": "Briefcase" | "Heart" | "Sun" | "Cloud" | "Users" | "Sparkles" | "TrendingUp" | "Moon"
    }
  ]
}

Guidelines:
- Be warm and supportive, not clinical
- Use "you" to speak directly to the user
- Focus on helpful observations, not judgments
- If you notice something positive, celebrate it
- If you notice stress patterns, be gentle and constructive
- Icons: Briefcase=work, Heart=relationships/love, Sun=positivity/energy, Cloud=stress/worry, Users=family/friends, Sparkles=creativity/joy, TrendingUp=growth/progress, Moon=rest/reflection`;

  try {
    const result = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are a supportive journaling companion that helps people understand their thoughts and feelings. You analyze journal entries to find meaningful patterns. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = result.content;

    if (!content) {
      return [];
    }

    // Parse the JSON response
    const parsed = JSON.parse(content);
    const insights: JournalInsight[] = (parsed.insights || []).map((insight: Omit<JournalInsight, 'id'>, index: number) => ({
      ...insight,
      id: `insight_${Date.now()}_${index}`,
    }));

    // Cache the results
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const cacheData: CachedInsights = {
        insights,
        timestamp: Date.now(),
        entryCount: entries.length,
      };
      await AsyncStorage.setItem(INSIGHT_CACHE_KEY, JSON.stringify(cacheData));
    } catch {
      // Continue without caching
    }

    return insights;
  } catch (error) {
    console.error('Pattern analysis failed:', error);
    return [];
  }
}

export async function clearInsightsCache(): Promise<void> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.removeItem(INSIGHT_CACHE_KEY);
  } catch {
    // Ignore cache clear errors
  }
}
