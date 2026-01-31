import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mic, PenLine, Sparkles, ChevronRight, Briefcase, Heart, Sun, Cloud, Users, TrendingUp, Moon, Calendar, MessageCircle } from 'lucide-react-native';
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
import * as Haptics from '@/lib/haptics';
import { analyzePatterns, type JournalInsight } from '@/lib/analyzePatterns';
import { TAG_CONFIG } from '@/lib/autoTag';
import { format, isToday, isYesterday, differenceInDays, startOfMonth, isSameMonth } from 'date-fns';
import { PaperTexture } from '@/components/PaperTexture';

// Time-of-day color palettes for warm minimalism
function getTimeOfDayColors(): { gradient: [string, string]; accent: string; orbColors: [string, string, string] } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 9) {
    // Early morning - soft peach/rose dawn
    return {
      gradient: ['#FDF8F5', '#FAF0EA'],
      accent: '#D4A088',
      orbColors: ['#E8B4A0', '#D4A088', '#F5DDD0'],
    };
  } else if (hour >= 9 && hour < 12) {
    // Late morning - warm cream
    return {
      gradient: ['#FDFBF7', '#FAF6F0'],
      accent: '#C4775A',
      orbColors: ['#C4775A', '#D4A088', '#E8CFC0'],
    };
  } else if (hour >= 12 && hour < 17) {
    // Afternoon - neutral warm
    return {
      gradient: ['#FAF8F5', '#F5F2EE'],
      accent: '#8B7355',
      orbColors: ['#B8A08A', '#C9B8A5', '#DDD0C4'],
    };
  } else if (hour >= 17 && hour < 20) {
    // Evening - golden hour warmth
    return {
      gradient: ['#FBF6F0', '#F8EEE4'],
      accent: '#C4775A',
      orbColors: ['#D4886A', '#C9A080', '#E8D4C4'],
    };
  } else {
    // Night - cool, calm tones
    return {
      gradient: ['#F8F6F4', '#F2EFED'],
      accent: '#7C8B75',
      orbColors: ['#9CA8A0', '#B4BEB8', '#CED6D2'],
    };
  }
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getGreeting(userName?: string | null): string {
  const hour = new Date().getHours();
  if (userName) {
    // Warm, personal greeting with name
    if (hour < 12) return `Hey, ${userName}`;
    if (hour < 17) return `Hey, ${userName}`;
    return `Hey, ${userName}`;
  }
  // Fallback without name
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
  const opacity = useSharedValue(0.35);
  const timeColors = getTimeOfDayColors();

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 5000, easing: Easing.inOut(Easing.ease) })
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
          top: -120,
          right: -100,
          width: 320,
          height: 320,
          borderRadius: 160,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={timeColors.orbColors}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 160,
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
    Haptics.lightTap();
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
    tags?: string[];
  };
  index: number;
}

function EntryPreview({ entry, index }: EntryPreviewProps) {
  const router = useRouter();

  const handlePress = () => {
    Haptics.lightTap();
    router.push(`/entry/${entry.id}`);
  };

  const preview = entry.content.substring(0, 120) + (entry.content.length > 120 ? '...' : '');

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(400 + index * 100).springify()}
      onPress={handlePress}
      className="bg-white rounded-2xl p-5 mb-4"
      style={{
        shadowColor: '#2D2A26',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <Text
        style={{ fontFamily: 'DMSans_400Regular' }}
        className="text-stone-400 text-xs mb-3"
      >
        {formatEntryDate(entry.createdAt)}
      </Text>
      {entry.promptUsed && (
        <Text
          style={{ fontFamily: 'CormorantGaramond_500Medium_Italic' }}
          className="text-stone-500 text-base mb-2"
        >
          {entry.promptUsed}
        </Text>
      )}
      <Text
        style={{ fontFamily: 'DMSans_400Regular' }}
        className="text-stone-700 text-base leading-6"
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
  const userName = useJournalStore((s) => s.userName);
  const [insights, setInsights] = useState<JournalInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const recentEntries = entries.slice(0, 5);
  const hasEntries = entries.length > 0;
  const hasMoreEntries = entries.length > 5;
  const gentleStats = getGentleStats(entries, lastEntryDate);
  const timeColors = getTimeOfDayColors();

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
    <View className="flex-1">
      <LinearGradient
        colors={timeColors.gradient}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <PaperTexture opacity={0.025} />
        <SafeAreaView edges={['top']} className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header with breathing orb */}
            <View className="relative overflow-hidden px-6 pt-6 pb-10">
              <BreathingOrb />

              {/* Calendar button */}
              <Animated.View
                entering={FadeInDown.delay(50).springify()}
                className="absolute top-6 right-6 z-10"
              >
                <Pressable
                  onPress={() => {
                    Haptics.lightTap();
                    router.push('/calendar');
                  }}
                  className="w-10 h-10 rounded-full bg-white/60 items-center justify-center"
                  style={{
                    shadowColor: '#2D2A26',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
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
                  className="text-4xl text-stone-800 mb-2"
                >
                  {getGreeting(userName)}
                </Text>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_400Regular_Italic' }}
                  className="text-stone-500 text-lg"
                >
                  {getTimeContext()}
                </Text>
              </Animated.View>

              {gentleStats && (
                <Animated.View
                  entering={FadeInDown.delay(200).springify()}
                  className="mt-5"
                >
                  <Text
                    style={{ fontFamily: 'DMSans_400Regular' }}
                    className="text-stone-400 text-sm"
                  >
                    {gentleStats.message}
                  </Text>
                </Animated.View>
              )}
            </View>

            {/* Quick Actions */}
            <View className="px-6 mb-8">
              <Animated.Text
                entering={FadeInDown.delay(250).springify()}
                style={{ fontFamily: 'DMSans_500Medium' }}
                className="text-stone-500 text-xs uppercase tracking-wider mb-4"
              >
                Start journaling
              </Animated.Text>

              <View className="flex-row gap-4">
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
                  Haptics.lightTap();
                  router.push('/prompts');
                }}
                className="mt-4 rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={['#F5F2EE', '#EBE6E0']}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 18,
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
                        style={{ fontFamily: 'DMSans_500Medium' }}
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

              {/* Chat with Coach Button */}
              <AnimatedPressable
                entering={FadeInUp.delay(450).springify()}
                onPress={() => {
                  Haptics.lightTap();
                  router.push('/voice-coach');
                }}
                className="mt-4 rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={['#E8EDE6', '#D4DDD0']}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 18,
                    justifyContent: 'space-between',
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-white/50 items-center justify-center mr-3">
                      <MessageCircle size={20} color="#5C6B56" strokeWidth={2} />
                    </View>
                    <View>
                      <Text
                        style={{ fontFamily: 'DMSans_500Medium' }}
                        className="text-stone-700 text-base"
                      >
                        Talk it Through
                      </Text>
                      <Text
                        style={{ fontFamily: 'DMSans_400Regular' }}
                        className="text-stone-500 text-xs"
                      >
                        Guided voice conversation
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#7C8B75" />
                </LinearGradient>
              </AnimatedPressable>
            </View>

            {/* Recent Entries */}
            <View className="px-6">
              <Animated.View
                entering={FadeInDown.delay(350).springify()}
                className="flex-row items-center justify-between mb-4"
              >
                <Text
                  style={{ fontFamily: 'DMSans_500Medium' }}
                  className="text-stone-500 text-xs uppercase tracking-wider"
                >
                  Recent entries
                </Text>
                {hasMoreEntries && (
                  <Pressable onPress={() => {
                    Haptics.lightTap();
                    router.push('/entries');
                  }}>
                    <Text
                      style={{ fontFamily: 'DMSans_500Medium', color: '#C4775A' }}
                      className="text-xs"
                    >
                      View all
                    </Text>
                  </Pressable>
                )}
              </Animated.View>

              {hasEntries ? (
                recentEntries.map((entry, index) => (
                  <EntryPreview key={entry.id} entry={entry} index={index} />
                ))
              ) : (
                <Animated.View
                  entering={FadeInDown.delay(400).springify()}
                  className="bg-white/80 rounded-2xl p-8 items-center"
                  style={{
                    shadowColor: '#2D2A26',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 12,
                    elevation: 2,
                  }}
                >
                  <View className="w-16 h-16 rounded-full bg-stone-100 items-center justify-center mb-5">
                    <PenLine size={28} color="#9C9690" strokeWidth={1.5} />
                  </View>
                  <Text
                    style={{ fontFamily: 'CormorantGaramond_500Medium_Italic' }}
                    className="text-stone-600 text-xl text-center mb-2"
                  >
                    Your journal awaits
                  </Text>
                  <Text
                    style={{ fontFamily: 'DMSans_400Regular' }}
                    className="text-stone-400 text-sm text-center"
                  >
                    No pressure. Start whenever you're ready.
                  </Text>
                </Animated.View>
              )}
            </View>

            {/* Insights Section */}
            {insights.length > 0 && (
              <View className="px-6 mt-8">
                <Animated.View
                  entering={FadeInDown.delay(450).springify()}
                  className="mb-4"
                >
                  <Text
                    style={{ fontFamily: 'DMSans_500Medium' }}
                    className="text-stone-500 text-xs uppercase tracking-wider"
                  >
                    Patterns & Insights
                  </Text>
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.delay(480).springify()}
                  className="bg-amber-50/60 border border-amber-100/50 rounded-xl px-4 py-3 mb-5"
                >
                  <Text
                    style={{ fontFamily: 'DMSans_400Regular' }}
                    className="text-amber-700/80 text-xs leading-5"
                  >
                    Based on your recent entries, here's what we've noticed.
                  </Text>
                </Animated.View>

                {insights.map((insight, index) => (
                  <InsightCard key={insight.id} insight={insight} index={index} />
                ))}
              </View>
            )}

            {/* Loading insights indicator */}
            {loadingInsights && entries.length >= 10 && (
              <View className="px-6 mt-8">
                <View className="bg-stone-100/60 rounded-2xl p-5 items-center">
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
              <View className="px-6 mt-8">
                <Animated.View
                  entering={FadeInDown.delay(450).springify()}
                  className="bg-stone-100/60 rounded-2xl p-5"
                >
                  <View className="flex-row items-center mb-2">
                    <TrendingUp size={16} color="#9C9690" strokeWidth={2} />
                    <Text
                      style={{ fontFamily: 'DMSans_500Medium' }}
                      className="text-stone-500 text-sm ml-2"
                    >
                      Insights coming soon
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: 'DMSans_400Regular' }}
                    className="text-stone-400 text-xs leading-5"
                  >
                    After {10 - entries.length} more {10 - entries.length === 1 ? 'entry' : 'entries'}, we'll start identifying patterns to help you understand yourself better.
                  </Text>
                </Animated.View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
