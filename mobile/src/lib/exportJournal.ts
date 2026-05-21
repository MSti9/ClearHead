import type { JournalEntry } from '@/stores/journalStore';
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { chatCompletion } from '@/lib/apiClient';

/**
 * Export journal entries as a text file
 */
export async function exportAsText(entries: JournalEntry[]): Promise<void> {
  if (entries.length === 0) {
    throw new Error('No entries to export');
  }

  const header = `CLEARHEAD EXPORT
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
  const fileName = `clearhead-export-${format(new Date(), 'yyyy-MM-dd')}.txt`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, fullContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/plain',
      dialogTitle: 'Export',
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
  let aiSummary = '';

  if (yearEntries.length >= 10) {
    try {
      // Sample entries throughout the year
      const sampledEntries = yearEntries
        .filter((_, i) => i % Math.ceil(yearEntries.length / 15) === 0)
        .slice(0, 15)
        .map((e) => e.content.substring(0, 300))
        .join('\n---\n');

      const result = await chatCompletion({
        messages: [
          {
            role: 'system',
            content: 'Write a short year-in-review based on a set of saved brain dumps. Plain and direct — no flattery, no "your journey," no clinical framing. Name the themes that came up. 2–3 short paragraphs. Light, dry, steady.',
          },
          {
            role: 'user',
            content: `Based on these saved dumps from ${currentYear}, write a brief year-in-review naming the themes that came up. Plain language, no flattery:\n\n${sampledEntries}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      aiSummary = result.content?.trim() || '';
    } catch {
      // Continue without AI summary
    }
  }

  // Build the review
  let review = `YOUR ${currentYear} IN REVIEW
${'='.repeat(30)}

📊 BY THE NUMBERS
• ${totalEntries} entries
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
