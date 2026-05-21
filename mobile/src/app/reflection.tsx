import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, LifeBuoy, Phone } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useMutation } from '@tanstack/react-query';
import { reflectOnDump, type ReflectionResponse } from '@/lib/apiClient';
import { useJournalStore } from '@/stores/journalStore';
import * as Haptics from '@/lib/haptics';

type EntryTypeParam = 'text' | 'voice' | 'prompted';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Mode 1 reflection screen — the shared ending of "Get It Out".
 *
 * Flow:
 * 1. Mount → show "Cleaning up the mess…" loader
 * 2. Backend returns the 5-field reflection contract
 * 3. Render the 3 sections in staggered fade-ins
 * 4. Three buttons:
 *    - Let it go (primary, discards, dissolves the screen)
 *    - Save it (secondary, stores the reflection)
 *    - Keep talking (tertiary, routes to Mode 2 placeholder)
 *
 * Safety branch: when reflection.safety_flag === true, Let it go is hidden,
 * support_message is shown prominently, and the primary exit is "I'm safe right now".
 */
export default function ReflectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    dump?: string;
    type?: EntryTypeParam;
    promptUsed?: string;
    voiceDuration?: string;
  }>();

  const addEntry = useJournalStore((s) => s.addEntry);

  const dump = (params.dump || '').toString();
  const entryType: EntryTypeParam = (params.type as EntryTypeParam) || 'text';
  const promptUsed = params.promptUsed ? String(params.promptUsed) : undefined;
  const voiceDuration = params.voiceDuration ? Number(params.voiceDuration) : undefined;

  const [isDissolving, setIsDissolving] = useState(false);
  const fadeOpacity = useSharedValue(1);
  const dimOpacity = useSharedValue(0);

  const mutation = useMutation<ReflectionResponse, Error, string>({
    mutationFn: (text: string) => reflectOnDump(text),
  });

  useEffect(() => {
    if (!dump.trim()) {
      // No dump — bounce home defensively.
      router.replace('/(tabs)');
      return;
    }
    mutation.mutate(dump);
    // We only want to fire once on mount with the initial dump.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reflection = mutation.data;
  const isLoading = mutation.isPending;
  const error = mutation.error;
  const isSafety = reflection?.safety_flag === true;

  const handleClose = () => {
    Haptics.lightTap();
    router.replace('/(tabs)');
  };

  const handleRetry = () => {
    Haptics.lightTap();
    if (dump.trim()) mutation.mutate(dump);
  };

  const handleSave = () => {
    if (!reflection) return;
    Haptics.success();
    addEntry({
      content: dump,
      type: entryType,
      promptUsed,
      voiceDuration,
      reflection: {
        what_you_said: reflection.what_you_said,
        whats_underneath: reflection.whats_underneath,
        let_go_of: reflection.let_go_of,
      },
    });
    router.replace('/(tabs)');
  };

  const handleLetItGo = () => {
    if (!reflection) return;
    Haptics.mediumTap();
    setIsDissolving(true);
    // Reflection dissolves first, then the screen darkens, then we leave.
    fadeOpacity.value = withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) });
    dimOpacity.value = withDelay(
      400,
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700 })
      )
    );
    // NOTHING is saved. Just leave.
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 1800);
  };

  const handleKeepTalking = () => {
    if (!reflection) return;
    Haptics.lightTap();
    router.replace({
      pathname: '/keep-talking',
      params: { dump },
    });
  };

  const handleSafeExit = () => {
    Haptics.lightTap();
    router.replace('/(tabs)');
  };

  const reflectionStyle = useAnimatedStyle(() => ({ opacity: fadeOpacity.value }));
  const dimStyle = useAnimatedStyle(() => ({ opacity: dimOpacity.value }));

  return (
    <View className="flex-1" style={{ backgroundColor: '#FAF8F5' }}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        {/* Close (hidden during dissolve) */}
        {!isDissolving && (
          <Animated.View
            entering={FadeIn.delay(100)}
            className="flex-row items-center justify-between px-6 py-4"
          >
            <Pressable
              onPress={handleClose}
              disabled={isLoading}
              className="w-10 h-10 rounded-full bg-stone-100 items-center justify-center"
              style={{ opacity: isLoading ? 0.4 : 1 }}
              accessibilityLabel="Close"
            >
              <X size={20} color="#78716C" strokeWidth={2} />
            </Pressable>
            <View className="w-10" />
          </Animated.View>
        )}

        {/* Loading */}
        {isLoading && (
          <Animated.View
            entering={FadeIn.delay(50)}
            className="flex-1 items-center justify-center px-8"
          >
            <ActivityIndicator size="large" color="#C4775A" />
            <Text
              style={{ fontFamily: 'CormorantGaramond_500Medium' }}
              className="text-2xl text-stone-600 text-center mt-6"
            >
              Cleaning up the mess…
            </Text>
            <Text
              style={{ fontFamily: 'DMSans_400Regular' }}
              className="text-stone-400 text-sm text-center mt-2"
            >
              A few seconds.
            </Text>
          </Animated.View>
        )}

        {/* Error */}
        {!!error && !isLoading && (
          <Animated.View
            entering={FadeIn}
            className="flex-1 items-center justify-center px-8"
          >
            <Text
              style={{ fontFamily: 'CormorantGaramond_500Medium' }}
              className="text-2xl text-stone-700 text-center mb-3"
            >
              Couldn't clean it up.
            </Text>
            <Text
              style={{ fontFamily: 'DMSans_400Regular' }}
              className="text-stone-500 text-center mb-8"
            >
              Connection hiccup. The words you said are still here — try again.
            </Text>
            <Pressable
              onPress={handleRetry}
              className="py-3 px-8 rounded-2xl"
              style={{ backgroundColor: '#7C8B75' }}
            >
              <Text
                style={{ fontFamily: 'DMSans_500Medium' }}
                className="text-white text-base"
              >
                Try again
              </Text>
            </Pressable>
            <Pressable onPress={handleClose} className="mt-4 py-2 px-4">
              <Text
                style={{ fontFamily: 'DMSans_400Regular' }}
                className="text-stone-400 text-sm"
              >
                Back home
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Reflection */}
        {reflection && !isLoading && !error && (
          <Animated.View style={[{ flex: 1 }, reflectionStyle]}>
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <Animated.View entering={FadeInDown.delay(80).springify()} className="mb-8">
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                  className="text-3xl text-stone-800"
                >
                  Here's what I heard.
                </Text>
              </Animated.View>

              {/* Safety message (when triggered) — surfaced before the 3 sections
                  so the support routing is impossible to miss. */}
              {isSafety && reflection.support_message && (
                <Animated.View
                  entering={FadeInDown.delay(140).springify()}
                  className="rounded-2xl p-5 mb-8"
                  style={{ backgroundColor: '#FEF3EE', borderWidth: 1, borderColor: '#E8C9B8' }}
                >
                  <View className="flex-row items-center mb-3">
                    <LifeBuoy size={18} color="#B45F40" strokeWidth={2} />
                    <Text
                      style={{ fontFamily: 'DMSans_500Medium' }}
                      className="text-stone-700 text-xs uppercase tracking-wider ml-2"
                    >
                      Support
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: 'DMSans_400Regular' }}
                    className="text-stone-700 text-base leading-6"
                  >
                    {reflection.support_message}
                  </Text>
                </Animated.View>
              )}

              {/* Section 1: What you said */}
              <Animated.View entering={FadeInDown.delay(220).springify()} className="mb-8">
                <Text
                  style={{ fontFamily: 'DMSans_500Medium' }}
                  className="text-stone-400 text-xs uppercase tracking-wider mb-2"
                >
                  What you said
                </Text>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                  className="text-stone-800 text-xl leading-8"
                >
                  {reflection.what_you_said}
                </Text>
              </Animated.View>

              {/* Section 2: What's underneath */}
              <Animated.View entering={FadeInDown.delay(560).springify()} className="mb-8">
                <Text
                  style={{ fontFamily: 'DMSans_500Medium' }}
                  className="text-stone-400 text-xs uppercase tracking-wider mb-2"
                >
                  What's underneath
                </Text>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                  className="text-stone-800 text-xl leading-8"
                >
                  {reflection.whats_underneath}
                </Text>
              </Animated.View>

              {/* Section 3: One thing to let go — hidden when safety_flag */}
              {!isSafety && reflection.let_go_of && (
                <Animated.View entering={FadeInDown.delay(900).springify()} className="mb-4">
                  <Text
                    style={{ fontFamily: 'DMSans_500Medium' }}
                    className="text-stone-400 text-xs uppercase tracking-wider mb-2"
                  >
                    One thing to let go
                  </Text>
                  <Text
                    style={{ fontFamily: 'CormorantGaramond_500Medium_Italic' }}
                    className="text-stone-700 text-xl leading-8"
                  >
                    {reflection.let_go_of}
                  </Text>
                </Animated.View>
              )}
            </ScrollView>

            {/* Action buttons */}
            <Animated.View
              entering={FadeInDown.delay(isSafety ? 400 : 1200).springify()}
              className="px-6 pb-4"
            >
              {isSafety ? (
                // Safety branch: no Let it go. Primary action is the safe exit.
                <View className="gap-3">
                  <Pressable
                    onPress={handleSafeExit}
                    className="py-4 rounded-2xl flex-row items-center justify-center"
                    style={{ backgroundColor: '#C4775A' }}
                    accessibilityLabel="I'm safe right now"
                  >
                    <Phone size={18} color="white" strokeWidth={2} />
                    <Text
                      style={{ fontFamily: 'DMSans_600SemiBold' }}
                      className="text-white text-base ml-2"
                    >
                      I'm safe right now
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSave}
                    className="py-3.5 rounded-2xl"
                    style={{ backgroundColor: '#F0EBE5' }}
                    accessibilityLabel="Save it"
                  >
                    <Text
                      style={{ fontFamily: 'DMSans_500Medium' }}
                      className="text-stone-700 text-center text-base"
                    >
                      Save it
                    </Text>
                  </Pressable>
                  <Pressable onPress={handleSafeExit} className="py-2">
                    <Text
                      style={{ fontFamily: 'DMSans_400Regular' }}
                      className="text-stone-400 text-center text-sm"
                    >
                      Close
                    </Text>
                  </Pressable>
                </View>
              ) : (
                // Standard ending: Let it go (primary) → Save it → Keep talking.
                <View>
                  <AnimatedPressable
                    onPress={handleLetItGo}
                    className="py-5 rounded-2xl mb-3"
                    style={{ backgroundColor: '#C4775A' }}
                    accessibilityLabel="Let it go"
                  >
                    <Text
                      style={{ fontFamily: 'DMSans_600SemiBold' }}
                      className="text-white text-center text-lg"
                    >
                      Let it go
                    </Text>
                  </AnimatedPressable>
                  <Pressable
                    onPress={handleSave}
                    className="py-3 rounded-2xl mb-2"
                    style={{ backgroundColor: '#F0EBE5' }}
                    accessibilityLabel="Save it"
                  >
                    <Text
                      style={{ fontFamily: 'DMSans_500Medium' }}
                      className="text-stone-700 text-center text-base"
                    >
                      Save it
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleKeepTalking}
                    className="py-2"
                    accessibilityLabel="Keep talking"
                  >
                    <Text
                      style={{ fontFamily: 'DMSans_400Regular' }}
                      className="text-stone-400 text-center text-sm"
                    >
                      Keep talking
                    </Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          </Animated.View>
        )}

        {/* Dissolve overlay — fades in over the screen on Let it go, then a short closing line. */}
        {isDissolving && (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#1F1B17',
                alignItems: 'center',
                justifyContent: 'center',
              },
              dimStyle,
            ]}
          >
            <Animated.Text
              entering={FadeIn.delay(700).duration(500)}
              exiting={FadeOut.duration(300)}
              style={{
                fontFamily: 'CormorantGaramond_500Medium_Italic',
                color: '#F0EBE5',
                fontSize: 28,
              }}
            >
              Put down.
            </Animated.Text>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}
