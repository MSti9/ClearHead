import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mic, PenLine, Sparkles, ChevronRight, Calendar, MessageCircle } from 'lucide-react-native';
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
import { format, isToday, isYesterday } from 'date-fns';
import { PaperTexture } from '@/components/PaperTexture';

// Time-of-day color palettes for warm minimalism
function getTimeOfDayColors(): { gradient: [string, string]; accent: string; orbColors: [string, string, string] } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 9) {
    return {
      gradient: ['#FDF8F5', '#FAF0EA'],
      accent: '#D4A088',
      orbColors: ['#E8B4A0', '#D4A088', '#F5DDD0'],
    };
  } else if (hour >= 9 && hour < 12) {
    return {
      gradient: ['#FDFBF7', '#FAF6F0'],
      accent: '#C4775A',
      orbColors: ['#C4775A', '#D4A088', '#E8CFC0'],
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      gradient: ['#FAF8F5', '#F5F2EE'],
      accent: '#8B7355',
      orbColors: ['#B8A08A', '#C9B8A5', '#DDD0C4'],
    };
  } else if (hour >= 17 && hour < 20) {
    return {
      gradient: ['#FBF6F0', '#F8EEE4'],
      accent: '#C4775A',
      orbColors: ['#D4886A', '#C9A080', '#E8D4C4'],
    };
  } else {
    return {
      gradient: ['#F8F6F4', '#F2EFED'],
      accent: '#7C8B75',
      orbColors: ['#9CA8A0', '#B4BEB8', '#CED6D2'],
    };
  }
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getGreeting(userName?: string | null): string {
  if (userName) return `Hey, ${userName}`;

  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatEntryDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
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

export default function HomeScreen() {
  const router = useRouter();
  const entries = useJournalStore((s) => s.entries);
  const userName = useJournalStore((s) => s.userName);

  const recentEntries = entries.slice(0, 5);
  const hasEntries = entries.length > 0;
  const hasMoreEntries = entries.length > 5;
  const timeColors = getTimeOfDayColors();

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
                  What do you need to get out?
                </Text>
                <Text
                  style={{ fontFamily: 'DMSans_400Regular' }}
                  className="text-stone-400 text-sm mt-5"
                >
                  No streaks. No pressure. Just a place to put the thought.
                </Text>
              </Animated.View>
            </View>

            {/* Quick Actions */}
            <View className="px-6 mb-8">
              <View className="flex-row gap-4">
                <QuickAction
                  icon={<Mic size={20} color="white" strokeWidth={2} />}
                  label="Talk it out"
                  sublabel="say what's stuck"
                  onPress={() => router.push('/record')}
                  delay={300}
                  colors={['#C4775A', '#D4A088']}
                />
                <QuickAction
                  icon={<PenLine size={20} color="white" strokeWidth={2} />}
                  label="Write it down"
                  sublabel="type the mess"
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
                        Need a nudge?
                      </Text>
                      <Text
                        style={{ fontFamily: 'DMSans_400Regular' }}
                        className="text-stone-500 text-xs"
                      >
                        Browse simple starters
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9C9690" />
                </LinearGradient>
              </AnimatedPressable>

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
                        Clean reflection
                      </Text>
                      <Text
                        style={{ fontFamily: 'DMSans_400Regular' }}
                        className="text-stone-500 text-xs"
                      >
                        Talk through what's stuck
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
                  Recent dumps
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
                    Nothing saved yet
                  </Text>
                  <Text
                    style={{ fontFamily: 'DMSans_400Regular' }}
                    className="text-stone-400 text-sm text-center"
                  >
                    Say it, clean it up, then decide whether to keep it.
                  </Text>
                </Animated.View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
