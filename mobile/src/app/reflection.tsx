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
import { SpillwayColors } from '@/lib/spillwayColors';

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
    // Reflection dissolves, screen darkens to graphite, the v4-locked
    // "Gone. / Nothing saved. Nothing to reopen." appears, then we leave.
    // Timing budget is set so the subcopy is on screen long enough to read.
    fadeOpacity.value = withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) });
    dimOpacity.value = withDelay(
      400,
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000 })
      )
    );
    // NOTHING is saved. Just leave.
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 3000);
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
    <View className="flex-1" style={{ backgroundColor: SpillwayColors.graphite }}>
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
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: SpillwayColors.charcoal,
                borderWidth: 1,
                borderColor: SpillwayColors.border,
                opacity: isLoading ? 0.4 : 1,
              }}
              accessibilityLabel="Close"
            >
              <X size={20} color={SpillwayColors.mutedText} strokeWidth={2} />
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
            <ActivityIndicator size="large" color={SpillwayColors.ember} />
            <Text
              style={{
                fontFamily: 'DMSans_500Medium',
                color: SpillwayColors.bone,
                fontSize: 20,
                textAlign: 'center',
                marginTop: 24,
              }}
            >
              Cleaning up the mess…
            </Text>
            <Text
              style={{
                fontFamily: 'DMSans_400Regular',
                color: SpillwayColors.mutedText,
                fontSize: 13,
                textAlign: 'center',
                marginTop: 8,
              }}
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
              style={{
                fontFamily: 'DMSans_500Medium',
                color: SpillwayColors.bone,
                fontSize: 20,
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              Couldn't clean it up.
            </Text>
            <Text
              style={{
                fontFamily: 'DMSans_400Regular',
                color: SpillwayColors.mutedText,
                textAlign: 'center',
                marginBottom: 32,
              }}
            >
              Connection hiccup. The words you said are still here — try again.
            </Text>
            <Pressable
              onPress={handleRetry}
              className="py-3 px-8 rounded-2xl"
              style={{ backgroundColor: SpillwayColors.ember }}
            >
              <Text
                style={{ fontFamily: 'DMSans_500Medium', color: SpillwayColors.textLight, fontSize: 16 }}
              >
                Try again
              </Text>
            </Pressable>
            <Pressable onPress={handleClose} className="mt-4 py-2 px-4">
              <Text
                style={{
                  fontFamily: 'DMSans_400Regular',
                  color: SpillwayColors.mutedText,
                  fontSize: 13,
                }}
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
                  style={{
                    fontFamily: 'DMSans_600SemiBold',
                    color: SpillwayColors.textLight,
                    fontSize: 28,
                    letterSpacing: -0.5,
                  }}
                >
                  The clear version.
                </Text>
              </Animated.View>

              {/* Safety message (when triggered) — surfaced before the 3 sections
                  so the support routing is impossible to miss. v4 tone:
                  held, not alarmed. Dark warm surface, amber accent. */}
              {isSafety && reflection.support_message && (
                <Animated.View
                  entering={FadeInDown.delay(140).springify()}
                  className="rounded-2xl p-5 mb-8"
                  style={{
                    backgroundColor: SpillwayColors.safetySurface,
                    borderWidth: 1,
                    borderColor: SpillwayColors.safetyBorder,
                  }}
                >
                  <View className="flex-row items-center mb-3">
                    <LifeBuoy size={18} color={SpillwayColors.safetyAccent} strokeWidth={2} />
                    <Text
                      style={{
                        fontFamily: 'DMSans_500Medium',
                        color: SpillwayColors.safetyAccent,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1.2,
                        marginLeft: 8,
                      }}
                    >
                      Support
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'DMSans_400Regular',
                      color: SpillwayColors.bone,
                      fontSize: 16,
                      lineHeight: 24,
                    }}
                  >
                    {reflection.support_message}
                  </Text>
                </Animated.View>
              )}

              {/* Section 1: What you said */}
              <Animated.View entering={FadeInDown.delay(220).springify()} className="mb-8">
                <Text
                  style={{
                    fontFamily: 'DMSans_500Medium',
                    color: SpillwayColors.mutedText,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.4,
                    marginBottom: 8,
                  }}
                >
                  What you said
                </Text>
                <Text
                  style={{
                    fontFamily: 'DMSans_500Medium',
                    color: SpillwayColors.bone,
                    fontSize: 19,
                    lineHeight: 30,
                  }}
                >
                  {reflection.what_you_said}
                </Text>
              </Animated.View>

              {/* Section 2: What's underneath */}
              <Animated.View entering={FadeInDown.delay(560).springify()} className="mb-8">
                <Text
                  style={{
                    fontFamily: 'DMSans_500Medium',
                    color: SpillwayColors.mutedText,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.4,
                    marginBottom: 8,
                  }}
                >
                  What's underneath
                </Text>
                <Text
                  style={{
                    fontFamily: 'DMSans_500Medium',
                    color: SpillwayColors.bone,
                    fontSize: 19,
                    lineHeight: 30,
                  }}
                >
                  {reflection.whats_underneath}
                </Text>
              </Animated.View>

              {/* Section 3: What to put down — hidden when safety_flag */}
              {!isSafety && reflection.let_go_of && (
                <Animated.View entering={FadeInDown.delay(900).springify()} className="mb-4">
                  <Text
                    style={{
                      fontFamily: 'DMSans_500Medium',
                      color: SpillwayColors.mutedText,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: 1.4,
                      marginBottom: 8,
                    }}
                  >
                    What to put down
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'DMSans_400Regular',
                      color: SpillwayColors.bone,
                      fontSize: 19,
                      lineHeight: 30,
                    }}
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
                    style={{ backgroundColor: SpillwayColors.ember }}
                    accessibilityLabel="I'm safe right now"
                  >
                    <Phone size={18} color={SpillwayColors.textLight} strokeWidth={2} />
                    <Text
                      style={{
                        fontFamily: 'DMSans_600SemiBold',
                        color: SpillwayColors.textLight,
                        fontSize: 16,
                        marginLeft: 8,
                      }}
                    >
                      I'm safe right now
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSave}
                    className="py-3.5 rounded-2xl"
                    style={{
                      backgroundColor: SpillwayColors.charcoal,
                      borderWidth: 1,
                      borderColor: SpillwayColors.border,
                    }}
                    accessibilityLabel="Save it"
                  >
                    <Text
                      style={{
                        fontFamily: 'DMSans_500Medium',
                        color: SpillwayColors.bone,
                        fontSize: 16,
                        textAlign: 'center',
                      }}
                    >
                      Save it
                    </Text>
                  </Pressable>
                  <Pressable onPress={handleSafeExit} className="py-2">
                    <Text
                      style={{
                        fontFamily: 'DMSans_400Regular',
                        color: SpillwayColors.mutedText,
                        fontSize: 13,
                        textAlign: 'center',
                      }}
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
                    style={{ backgroundColor: SpillwayColors.ember }}
                    accessibilityLabel="Let it go"
                  >
                    <Text
                      style={{
                        fontFamily: 'DMSans_600SemiBold',
                        color: SpillwayColors.textLight,
                        fontSize: 18,
                        textAlign: 'center',
                      }}
                    >
                      Let it go
                    </Text>
                  </AnimatedPressable>
                  <Pressable
                    onPress={handleSave}
                    className="py-3 rounded-2xl mb-2"
                    style={{
                      backgroundColor: SpillwayColors.charcoal,
                      borderWidth: 1,
                      borderColor: SpillwayColors.border,
                    }}
                    accessibilityLabel="Save it"
                  >
                    <Text
                      style={{
                        fontFamily: 'DMSans_500Medium',
                        color: SpillwayColors.bone,
                        fontSize: 16,
                        textAlign: 'center',
                      }}
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
                      style={{
                        fontFamily: 'DMSans_400Regular',
                        color: SpillwayColors.mutedText,
                        fontSize: 13,
                        textAlign: 'center',
                      }}
                    >
                      Keep talking
                    </Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          </Animated.View>
        )}

        {/* Dissolve overlay — fades in over the screen on Let it go, then the
            v4-locked close: "Gone." with "Nothing saved. Nothing to reopen." */}
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
                backgroundColor: SpillwayColors.graphite,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 32,
              },
              dimStyle,
            ]}
          >
            <Animated.Text
              entering={FadeIn.delay(700).duration(500)}
              exiting={FadeOut.duration(300)}
              style={{
                fontFamily: 'DMSans_600SemiBold',
                color: SpillwayColors.textLight,
                fontSize: 32,
                letterSpacing: -0.5,
                textAlign: 'center',
              }}
            >
              Gone.
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(1100).duration(500)}
              exiting={FadeOut.duration(300)}
              style={{
                fontFamily: 'DMSans_400Regular',
                color: SpillwayColors.mutedText,
                fontSize: 14,
                marginTop: 12,
                textAlign: 'center',
              }}
            >
              Nothing saved. Nothing to reopen.
            </Animated.Text>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}
