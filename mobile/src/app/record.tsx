import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Mic, Square, Check, Pause, Play, RotateCcw } from 'lucide-react-native';
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
  cancelAnimation,
  withSpring,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import * as Haptics from '@/lib/haptics';
import { formatTranscription } from '@/lib/formatTranscription';
import { transcribeAudio } from '@/lib/apiClient';
import { SpillwayColors } from '@/lib/spillwayColors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function PulsingRing() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(0.6, { duration: 0 })
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
          width: 160,
          height: 160,
          borderRadius: 80,
          borderWidth: 3,
          borderColor: SpillwayColors.ember,
        },
        animatedStyle,
      ]}
    />
  );
}

function WaveformBar({ index, isRecording }: { index: number; isRecording: boolean }) {
  const height = useSharedValue(20);

  useEffect(() => {
    if (isRecording) {
      height.value = withRepeat(
        withSequence(
          withTiming(20 + Math.random() * 40, {
            duration: 200 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(20 + Math.random() * 20, {
            duration: 200 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(height);
      height.value = withSpring(20);
    }
  }, [isRecording, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 4,
          borderRadius: 2,
          backgroundColor: SpillwayColors.ember,
          marginHorizontal: 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function RecordScreen() {
  const router = useRouter();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const buttonScale = useSharedValue(1);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      Haptics.mediumTap();
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.log('Permission not granted');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setHasRecorded(true);
      setRecordingUri(null);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const pauseRecording = async () => {
    if (recordingRef.current) {
      Haptics.lightTap();
      if (isPaused) {
        await recordingRef.current.startAsync();
        timerRef.current = setInterval(() => {
          setDuration((d) => d + 1);
        }, 1000);
      } else {
        await recordingRef.current.pauseAsync();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = async () => {
    if (recordingRef.current) {
      Haptics.mediumTap();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      setRecordingUri(uri);
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const saveRecording = async () => {
    if (!recordingUri) return;

    Haptics.lightTap();
    setIsTranscribing(true);

    try {
      const rawTranscription = await transcribeAudio(recordingUri);
      const formattedText = await formatTranscription(rawTranscription);

      Haptics.success();
      // Hand the dump to the reflection screen. Storage is decided
      // there (Save it / Let it go), per the Mode 1 hero loop.
      router.replace({
        pathname: '/reflection',
        params: {
          dump: formattedText,
          type: 'voice',
          voiceDuration: String(duration),
        },
      });
    } catch (error) {
      console.error('Transcription failed:', error);
      // Surface a soft error and let the user re-record. We deliberately
      // do NOT push a "transcription unavailable" entry into history —
      // an unreflected, unconfirmed entry would violate the loop.
      setIsTranscribing(false);
      Haptics.warning();
      // Reset to a re-record state so the user can try again.
      setHasRecorded(false);
      setRecordingUri(null);
      setDuration(0);
      recordingRef.current = null;
      return;
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleMainButton = () => {
    buttonScale.value = withSequence(withSpring(0.9), withSpring(1));

    if (!isRecording && !hasRecorded) {
      startRecording();
    } else if (isRecording) {
      stopRecording();
    }
  };

  const handleClose = () => {
    Haptics.lightTap();
    router.back();
  };

  const handleReRecord = () => {
    Haptics.lightTap();
    setDuration(0);
    setHasRecorded(false);
    setRecordingUri(null);
    recordingRef.current = null;
  };

  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const getPromptText = () => {
    if (isTranscribing) return 'Cleaning up your brain dump...';
    if (!hasRecorded) return 'What do you need to get out?';
    if (isRecording) return 'Take your time...';
    return 'Ready to clean it up?';
  };

  const getSubText = () => {
    if (isTranscribing) return 'Formatting the mess into something clearer';
    if (!hasRecorded) return 'Tap to start talking';
    if (isRecording) return 'Say what is stuck. No one else will hear this.';
    return 'Your words will be cleaned up before saving';
  };

  return (
    <View className="flex-1" style={{ backgroundColor: SpillwayColors.graphite }}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        {/* Header */}
        <Animated.View
          entering={FadeIn.delay(100)}
          className="flex-row items-center justify-between px-6 py-4"
        >
          <Pressable
            onPress={handleClose}
            disabled={isTranscribing}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: SpillwayColors.charcoal,
              borderWidth: 1,
              borderColor: SpillwayColors.border,
              opacity: isTranscribing ? 0.5 : 1,
            }}
          >
            <X size={20} color={SpillwayColors.mutedText} strokeWidth={2} />
          </Pressable>
          <Text
            style={{
              fontFamily: 'DMSans_500Medium',
              color: SpillwayColors.mutedText,
              fontSize: 14,
            }}
          >
            Talk it out
          </Text>
          <View className="w-10" />
        </Animated.View>

        {/* Main Content */}
        <View className="flex-1 items-center justify-center px-6">
          {/* Prompt Text */}
          <Animated.View entering={FadeInDown.delay(200).springify()} className="items-center mb-12">
            <Text
              style={{
                fontFamily: 'DMSans_500Medium',
                color: SpillwayColors.bone,
                fontSize: 20,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              {getPromptText()}
            </Text>
            <Text
              style={{
                fontFamily: 'DMSans_400Regular',
                color: SpillwayColors.mutedText,
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              {getSubText()}
            </Text>
          </Animated.View>

          {/* Waveform */}
          {isRecording && (
            <Animated.View
              entering={FadeIn}
              className="flex-row items-center justify-center h-16 mb-8"
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <WaveformBar key={i} index={i} isRecording={isRecording && !isPaused} />
              ))}
            </Animated.View>
          )}

          {/* Transcribing indicator */}
          {isTranscribing && (
            <Animated.View entering={FadeIn} className="mb-8">
              <ActivityIndicator size="large" color={SpillwayColors.ember} />
            </Animated.View>
          )}

          {/* Duration */}
          <Animated.Text
            entering={FadeInDown.delay(300).springify()}
            style={{
              fontFamily: 'DMSans_600SemiBold',
              color: SpillwayColors.bone,
              fontSize: 36,
              marginBottom: 48,
              letterSpacing: -0.5,
            }}
          >
            {formatDuration(duration)}
          </Animated.Text>

          {/* Recording Button */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <View className="items-center justify-center">
              {isRecording && <PulsingRing />}
              <AnimatedPressable
                onPress={handleMainButton}
                disabled={isTranscribing || (!isRecording && hasRecorded)}
                style={[
                  mainButtonStyle,
                  { opacity: isTranscribing || (!isRecording && hasRecorded) ? 0.5 : 1 },
                ]}
              >
                <LinearGradient
                  colors={
                    isRecording
                      ? (['#9C3A2A', '#7A2A1F'] as [string, string])
                      : ([SpillwayColors.ember, SpillwayColors.amber] as [string, string])
                  }
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: 80,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isRecording ? (
                    <Square size={48} color={SpillwayColors.textLight} fill={SpillwayColors.textLight} strokeWidth={0} />
                  ) : (
                    <Mic size={48} color={SpillwayColors.textLight} strokeWidth={2} />
                  )}
                </LinearGradient>
              </AnimatedPressable>
            </View>
          </Animated.View>

          {/* Secondary Controls */}
          {hasRecorded && !isTranscribing && (
            <Animated.View
              entering={FadeInDown.delay(500).springify()}
              className="flex-row items-center mt-12 gap-6"
            >
              {isRecording && (
                <Pressable
                  onPress={pauseRecording}
                  className="w-14 h-14 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: SpillwayColors.charcoal,
                    borderWidth: 1,
                    borderColor: SpillwayColors.border,
                  }}
                >
                  {isPaused ? (
                    <Play size={24} color={SpillwayColors.bone} strokeWidth={2} />
                  ) : (
                    <Pause size={24} color={SpillwayColors.bone} strokeWidth={2} />
                  )}
                </Pressable>
              )}
              {!isRecording && hasRecorded && (
                <>
                  <Pressable
                    onPress={handleReRecord}
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: SpillwayColors.charcoal,
                      borderWidth: 1,
                      borderColor: SpillwayColors.border,
                    }}
                  >
                    <RotateCcw size={24} color={SpillwayColors.bone} strokeWidth={2} />
                  </Pressable>
                  <Pressable
                    onPress={saveRecording}
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{ backgroundColor: SpillwayColors.stoneSage }}
                  >
                    <Check size={24} color={SpillwayColors.textLight} strokeWidth={2.5} />
                  </Pressable>
                </>
              )}
            </Animated.View>
          )}
        </View>

        {/* Bottom hint */}
        <Animated.View entering={FadeInDown.delay(600).springify()} className="px-6 pb-6">
          <Text
            style={{
              fontFamily: 'DMSans_400Regular',
              color: SpillwayColors.mutedText,
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            {isTranscribing
              ? 'This usually takes a few seconds'
              : 'Your recordings stay on your device'}
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
