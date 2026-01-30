import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mic, PenLine, Sparkles, ChevronRight } from 'lucide-react-native';
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
import * as Haptics from 'expo-haptics';
import { useJournalStore } from '@/stores/journalStore';
import { format, isToday, isYesterday } from 'date-fns';

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

export default function HomeScreen() {
  const router = useRouter();
  const entries = useJournalStore((s) => s.entries);
  const streak = useJournalStore((s) => s.streak);

  const recentEntries = entries.slice(0, 5);
  const hasEntries = entries.length > 0;

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

            {streak > 0 && (
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                className="mt-4 flex-row items-center"
              >
                <View className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full flex-row items-center">
                  <Text className="text-lg mr-1">✨</Text>
                  <Text
                    style={{ fontFamily: 'DMSans_500Medium' }}
                    className="text-amber-700 text-sm"
                  >
                    {streak} day streak
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
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
              {hasEntries && (
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
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
