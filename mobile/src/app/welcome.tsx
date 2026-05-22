import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useJournalStore } from '@/stores/journalStore';
import * as Haptics from '@/lib/haptics';
import { BrainLogo } from '@/components/BrainLogo';
import { SpillwayColors } from '@/lib/spillwayColors';

function WelcomeOrb() {
  const scale = useSharedValue(1);
  // Subtle "pilot light, not a construction sign" — kept low against the
  // graphite background so the orb reads as ambient warmth, not a focal point.
  const opacity = useSharedValue(0.15);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.15, { duration: 6000, easing: Easing.inOut(Easing.ease) })
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
          top: '15%',
          alignSelf: 'center',
          width: 280,
          height: 280,
          borderRadius: 140,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[SpillwayColors.ember, SpillwayColors.amber, SpillwayColors.charcoal]}
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

export default function WelcomeScreen() {
  const router = useRouter();
  const setUserName = useJournalStore((s) => s.setUserName);
  const [name, setName] = useState('');
  const inputRef = useRef<TextInput>(null);

  const canContinue = name.trim().length > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (!canContinue) return;

    Haptics.success();
    Keyboard.dismiss();
    setUserName(name.trim());
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={[SpillwayColors.graphite, SpillwayColors.charcoal]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView className="flex-1">
          <Pressable
            className="flex-1"
            onPress={() => Keyboard.dismiss()}
          >
            <WelcomeOrb />

            {/* Main content container with proper spacing */}
            <View className="flex-1 justify-between px-8 pt-12 pb-8">
              {/* Top section - all form content */}
              <View className="flex-1 justify-center">
                <Animated.View
                  entering={FadeInDown.delay(300).duration(800)}
                  className="items-center"
                >
                  {/* Brain Logo */}
                  <View className="mb-4">
                    <BrainLogo size={80} showBackground={false} />
                  </View>

                  <Text
                    style={{
                      fontFamily: 'DMSans_600SemiBold',
                      color: SpillwayColors.textLight,
                      fontSize: 30,
                      letterSpacing: -0.5,
                      textAlign: 'center',
                      marginBottom: 8,
                    }}
                  >
                    Spillway
                  </Text>

                  <Text
                    style={{
                      fontFamily: 'DMSans_400Regular',
                      color: SpillwayColors.mutedText,
                      fontSize: 14,
                      textAlign: 'center',
                      marginBottom: 32,
                    }}
                  >
                    Brain dumps, cleaned up.
                  </Text>

                  <Text
                    style={{
                      fontFamily: 'DMSans_500Medium',
                      color: SpillwayColors.bone,
                      fontSize: 17,
                      textAlign: 'center',
                      marginBottom: 24,
                    }}
                  >
                    What's your name?
                  </Text>

                  <TextInput
                    ref={inputRef}
                    value={name}
                    onChangeText={setName}
                    onSubmitEditing={handleContinue}
                    placeholder=""
                    placeholderTextColor={SpillwayColors.mutedText}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="done"
                    style={{
                      fontFamily: 'DMSans_500Medium',
                      fontSize: 24,
                      color: SpillwayColors.textLight,
                      textAlign: 'center',
                      width: '100%',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: SpillwayColors.border,
                      marginBottom: 80,
                    }}
                  />
                </Animated.View>
              </View>

              {/* Bottom section - Continue button */}
              <Animated.View entering={FadeIn.delay(600).duration(500)}>
                <Pressable
                  onPress={handleContinue}
                  disabled={!canContinue}
                  className="py-4 rounded-2xl items-center"
                  style={{
                    backgroundColor: canContinue ? SpillwayColors.ember : SpillwayColors.charcoal,
                    borderWidth: 1,
                    borderColor: canContinue ? SpillwayColors.ember : SpillwayColors.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'DMSans_600SemiBold',
                      fontSize: 16,
                      color: canContinue ? SpillwayColors.textLight : SpillwayColors.mutedText,
                    }}
                    selectable={false}
                  >
                    Continue
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
