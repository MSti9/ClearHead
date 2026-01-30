import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Mic, Square, Check, Pause, Play, RotateCcw, Volume2, VolumeX, MessageCircle, SkipForward } from 'lucide-react-native';
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
  FadeOut,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { useJournalStore } from '@/stores/journalStore';
import { ttsService } from '@/lib/ttsService';
import { generateFollowUpQuestion, shouldShowFollowUp } from '@/lib/coachFollowUp';
import { formatTranscription } from '@/lib/formatTranscription';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function transcribeAudio(uri: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as unknown as Blob);
  formData.append('model', 'gpt-4o-mini-transcribe');
  formData.append('response_format', 'json');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Transcription error:', errorText);
    throw new Error('Transcription failed');
  }

  const result = await response.json();
  return result.text;
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
          borderColor: '#C4775A',
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
          backgroundColor: '#C4775A',
          marginHorizontal: 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function RecordScreen() {
  const router = useRouter();
  const addEntry = useJournalStore((s) => s.addEntry);
  const updateEntry = useJournalStore((s) => s.updateEntry);
  const entries = useJournalStore((s) => s.entries);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');

  // Coach follow-up states
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [isFollowUpResponse, setIsFollowUpResponse] = useState(false);

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
      // Stop any ongoing speech
      ttsService.stop();
    };
  }, []);

  const startRecording = async () => {
    try {
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

    setIsTranscribing(true);

    try {
      const rawTranscription = await transcribeAudio(recordingUri);

      // Format the transcription for better readability
      const formattedText = await formatTranscription(rawTranscription);
      setTranscription(formattedText);

      if (isFollowUpResponse && savedEntryId) {
        // Append to existing entry
        const existingEntry = entries.find((e) => e.id === savedEntryId);
        if (existingEntry) {
          updateEntry(savedEntryId, {
            content: `${existingEntry.content}\n\n---\n\n**Follow-up:**\n${formattedText}`,
          });
        }
        router.back();
      } else {
        // Create new entry
        const newEntry = addEntry({
          content: formattedText,
          type: 'voice',
          voiceDuration: duration,
        });

        // Store the entry ID for potential follow-up
        const entryId = entries[entries.length - 1]?.id || Date.now().toString();
        setSavedEntryId(entryId);

        // Check if we should show follow-up (use raw transcription for analysis)
        if (shouldShowFollowUp(entries.length)) {
          const question = generateFollowUpQuestion(rawTranscription);
          if (question) {
            setFollowUpQuestion(question);
            setShowFollowUp(true);

            // Speak the follow-up question
            setIsSpeaking(true);
            await ttsService.speak(question, {
              rate: 0.53,
              onDone: () => {
                setIsSpeaking(false);
              },
              onError: (error) => {
                console.error('TTS Error:', error);
                setIsSpeaking(false);
              },
            });
          } else {
            router.back();
          }
        } else {
          router.back();
        }
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      // Save without transcription as fallback
      addEntry({
        content: `Voice note (${formatDuration(duration)}) - Transcription unavailable. Please check your connection and try again.`,
        type: 'voice',
        voiceDuration: duration,
      });
      router.back();
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
    router.back();
  };

  const handleReRecord = () => {
    setDuration(0);
    setHasRecorded(false);
    setRecordingUri(null);
    recordingRef.current = null;
    setShowFollowUp(false);
    setFollowUpQuestion(null);
    setIsFollowUpResponse(false);
    ttsService.stop();
  };

  const handleSkipFollowUp = async () => {
    await ttsService.stop();
    setShowFollowUp(false);
    router.back();
  };

  const handleRespondToFollowUp = async () => {
    await ttsService.stop();
    setIsFollowUpResponse(true);
    setShowFollowUp(false);
    setHasRecorded(false);
    setDuration(0);
    setRecordingUri(null);
    // User can now record their response
  };

  const handleToggleSpeech = async () => {
    if (isSpeaking) {
      await ttsService.stop();
      setIsSpeaking(false);
    } else if (followUpQuestion) {
      setIsSpeaking(true);
      await ttsService.speak(followUpQuestion, {
        rate: 0.53,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const getPromptText = () => {
    if (isTranscribing) return 'Processing your words...';
    if (isFollowUpResponse && !hasRecorded) return 'Share more if you\'d like';
    if (isFollowUpResponse && isRecording) return 'I\'m listening...';
    if (!hasRecorded) return 'What is on your mind?';
    if (isRecording) return 'Take your time...';
    return 'Ready to save?';
  };

  const getSubText = () => {
    if (isTranscribing) return 'Transcribing and formatting for readability';
    if (isFollowUpResponse && !hasRecorded) return 'Tap to respond to the coach';
    if (isFollowUpResponse && isRecording) return 'Your response will be added to your entry';
    if (!hasRecorded) return 'Tap to start recording';
    if (isRecording) return 'Speak freely. No one else will hear this.';
    return 'Your words will be transcribed';
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#FAF8F5' }}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        {/* Header */}
        <Animated.View
          entering={FadeIn.delay(100)}
          className="flex-row items-center justify-between px-6 py-4"
        >
          <Pressable
            onPress={handleClose}
            disabled={isTranscribing}
            className="w-10 h-10 rounded-full bg-stone-100 items-center justify-center"
            style={{ opacity: isTranscribing ? 0.5 : 1 }}
          >
            <X size={20} color="#78716C" strokeWidth={2} />
          </Pressable>
          <Text style={{ fontFamily: 'DMSans_500Medium' }} className="text-stone-500">
            Voice Note
          </Text>
          <View className="w-10" />
        </Animated.View>

        {/* Main Content */}
        <View className="flex-1 items-center justify-center px-6">
          {/* Prompt Text */}
          <Animated.View entering={FadeInDown.delay(200).springify()} className="items-center mb-12">
            <Text
              style={{ fontFamily: 'CormorantGaramond_500Medium' }}
              className="text-2xl text-stone-600 text-center mb-2"
            >
              {getPromptText()}
            </Text>
            <Text
              style={{ fontFamily: 'DMSans_400Regular' }}
              className="text-stone-400 text-center"
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
              <ActivityIndicator size="large" color="#C4775A" />
            </Animated.View>
          )}

          {/* Duration */}
          <Animated.Text
            entering={FadeInDown.delay(300).springify()}
            style={{ fontFamily: 'DMSans_600SemiBold' }}
            className="text-4xl text-stone-700 mb-12"
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
                      ? (['#DC6B6B', '#C45C5C'] as [string, string])
                      : (['#C4775A', '#D4A088'] as [string, string])
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
                    <Square size={48} color="white" fill="white" strokeWidth={0} />
                  ) : (
                    <Mic size={48} color="white" strokeWidth={2} />
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
                  className="w-14 h-14 rounded-full bg-stone-200 items-center justify-center"
                >
                  {isPaused ? (
                    <Play size={24} color="#78716C" strokeWidth={2} />
                  ) : (
                    <Pause size={24} color="#78716C" strokeWidth={2} />
                  )}
                </Pressable>
              )}
              {!isRecording && hasRecorded && (
                <>
                  <Pressable
                    onPress={handleReRecord}
                    className="w-14 h-14 rounded-full bg-stone-200 items-center justify-center"
                  >
                    <RotateCcw size={24} color="#78716C" strokeWidth={2} />
                  </Pressable>
                  <Pressable
                    onPress={saveRecording}
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#7C8B75' }}
                  >
                    <Check size={24} color="white" strokeWidth={2.5} />
                  </Pressable>
                </>
              )}
            </Animated.View>
          )}
        </View>

        {/* Bottom hint */}
        {!showFollowUp && (
          <Animated.View entering={FadeInDown.delay(600).springify()} className="px-6 pb-6">
            <Text
              style={{ fontFamily: 'DMSans_400Regular' }}
              className="text-stone-400 text-xs text-center"
            >
              {isTranscribing
                ? 'This usually takes a few seconds'
                : isFollowUpResponse
                ? 'Your response will be added to your entry'
                : 'Your recordings stay on your device'}
            </Text>
          </Animated.View>
        )}

        {/* Coach Follow-Up Modal */}
        {showFollowUp && followUpQuestion && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            className="absolute inset-0 bg-black/40 items-center justify-center px-8"
          >
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
            >
              {/* Coach Icon */}
              <View className="items-center mb-4">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: '#E8EDE6' }}
                >
                  <MessageCircle size={32} color="#7C8B75" strokeWidth={2} />
                </View>
                {isSpeaking && (
                  <Animated.View entering={FadeIn} className="flex-row items-center gap-1 mb-2">
                    <Volume2 size={16} color="#7C8B75" strokeWidth={2} />
                    <Text
                      style={{ fontFamily: 'DMSans_500Medium', color: '#7C8B75' }}
                      className="text-sm"
                    >
                      Coach is speaking...
                    </Text>
                  </Animated.View>
                )}
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                  className="text-stone-800 text-xl text-center"
                >
                  Before you go...
                </Text>
              </View>

              {/* Follow-up Question */}
              <Text
                style={{ fontFamily: 'DMSans_400Regular' }}
                className="text-stone-600 text-center text-base leading-6 mb-6"
              >
                {followUpQuestion}
              </Text>

              {/* Action Buttons */}
              <View className="gap-3">
                {/* Respond Button */}
                <Pressable
                  onPress={handleRespondToFollowUp}
                  className="py-3.5 rounded-2xl flex-row items-center justify-center gap-2"
                  style={{ backgroundColor: '#7C8B75' }}
                >
                  <Mic size={18} color="white" strokeWidth={2} />
                  <Text
                    style={{ fontFamily: 'DMSans_500Medium' }}
                    className="text-white text-center"
                  >
                    Respond
                  </Text>
                </Pressable>

                {/* Control Buttons Row */}
                <View className="flex-row gap-3">
                  {/* Play/Pause Speech */}
                  <Pressable
                    onPress={handleToggleSpeech}
                    className="flex-1 py-3 rounded-2xl bg-stone-100 flex-row items-center justify-center gap-2"
                  >
                    {isSpeaking ? (
                      <VolumeX size={16} color="#78716C" strokeWidth={2} />
                    ) : (
                      <Volume2 size={16} color="#78716C" strokeWidth={2} />
                    )}
                    <Text
                      style={{ fontFamily: 'DMSans_500Medium' }}
                      className="text-stone-700"
                    >
                      {isSpeaking ? 'Stop' : 'Replay'}
                    </Text>
                  </Pressable>

                  {/* Skip Button */}
                  <Pressable
                    onPress={handleSkipFollowUp}
                    className="flex-1 py-3 rounded-2xl bg-stone-100 flex-row items-center justify-center gap-2"
                  >
                    <SkipForward size={16} color="#78716C" strokeWidth={2} />
                    <Text
                      style={{ fontFamily: 'DMSans_500Medium' }}
                      className="text-stone-700"
                    >
                      Skip
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Privacy Note */}
              <Text
                style={{ fontFamily: 'DMSans_400Regular' }}
                className="text-stone-400 text-xs text-center mt-4"
              >
                This is optional. Feel free to skip if you prefer.
              </Text>
            </Animated.View>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}
