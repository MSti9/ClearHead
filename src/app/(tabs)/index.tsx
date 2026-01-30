import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mic, PenLine, Sparkles, ChevronRight, Briefcase, Heart, Sun, Cloud, Users, TrendingUp, Moon, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useJournalStore } from '@/stores/journalStore';
import { analyzePatterns, type JournalInsight } from '@/lib/analyzePatterns';
import { format, isToday, isYesterday, differenceInDays, startOfMonth, isSameMonth } from 'date-fns';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTimeContext(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'The quiet hours are perfect for reflection.';
  if (hour < 12) return 'A moment of clarity before the day unfolds.';
  if (hour < 17) return 'A pause in the middle of things.';
  if (hour < 21) return 'The day is winding down. How did it go?';
  return 'Let your thoughts settle before sleep.';
}

function formatEntryDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

interface GentleStats {
  message: string;
  type: 'celebration' | 'gentle-nudge' | 'welcome';
}

function getGentleStats(entries: { createdAt: string }[], lastEntryDate: string | null): GentleStats | null {
  if (entries.length === 0) {
    return null; // Will show empty state instead
  }

  const now = new Date();
  const thisMonth = startOfMonth(now);

  // Count entries this month
  const entriesThisMonth = entries.filter((e) => {
    const entryDate = new Date(e.createdAt);
    return isSameMonth(entryDate, now);
  }).length;

  // Calculate days since last entry
  const lastEntry = entries[0];
  const lastEntryDateObj = new Date(lastEntry.createdAt);
  const daysSinceLastEntry = differenceInDays(now, lastEntryDateObj);

  // If journaled today - celebrate!
  if (isToday(lastEntryDateObj)) {
    if (entriesThisMonth === 1) {
      return { message: "First entry of the month!", type: 'celebration' };
    }
    return {
      message: `You've journaled ${entriesThisMonth} ${entriesThisMonth === 1 ? 'time' : 'times'} this month`,
      type: 'celebration'
    };
  }

  // If it's been a while - gentle check-in (not guilt)
  if (daysSinceLastEntry >= 5) {
    return {
      message: `It's been ${daysSinceLastEntry} days. No pressure, just checking in.`,
      type: 'gentle-nudge'
    };
  }

  // Recent activity - celebrate monthly progress
  if (entriesThisMonth > 0) {
    return {
      message: `${entriesThisMonth} ${entriesThisMonth === 1 ? 'entry' : 'entries'} this month`,
      type: 'celebration'
    };
  }

  // New month, haven't journaled yet
  return {
    message: "New month, fresh start",
    type: 'welcome'
  };
}

function BreathingOrb() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -100,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: 140,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={['#C4775A', '#D4A088', '#E8CFC0']}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 140,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  onPress: () => void;
  delay: number;
  colors: string[];
}

function QuickAction({ icon, label, sublabel, onPress, delay, colors }: QuickActionProps) {
  const handlePress = () => {
    onPress();
  };

  return (
    <AnimatedPressable
      entering={FadeInUp.delay(delay).springify()}
      onPress={handlePress}
      className="flex-1 rounded-2xl overflow-hidden"
      style={{ minHeight: 140 }}
    >
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        style={{
          flex: 1,
          padding: 16,
          justifyContent: 'space-between',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
          {icon}
        </View>
        <View>
          <Text
            style={{ fontFamily: 'DMSans_600SemiBold' }}
            className="text-white text-base"
          >
            {label}
          </Text>
          <Text
            style={{ fontFamily: 'DMSans_400Regular' }}
            className="text-white/70 text-xs mt-0.5"
          >
            {sublabel}
          </Text>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

interface EntryPreviewProps {
  entry: {
    id: string;
    content: string;
    createdAt: string;
    type: string;
    promptUsed?: string;
  };
  index: number;
}

function EntryPreview({ entry, index }: EntryPreviewProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/entry/${entry.id}`);
  };

  const preview = entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : '');

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(400 + index * 100).springify()}
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
        <Text
          style={{ fontFamily: 'DMSans_500Medium' }}
          className="text-stone-400 text-xs"
        >
          {formatEntryDate(entry.createdAt)} · {format(new Date(entry.createdAt), 'h:mm a')}
        </Text>
        {entry.type === 'voice' && (
          <View className="bg-amber-100 px-2 py-0.5 rounded-full">
            <Text
              style={{ fontFamily: 'DMSans_500Medium' }}
              className="text-amber-700 text-xs"
            >
              Voice
            </Text>
          </View>
        )}
        {entry.type === 'prompted' && (
          <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8EDE6' }}>
            <Text
              style={{ color: '#5C6B56', fontFamily: 'DMSans_500Medium', fontSize: 10 }}
            >
              Prompted
            </Text>
          </View>
        )}
      </View>
      {entry.promptUsed && (
        <Text
          style={{ fontFamily: 'CormorantGaramond_500Medium' }}
          className="text-stone-500 text-sm italic mb-1"
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
    </AnimatedPressable>
  );
}

const insightIcons = {
  Briefcase: Briefcase,
  Heart: Heart,
  Sun: Sun,
  Cloud: Cloud,
  Users: Users,
  Sparkles: Sparkles,
  TrendingUp: TrendingUp,
  Moon: Moon,
};

const insightColors: Record<string, { bg: string; icon: string }> = {
  Briefcase: { bg: '#E8EDE6', icon: '#5C6B56' },
  Heart: { bg: '#FCE7E7', icon: '#C4775A' },
  Sun: { bg: '#FEF3C7', icon: '#D97706' },
  Cloud: { bg: '#E5E7EB', icon: '#6B7280' },
  Users: { bg: '#DBEAFE', icon: '#3B82F6' },
  Sparkles: { bg: '#F3E8FF', icon: '#9333EA' },
  TrendingUp: { bg: '#D1FAE5', icon: '#059669' },
  Moon: { bg: '#E0E7FF', icon: '#4F46E5' },
};

function InsightCard({ insight, index }: { insight: JournalInsight; index: number }) {
  const IconComponent = insightIcons[insight.icon] || Sparkles;
  const colors = insightColors[insight.icon] || insightColors.Sparkles;

  return (
    <Animated.View
      entering={FadeInDown.delay(500 + index * 100).springify()}
      className="bg-white rounded-2xl p-4 mb-3"
      style={{
        shadowColor: '#2D2A26',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-start">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: colors.bg }}
        >
          <IconComponent size={18} color={colors.icon} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text
            style={{ fontFamily: 'DMSans_600SemiBold' }}
            className="text-stone-800 text-sm mb-1"
          >
            {insight.title}
          </Text>
          <Text
            style={{ fontFamily: 'DMSans_400Regular' }}
            className="text-stone-500 text-sm leading-5"
          >
            {insight.description}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const entries = useJournalStore((s) => s.entries);
  const lastEntryDate = useJournalStore((s) => s.lastEntryDate);
  const [insights, setInsights] = useState<JournalInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const recentEntries = entries.slice(0, 5);
  const hasEntries = entries.length > 0;
  const hasMoreEntries = entries.length > 5;
  const gentleStats = getGentleStats(entries, lastEntryDate);

  // Analyze patterns when entries change
  useEffect(() => {
    if (entries.length >= 10) {
      setLoadingInsights(true);
      analyzePatterns(entries)
        .then(setInsights)
        .catch(() => setInsights([]))
        .finally(() => setLoadingInsights(false));
    } else {
      setInsights([]);
    }
  }, [entries.length]);

  return (
    <View className="flex-1" style={{ backgroundColor: '#FAF8F5' }}>
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with breathing orb */}
          <View className="relative overflow-hidden px-6 pt-4 pb-8">
            <BreathingOrb />

            {/* Calendar button */}
            <Animated.View
              entering={FadeInDown.delay(50).springify()}
              className="absolute top-4 right-6 z-10"
            >
              <Pressable
                onPress={() => router.push('/calendar')}
                className="w-10 h-10 rounded-full bg-white/80 items-center justify-center"
                style={{
                  shadowColor: '#2D2A26',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Calendar size={18} color="#78716C" strokeWidth={2} />
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <Text
                style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                className="text-4xl text-stone-800 mb-1"
              >
                {getGreeting()}
              </Text>
              <Text
                style={{ fontFamily: 'DMSans_400Regular' }}
                className="text-stone-500 text-base"
              >
                {getTimeContext()}
              </Text>
            </Animated.View>

            {gentleStats && (
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                className="mt-4 flex-row items-center"
              >
                <View
                  className="px-3 py-1.5 rounded-full flex-row items-center"
                  style={{
                    backgroundColor: gentleStats.type === 'gentle-nudge' ? '#F5F2EE' : '#FEF9EE',
                    borderWidth: 1,
                    borderColor: gentleStats.type === 'gentle-nudge' ? '#E8E4DE' : '#FDE68A',
                  }}
                >
                  <Text className="text-base mr-1.5">
                    {gentleStats.type === 'celebration' ? '✨' : gentleStats.type === 'gentle-nudge' ? '👋' : '🌱'}
                  </Text>
                  <Text
                    style={{ fontFamily: 'DMSans_500Medium' }}
                    className="text-sm"
                    selectable={false}
                  >
                    <Text style={{ color: gentleStats.type === 'gentle-nudge' ? '#78716C' : '#92400E' }}>
                      {gentleStats.message}
                    </Text>
                  </Text>
                </View>
              </Animated.View>
            )}
          </View>

          {/* Quick Actions */}
          <View className="px-6 mb-6">
            <Animated.Text
              entering={FadeInDown.delay(250).springify()}
              style={{ fontFamily: 'DMSans_600SemiBold' }}
              className="text-stone-800 text-lg mb-3"
            >
              Start journaling
            </Animated.Text>

            <View className="flex-row gap-3">
              <QuickAction
                icon={<Mic size={20} color="white" strokeWidth={2} />}
                label="Voice note"
                sublabel="Talk it out"
                onPress={() => router.push('/record')}
                delay={300}
                colors={['#C4775A', '#D4A088']}
              />
              <QuickAction
                icon={<PenLine size={20} color="white" strokeWidth={2} />}
                label="Write"
                sublabel="Type freely"
                onPress={() => router.push('/new-entry')}
                delay={350}
                colors={['#7C8B75', '#9CAA95']}
              />
            </View>

            <AnimatedPressable
              entering={FadeInUp.delay(400).springify()}
              onPress={() => {
                router.push('/prompts');
              }}
              className="mt-3 rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={['#F5F2EE', '#EBE6E0']}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  justifyContent: 'space-between',
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-stone-300/30 items-center justify-center mr-3">
                    <Sparkles size={20} color="#8B7355" strokeWidth={2} />
                  </View>
                  <View>
                    <Text
                      style={{ fontFamily: 'DMSans_600SemiBold' }}
                      className="text-stone-700 text-base"
                    >
                      Need a prompt?
                    </Text>
                    <Text
                      style={{ fontFamily: 'DMSans_400Regular' }}
                      className="text-stone-500 text-xs"
                    >
                      Browse conversation starters
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#9C9690" />
              </LinearGradient>
            </AnimatedPressable>
          </View>

          {/* Recent Entries */}
          <View className="px-6">
            <Animated.View
              entering={FadeInDown.delay(350).springify()}
              className="flex-row items-center justify-between mb-3"
            >
              <Text
                style={{ fontFamily: 'DMSans_600SemiBold' }}
                className="text-stone-800 text-lg"
              >
                Recent entries
              </Text>
              {hasMoreEntries && (
                <Pressable onPress={() => router.push('/entries')}>
                  <Text
                    style={{ fontFamily: 'DMSans_500Medium' }}
                    className="text-sm"
                    selectable={false}
                  >
                    <Text style={{ color: '#C4775A' }}>View all</Text>
                    <Text style={{ color: '#9C9690' }}> · {entries.length}</Text>
                  </Text>
                </Pressable>
              )}
              {hasEntries && !hasMoreEntries && (
                <Text
                  style={{ fontFamily: 'DMSans_500Medium' }}
                  className="text-stone-400 text-sm"
                >
                  {entries.length} total
                </Text>
              )}
            </Animated.View>

            {hasEntries ? (
              recentEntries.map((entry, index) => (
                <EntryPreview key={entry.id} entry={entry} index={index} />
              ))
            ) : (
              <Animated.View
                entering={FadeInDown.delay(400).springify()}
                className="bg-white rounded-2xl p-6 items-center"
                style={{
                  shadowColor: '#2D2A26',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="w-16 h-16 rounded-full bg-stone-100 items-center justify-center mb-4">
                  <PenLine size={28} color="#9C9690" strokeWidth={1.5} />
                </View>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                  className="text-stone-600 text-xl text-center mb-1"
                >
                  Your journal awaits
                </Text>
                <Text
                  style={{ fontFamily: 'DMSans_400Regular' }}
                  className="text-stone-400 text-sm text-center"
                >
                  No pressure. Start whenever you are ready.
                </Text>
              </Animated.View>
            )}
          </View>

          {/* Insights Section */}
          {insights.length > 0 && (
            <View className="px-6 mt-6">
              <Animated.View
                entering={FadeInDown.delay(450).springify()}
                className="flex-row items-center mb-3"
              >
                <Text
                  style={{ fontFamily: 'DMSans_600SemiBold' }}
                  className="text-stone-800 text-lg"
                >
                  Patterns & Insights
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(480).springify()}
                className="bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-3 mb-4"
              >
                <Text
                  style={{ fontFamily: 'DMSans_400Regular' }}
                  className="text-amber-700 text-xs leading-4"
                >
                  Based on your recent entries, here's what we've noticed. These insights help you see patterns you might not notice yourself.
                </Text>
              </Animated.View>

              {insights.map((insight, index) => (
                <InsightCard key={insight.id} insight={insight} index={index} />
              ))}
            </View>
          )}

          {/* Loading insights indicator */}
          {loadingInsights && entries.length >= 10 && (
            <View className="px-6 mt-6">
              <View className="bg-stone-100 rounded-2xl p-4 items-center">
                <Text
                  style={{ fontFamily: 'DMSans_400Regular' }}
                  className="text-stone-400 text-sm"
                >
                  Analyzing your journal patterns...
                </Text>
              </View>
            </View>
          )}

          {/* Teaser for insights */}
          {entries.length >= 5 && entries.length < 10 && !loadingInsights && (
            <View className="px-6 mt-6">
              <Animated.View
                entering={FadeInDown.delay(450).springify()}
                className="bg-stone-100 rounded-2xl p-4"
              >
                <View className="flex-row items-center mb-2">
                  <TrendingUp size={16} color="#9C9690" strokeWidth={2} />
                  <Text
                    style={{ fontFamily: 'DMSans_500Medium' }}
                    className="text-stone-600 text-sm ml-2"
                  >
                    Insights coming soon
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: 'DMSans_400Regular' }}
                  className="text-stone-400 text-xs leading-4"
                >
                  After {10 - entries.length} more {10 - entries.length === 1 ? 'entry' : 'entries'}, we'll start identifying patterns in your journaling to help you understand yourself better.
                </Text>
              </Animated.View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
