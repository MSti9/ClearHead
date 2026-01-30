import type { JournalEntry } from '@/stores/journalStore';
import { differenceInDays, differenceInWeeks, format } from 'date-fns';

export interface ReflectionPrompt {
  id: string;
  type: 'follow-up' | 'milestone' | 'pattern';
  prompt: string;
  relatedEntryId?: string;
  relatedEntryDate?: string;
  relatedEntryPreview?: string;
}

/**
 * Generate reflection prompts based on past journal entries
 */
export async function generateReflectionPrompts(
  entries: JournalEntry[]
): Promise<ReflectionPrompt[]> {
  if (entries.length < 3) return [];

  const prompts: ReflectionPrompt[] = [];
  const now = new Date();

  // Find entries from ~2 weeks ago for follow-up prompts
  const twoWeeksAgo = entries.filter((entry) => {
    const entryDate = new Date(entry.createdAt);
    const daysDiff = differenceInDays(now, entryDate);
    return daysDiff >= 12 && daysDiff <= 18;
  });

  // Find entries from ~1 month ago
  const oneMonthAgo = entries.filter((entry) => {
    const entryDate = new Date(entry.createdAt);
    const daysDiff = differenceInDays(now, entryDate);
    return daysDiff >= 28 && daysDiff <= 35;
  });

  // Generate follow-up prompts for 2-week old entries
  if (twoWeeksAgo.length > 0) {
    const entry = twoWeeksAgo[Math.floor(Math.random() * twoWeeksAgo.length)];
    const preview = entry.content.substring(0, 60).trim();
    const weeksAgo = differenceInWeeks(now, new Date(entry.createdAt));

    prompts.push({
      id: `reflection_${entry.id}_2w`,
      type: 'follow-up',
      prompt: `${weeksAgo} weeks ago you wrote: "${preview}..." — How do you feel about this now?`,
      relatedEntryId: entry.id,
      relatedEntryDate: format(new Date(entry.createdAt), 'MMM d'),
      relatedEntryPreview: preview,
    });
  }

  // Generate follow-up prompts for 1-month old entries
  if (oneMonthAgo.length > 0) {
    const entry = oneMonthAgo[Math.floor(Math.random() * oneMonthAgo.length)];
    const preview = entry.content.substring(0, 60).trim();

    prompts.push({
      id: `reflection_${entry.id}_1m`,
      type: 'follow-up',
      prompt: `About a month ago you reflected on: "${preview}..." — What has changed since then?`,
      relatedEntryId: entry.id,
      relatedEntryDate: format(new Date(entry.createdAt), 'MMM d'),
      relatedEntryPreview: preview,
    });
  }

  // Milestone prompts based on entry count
  if (entries.length === 10 || entries.length === 25 || entries.length === 50 || entries.length === 100) {
    prompts.push({
      id: `milestone_${entries.length}`,
      type: 'milestone',
      prompt: `You've written ${entries.length} journal entries. Looking back, what themes or patterns do you notice in your journey so far?`,
    });
  }

  // If we have AI access, try to generate a more contextual prompt
  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
  if (apiKey && entries.length >= 5) {
    try {
      const recentEntries = entries.slice(0, 10);
      const entrySummaries = recentEntries
        .map((e) => e.content.substring(0, 200))
        .join('\n---\n');

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
              content: 'You generate thoughtful reflection prompts for journaling. Return ONLY the prompt text, nothing else. Be warm and supportive.',
            },
            {
              role: 'user',
              content: `Based on these recent journal entries, generate ONE thoughtful follow-up question that helps the person reflect on their progress or see their situation differently:\n\n${entrySummaries}`,
            },
          ],
          temperature: 0.8,
          max_tokens: 100,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiPrompt = data.choices?.[0]?.message?.content?.trim();
        if (aiPrompt) {
          prompts.push({
            id: `ai_reflection_${Date.now()}`,
            type: 'pattern',
            prompt: aiPrompt,
          });
        }
      }
    } catch {
      // Silently fail - AI prompts are optional
    }
  }

  return prompts;
}
