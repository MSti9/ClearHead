import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { BrainLogo } from './BrainLogo';

export function LoadingScreen() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) })
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
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#FDF8F5', '#F5E6DC', '#E8D4C8']}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Animated.View style={animatedStyle}>
          <BrainLogo size={100} showBackground={true} />
        </Animated.View>

        <Text
          style={{
            fontFamily: 'CormorantGaramond_600SemiBold',
            fontSize: 32,
            color: '#44403C',
            marginTop: 24,
          }}
        >
          Clearhead
        </Text>
      </LinearGradient>
    </View>
  );
}
