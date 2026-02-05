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

function WelcomeOrb() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

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
        withTiming(0.45, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 6000, easing: Easing.inOut(Easing.ease) })
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
        colors={['#D4A088', '#E8CFC0', '#F5E6DC']}
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
        colors={['#FDF8F5', '#FAF4EF']}
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

            <View className="flex-1 justify-center px-8 pt-20">
              <Animated.View
                entering={FadeInDown.delay(300).duration(800)}
                className="items-center"
              >
                {/* Brain Logo */}
                <View className="mb-6">
                  <BrainLogo size={90} showBackground={false} />
                </View>

                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                  className="text-3xl text-stone-800 text-center mb-2"
                >
                  ClearHead
                </Text>

                <Text
                  style={{ fontFamily: 'CormorantGaramond_500Medium_Italic' }}
                  className="text-base text-stone-500 text-center mb-10"
                >
                  A calm space to clear your mind
                </Text>

                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                  className="text-2xl text-stone-700 text-center mb-8"
                >
                  What's your name?
                </Text>

                <TextInput
                  ref={inputRef}
                  value={name}
                  onChangeText={setName}
                  onSubmitEditing={handleContinue}
                  placeholder=""
                  placeholderTextColor="#C9C4BC"
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  style={{
                    fontFamily: 'CormorantGaramond_500Medium',
                    fontSize: 32,
                    color: '#44403C',
                    textAlign: 'center',
                    width: '100%',
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E8E4DE',
                  }}
                />
              </Animated.View>
            </View>

            {/* Continue button */}
            <Animated.View
              entering={FadeIn.delay(600).duration(500)}
              className="px-8 pb-8"
            >
              <Pressable
                onPress={handleContinue}
                disabled={!canContinue}
                className="py-4 rounded-2xl items-center"
                style={{
                  backgroundColor: canContinue ? '#7C8B75' : '#E8E4DE',
                }}
              >
                <Text
                  style={{ fontFamily: 'DMSans_500Medium' }}
                  className="text-base"
                  selectable={false}
                >
                  <Text style={{ color: canContinue ? 'white' : '#9C9690' }}>
                    Continue
                  </Text>
                </Text>
              </Pressable>
            </Animated.View>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
