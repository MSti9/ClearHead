import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from '@/lib/haptics';

/**
 * Placeholder for Mode 2 (Talk It Through — live voice-back).
 *
 * Mode 2 isn't built yet. This screen exists only so the "Keep talking"
 * tertiary button on the reflection screen has somewhere to go without
 * crashing. When Mode 2 lands, replace this file with the real flow.
 */
export default function KeepTalkingPlaceholderScreen() {
  const router = useRouter();

  const handleClose = () => {
    Haptics.lightTap();
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#FAF8F5' }}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <Animated.View
          entering={FadeIn.delay(80)}
          className="flex-row items-center justify-between px-6 py-4"
        >
          <Pressable
            onPress={handleClose}
            className="w-10 h-10 rounded-full bg-stone-100 items-center justify-center"
            accessibilityLabel="Close"
          >
            <X size={20} color="#78716C" strokeWidth={2} />
          </Pressable>
          <View className="w-10" />
        </Animated.View>

        <View className="flex-1 items-center justify-center px-8">
          <Animated.View entering={FadeInDown.delay(120).springify()}>
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
              className="text-3xl text-stone-800 text-center mb-4"
            >
              Not here yet.
            </Text>
            <Text
              style={{ fontFamily: 'DMSans_400Regular' }}
              className="text-stone-500 text-base text-center leading-6"
            >
              A back-and-forth mode is coming. For now, the one-pass dump is the loop.
            </Text>
          </Animated.View>

          <Pressable
            onPress={handleClose}
            className="mt-10 py-3.5 px-8 rounded-2xl"
            style={{ backgroundColor: '#7C8B75' }}
          >
            <Text
              style={{ fontFamily: 'DMSans_500Medium' }}
              className="text-white text-base"
            >
              Back home
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
