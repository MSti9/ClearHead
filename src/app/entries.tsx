import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mic, PenLine, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useJournalStore } from '@/stores/journalStore';
import { format, isToday, isYesterday, isSameMonth, isSameYear } from 'date-fns';

function formatEntryDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

function getMonthHeader(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  if (isSameMonth(date, now) && isSameYear(date, now)) {
    return 'This Month';
  }

  return format(date, 'MMMM yyyy');
}

interface EntryItemProps {
  entry: {
    id: string;
    content: string;
    createdAt: string;
    type: string;
    promptUsed?: string;
  };
  index: number;
}

function EntryItem({ entry, index }: EntryItemProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/entry/${entry.id}`);
  };

  const preview = entry.content.substring(0, 120) + (entry.content.length > 120 ? '...' : '');

  const TypeIcon = entry.type === 'voice' ? Mic : entry.type === 'prompted' ? Sparkles : PenLine;
  const typeColor = entry.type === 'voice' ? '#D97706' : entry.type === 'prompted' ? '#7C8B75' : '#9C9690';

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={handlePress}
        className="bg-white rounded-2xl p-4 mb-3"
        style={{
          shadowColor: '#2D2A26',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <TypeIcon size={14} color={typeColor} strokeWidth={2} />
            <Text
              style={{ fontFamily: 'DMSans_500Medium' }}
              className="text-stone-400 text-xs ml-1.5"
            >
              {formatEntryDate(entry.createdAt)} · {format(new Date(entry.createdAt), 'h:mm a')}
            </Text>
          </View>
        </View>

        {entry.promptUsed && (
          <Text
            style={{ fontFamily: 'CormorantGaramond_500Medium' }}
            className="text-stone-500 text-sm italic mb-1"
            numberOfLines={1}
          >
            {entry.promptUsed}
          </Text>
        )}

        <Text
          style={{ fontFamily: 'DMSans_400Regular' }}
          className="text-stone-700 text-sm leading-5"
        >
          {preview}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function EntriesScreen() {
  const router = useRouter();
  const entries = useJournalStore((s) => s.entries);

  // Group entries by month
  const groupedEntries: { header: string; entries: typeof entries }[] = [];
  let currentHeader = '';

  entries.forEach((entry) => {
    const header = getMonthHeader(entry.createdAt);
    if (header !== currentHeader) {
      currentHeader = header;
      groupedEntries.push({ header, entries: [entry] });
    } else {
      groupedEntries[groupedEntries.length - 1].entries.push(entry);
    }
  });

  return (
    <View className="flex-1" style={{ backgroundColor: '#FAF8F5' }}>
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 py-4">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-stone-100 items-center justify-center mr-4"
          >
            <ArrowLeft size={20} color="#78716C" strokeWidth={2} />
          </Pressable>
          <View className="flex-1">
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
              className="text-2xl text-stone-800"
            >
              All Entries
            </Text>
            <Text
              style={{ fontFamily: 'DMSans_400Regular' }}
              className="text-stone-400 text-sm"
            >
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {groupedEntries.map((group, groupIndex) => (
            <View key={group.header} className="mb-2">
              <Text
                style={{ fontFamily: 'DMSans_600SemiBold' }}
                className="text-stone-400 text-xs uppercase tracking-wider mb-3 mt-4"
              >
                {group.header}
              </Text>
              {group.entries.map((entry, entryIndex) => (
                <EntryItem
                  key={entry.id}
                  entry={entry}
                  index={groupIndex * 5 + entryIndex}
                />
              ))}
            </View>
          ))}

          {entries.length === 0 && (
            <View className="items-center py-12">
              <View className="w-16 h-16 rounded-full bg-stone-100 items-center justify-center mb-4">
                <PenLine size={28} color="#9C9690" strokeWidth={1.5} />
              </View>
              <Text
                style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                className="text-stone-600 text-xl text-center mb-1"
              >
                No entries yet
              </Text>
              <Text
                style={{ fontFamily: 'DMSans_400Regular' }}
                className="text-stone-400 text-sm text-center"
              >
                Start journaling to see your entries here.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
