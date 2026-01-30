import type { JournalEntry } from '@/stores/journalStore';
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Export journal entries as a text file
 */
export async function exportAsText(entries: JournalEntry[]): Promise<void> {
  if (entries.length === 0) {
    throw new Error('No entries to export');
  }

  const header = `CLEARHEAD JOURNAL EXPORT
Generated: ${format(new Date(), 'MMMM d, yyyy')}
Total Entries: ${entries.length}
${'='.repeat(50)}

`;

  const content = entries
    .map((entry) => {
      const date = format(new Date(entry.createdAt), 'EEEE, MMMM d, yyyy • h:mm a');
      const type = entry.type === 'voice' ? '[Voice Note]' : entry.type === 'prompted' ? '[Prompted]' : '';
      const prompt = entry.promptUsed ? `Prompt: "${entry.promptUsed}"\n\n` : '';

      return `${date} ${type}
${'-'.repeat(40)}
${prompt}${entry.content}

`;
    })
    .join('\n');

  const fullContent = header + content;
  const fileName = `clearhead-journal-${format(new Date(), 'yyyy-MM-dd')}.txt`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, fullContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/plain',
      dialogTitle: 'Export Journal',
    });
  }
}

/**
 * Generate a year in review summary
 */
export async function generateYearInReview(entries: JournalEntry[]): Promise<string | null> {
  const now = new Date();
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);
  const currentYear = now.getFullYear();

  // Filter entries for this year
  const yearEntries = entries.filter((entry) => {
    const date = new Date(entry.createdAt);
    return date >= yearStart && date <= yearEnd;
  });

  if (yearEntries.length < 5) {
    return null; // Not enough entries for a meaningful review
  }

  // Calculate stats
  const totalEntries = yearEntries.length;
  const voiceEntries = yearEntries.filter((e) => e.type === 'voice').length;
  const promptedEntries = yearEntries.filter((e) => e.type === 'prompted').length;
  const writtenEntries = yearEntries.filter((e) => e.type === 'text').length;

  // Get entries by month
  const months = eachMonthOfInterval({ start: yearStart, end: now });
  const entriesByMonth = months.map((month) => {
    const monthEntries = yearEntries.filter((e) => {
      const date = new Date(e.createdAt);
      return date.getMonth() === month.getMonth();
    });
    return {
      month: format(month, 'MMMM'),
      count: monthEntries.length,
    };
  });

  const mostActiveMonth = entriesByMonth.reduce((max, m) =>
    m.count > max.count ? m : max,
    { month: '', count: 0 }
  );

  // Calculate total words
  const totalWords = yearEntries.reduce((sum, entry) => {
    return sum + entry.content.split(/\s+/).filter(Boolean).length;
  }, 0);

  // Try to get AI-generated insights
  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
  let aiSummary = '';

  if (apiKey && yearEntries.length >= 10) {
    try {
      // Sample entries throughout the year
      const sampledEntries = yearEntries
        .filter((_, i) => i % Math.ceil(yearEntries.length / 15) === 0)
        .slice(0, 15)
        .map((e) => e.content.substring(0, 300))
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
              content: 'You write warm, supportive year-in-review summaries for personal journals. Be encouraging and highlight growth and themes. Keep it to 2-3 short paragraphs.',
            },
            {
              role: 'user',
              content: `Based on these journal entries from ${currentYear}, write a brief, warm year-in-review summary highlighting themes, growth, and encouragement:\n\n${sampledEntries}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiSummary = data.choices?.[0]?.message?.content?.trim() || '';
      }
    } catch {
      // Continue without AI summary
    }
  }

  // Build the review
  let review = `YOUR ${currentYear} IN REVIEW
${'='.repeat(30)}

📊 BY THE NUMBERS
• ${totalEntries} journal entries
• ${totalWords.toLocaleString()} words written
• ${voiceEntries} voice notes
• ${promptedEntries} prompted entries
• ${writtenEntries} free-form entries

📅 YOUR YEAR
${entriesByMonth
  .filter((m) => m.count > 0)
  .map((m) => `• ${m.month}: ${m.count} ${m.count === 1 ? 'entry' : 'entries'}`)
  .join('\n')}

🏆 Most active month: ${mostActiveMonth.month} (${mostActiveMonth.count} entries)
`;

  if (aiSummary) {
    review += `
✨ LOOKING BACK
${aiSummary}
`;
  }

  review += `
${'='.repeat(30)}
Keep going. Every entry matters.
`;

  return review;
}

/**
 * Export year in review as shareable file
 */
export async function exportYearInReview(entries: JournalEntry[]): Promise<void> {
  const review = await generateYearInReview(entries);

  if (!review) {
    throw new Error('Not enough entries this year for a review');
  }

  const currentYear = new Date().getFullYear();
  const fileName = `clearhead-${currentYear}-review.txt`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, review, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/plain',
      dialogTitle: `${currentYear} Year in Review`,
    });
  }
}
