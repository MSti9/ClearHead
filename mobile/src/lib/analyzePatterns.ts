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

  const prompt = `Pick 2–3 plain observations across these saved dumps. Look at:
- Recurring topics (work, relationships, health, etc.)
- Emotional patterns (what tends to weigh, what tends to lift)
- Time-based patterns (mornings vs evenings, weekends vs weekdays)

Saved dumps:
${entrySummaries}

Respond in this exact JSON format only, no other text:
{
  "insights": [
    {
      "type": "theme" | "emotion" | "observation",
      "title": "Short title (5-7 words max)",
      "description": "One plain sentence, 'you' addressed directly. No flattery, no fix.",
      "icon": "Briefcase" | "Heart" | "Sun" | "Cloud" | "Users" | "Sparkles" | "TrendingUp" | "Moon"
    }
  ]
}

Rules:
- Bounded to what the dumps SAID. Never diagnose who the user IS.
- Plain language, no clinical or therapeutic framing.
- No "celebrate," no "your journey," no "you're so strong."
- If something positive shows up, name it. If something's heavy, name it. Don't push either way.
- Icons: Briefcase=work, Heart=relationships, Sun=energy, Cloud=worry, Users=family/friends, Sparkles=creativity, TrendingUp=progress, Moon=rest`;

  try {
    const result = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'Pull plain observations from a set of saved brain dumps. Light, dry, steady — never coach-y, clinical, or flattering. Bounded to what the dumps said; never diagnose who the user is. Always respond with valid JSON only.',
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
