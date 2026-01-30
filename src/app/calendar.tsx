import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Mic, PenLine, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useJournalStore } from '@/stores/journalStore';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
} from 'date-fns';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface DayEntry {
  id: string;
  content: string;
  createdAt: string;
  type: string;
  promptUsed?: string;
}

function CalendarDay({
  date,
  currentMonth,
  entries,
  onPress,
}: {
  date: Date;
  currentMonth: Date;
  entries: DayEntry[];
  onPress: () => void;
}) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const hasEntries = entries.length > 0;
  const isCurrentDay = isToday(date);

  return (
    <Pressable
      onPress={hasEntries ? onPress : undefined}
      className="flex-1 aspect-square items-center justify-center"
      style={{ minHeight: 44 }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{
          backgroundColor: hasEntries
            ? '#C4775A'
            : isCurrentDay
              ? '#F5F2EE'
              : 'transparent',
        }}
      >
        <Text
          style={{
            fontFamily: hasEntries ? 'DMSans_600SemiBold' : 'DMSans_400Regular',
            color: hasEntries
              ? 'white'
              : isCurrentMonth
                ? isCurrentDay
                  ? '#C4775A'
                  : '#44403C'
                : '#D6D3D1',
            fontSize: 14,
          }}
        >
          {format(date, 'd')}
        </Text>
      </View>
      {hasEntries && entries.length > 1 && (
        <View className="absolute bottom-0.5 flex-row gap-0.5">
          {Array.from({ length: Math.min(entries.length, 3) }).map((_, i) => (
            <View
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: '#C4775A' }}
            />
          ))}
        </View>
      )}
    </Pressable>
  );
}

function EntryPreviewCard({ entry }: { entry: DayEntry }) {
  const router = useRouter();
  const preview = entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : '');

  const TypeIcon = entry.type === 'voice' ? Mic : entry.type === 'prompted' ? Sparkles : PenLine;
  const typeColor = entry.type === 'voice' ? '#D97706' : entry.type === 'prompted' ? '#7C8B75' : '#9C9690';

  return (
    <Pressable
      onPress={() => router.push(`/entry/${entry.id}`)}
      className="bg-white rounded-2xl p-4 mb-2"
      style={{
        shadowColor: '#2D2A26',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center mb-2">
        <TypeIcon size={14} color={typeColor} strokeWidth={2} />
        <Text
          style={{ fontFamily: 'DMSans_500Medium' }}
          className="text-stone-400 text-xs ml-1.5"
        >
          {format(new Date(entry.createdAt), 'h:mm a')}
        </Text>
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
        numberOfLines={3}
      >
        {preview}
      </Text>
    </Pressable>
  );
}

export default function CalendarScreen() {
  const router = useRouter();
  const entries = useJournalStore((s) => s.entries);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get entries grouped by date
  const entriesByDate = useMemo(() => {
    const grouped: Record<string, DayEntry[]> = {};
    entries.forEach((entry) => {
      const dateKey = format(new Date(entry.createdAt), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    return grouped;
  }, [entries]);

  // Get days in the current month view
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Add padding days for the first week
    const startPadding = getDay(start);
    const paddingDays: Date[] = [];
    for (let i = startPadding - 1; i >= 0; i--) {
      const paddingDate = new Date(start);
      paddingDate.setDate(paddingDate.getDate() - (i + 1));
      paddingDays.push(paddingDate);
    }

    return [...paddingDays, ...days];
  }, [currentMonth]);

  // Get entries for selected date
  const selectedDateEntries = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return entriesByDate[dateKey] || [];
  }, [selectedDate, entriesByDate]);

  // Stats for the month
  const monthStats = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    let totalEntries = 0;
    let daysWithEntries = 0;

    eachDayOfInterval({ start, end }).forEach((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayEntries = entriesByDate[dateKey] || [];
      if (dayEntries.length > 0) {
        daysWithEntries++;
        totalEntries += dayEntries.length;
      }
    });

    return { totalEntries, daysWithEntries };
  }, [currentMonth, entriesByDate]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
  };

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
              Calendar
            </Text>
            <Text
              style={{ fontFamily: 'DMSans_400Regular' }}
              className="text-stone-400 text-sm"
            >
              Your journaling history
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Month Navigator */}
          <Animated.View
            entering={FadeInDown.delay(50).springify()}
            className="flex-row items-center justify-between px-6 mb-4"
          >
            <Pressable
              onPress={handlePrevMonth}
              className="w-10 h-10 rounded-full bg-stone-100 items-center justify-center"
            >
              <ChevronLeft size={20} color="#78716C" strokeWidth={2} />
            </Pressable>

            <Text
              style={{ fontFamily: 'DMSans_600SemiBold' }}
              className="text-stone-800 text-lg"
            >
              {format(currentMonth, 'MMMM yyyy')}
            </Text>

            <Pressable
              onPress={handleNextMonth}
              className="w-10 h-10 rounded-full bg-stone-100 items-center justify-center"
            >
              <ChevronRight size={20} color="#78716C" strokeWidth={2} />
            </Pressable>
          </Animated.View>

          {/* Month Stats */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            className="flex-row px-6 mb-4 gap-3"
          >
            <View className="flex-1 bg-white rounded-2xl p-4" style={{
              shadowColor: '#2D2A26',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <Text
                style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                className="text-2xl text-stone-800"
              >
                {monthStats.daysWithEntries}
              </Text>
              <Text
                style={{ fontFamily: 'DMSans_400Regular' }}
                className="text-stone-400 text-xs"
              >
                days journaled
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4" style={{
              shadowColor: '#2D2A26',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <Text
                style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                className="text-2xl text-stone-800"
              >
                {monthStats.totalEntries}
              </Text>
              <Text
                style={{ fontFamily: 'DMSans_400Regular' }}
                className="text-stone-400 text-xs"
              >
                total entries
              </Text>
            </View>
          </Animated.View>

          {/* Calendar Grid */}
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            className="px-6 mb-4"
          >
            <View
              className="bg-white rounded-2xl p-4"
              style={{
                shadowColor: '#2D2A26',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {/* Weekday headers */}
              <View className="flex-row mb-2">
                {WEEKDAYS.map((day, index) => (
                  <View key={index} className="flex-1 items-center py-2">
                    <Text
                      style={{ fontFamily: 'DMSans_500Medium' }}
                      className="text-stone-400 text-xs"
                    >
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Calendar days */}
              <View className="flex-row flex-wrap">
                {calendarDays.map((date, index) => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const dayEntries = entriesByDate[dateKey] || [];

                  return (
                    <View key={index} style={{ width: '14.28%' }}>
                      <CalendarDay
                        date={date}
                        currentMonth={currentMonth}
                        entries={dayEntries}
                        onPress={() => handleDayPress(date)}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>

          {/* Legend */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="px-6 mb-6"
          >
            <View className="flex-row items-center justify-center gap-6">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#C4775A' }} />
                <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-500 text-xs">
                  Journaled
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full mr-2 border border-stone-300" style={{ backgroundColor: '#F5F2EE' }} />
                <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-500 text-xs">
                  Today
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Selected Date Entries */}
          {selectedDate && (
            <Animated.View
              entering={FadeInDown.springify()}
              className="px-6"
            >
              <Text
                style={{ fontFamily: 'DMSans_600SemiBold' }}
                className="text-stone-800 text-base mb-3"
              >
                {format(selectedDate, 'EEEE, MMMM d')}
              </Text>

              {selectedDateEntries.length > 0 ? (
                selectedDateEntries.map((entry) => (
                  <EntryPreviewCard key={entry.id} entry={entry} />
                ))
              ) : (
                <View className="bg-stone-100 rounded-2xl p-4 items-center">
                  <Text
                    style={{ fontFamily: 'DMSans_400Regular' }}
                    className="text-stone-400 text-sm"
                  >
                    No entries on this day
                  </Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Hint when no date selected */}
          {!selectedDate && entries.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(250).springify()}
              className="px-6"
            >
              <View className="bg-stone-100 rounded-2xl p-4 items-center">
                <Text
                  style={{ fontFamily: 'DMSans_400Regular' }}
                  className="text-stone-400 text-sm text-center"
                >
                  Tap a highlighted day to see your entries
                </Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
