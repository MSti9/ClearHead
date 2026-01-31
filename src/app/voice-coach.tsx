import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Mic, Square, Check, Volume2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
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
import { useJournalStore } from '@/stores/journalStore';
import * as Haptics from '@/lib/haptics';
import { speakWithElevenLabs, stopSpeaking } from '@/lib/elevenLabsTTS';
import {
  getOpeningQuestion,
  generateCoachResponse,
  getContinuePrompt,
  type CoachMessage,
  type ConversationContext,
} from '@/lib/voiceCoach';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ConversationPhase =
  | 'greeting'      // Coach is speaking opening question
  | 'listening'     // User is recording
  | 'processing'    // Transcribing user's response
  | 'responding'    // Coach is generating/speaking response
  | 'askContinue'   // Coach asking if user wants to continue
  | 'done';         // Session complete

interface TranscribedMessage {
  role: 'coach' | 'user';
  content: string;
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
    throw new Error('Transcription failed');
  }

  const result = await response.json();
  return result.text;
}

function PulsingRing({ color = '#7C8B75' }: { color?: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1200, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1200, easing: Easing.out(Easing.ease) }),
        withTiming(0.5, { duration: 0 })
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
          width: 140,
          height: 140,
          borderRadius: 70,
          borderWidth: 3,
          borderColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

function WaveformBar({ isActive }: { isActive: boolean }) {
  const height = useSharedValue(16);

  useEffect(() => {
    if (isActive) {
      height.value = withRepeat(
        withSequence(
          withTiming(16 + Math.random() * 32, {
            duration: 150 + Math.random() * 150,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(16 + Math.random() * 16, {
            duration: 150 + Math.random() * 150,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(height);
      height.value = withSpring(16);
    }
  }, [isActive, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 4,
          borderRadius: 2,
          backgroundColor: '#7C8B75',
          marginHorizontal: 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function VoiceCoachScreen() {
  const router = useRouter();
  const addEntry = useJournalStore((s) => s.addEntry);

  const [phase, setPhase] = useState<ConversationPhase>('greeting');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentCoachText, setCurrentCoachText] = useState('');
  const [conversation, setConversation] = useState<TranscribedMessage[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const conversationRef = useRef<TranscribedMessage[]>([]);

  // Keep conversationRef in sync
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  // Start the session with opening question
  useEffect(() => {
    const startSession = async () => {
      const opening = getOpeningQuestion();
      setCurrentCoachText(opening);
      setConversation([{ role: 'coach', content: opening }]);

      setIsSpeaking(true);
      await speakWithElevenLabs(
        opening,
        () => setIsSpeaking(true),
        () => {
          setIsSpeaking(false);
          setPhase('listening');
        },
        () => {
          setIsSpeaking(false);
          setPhase('listening');
        }
      );
    };

    startSession();

    return () => {
      stopSpeaking();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      Haptics.mediumTap();
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setTotalDuration((d) => d + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    Haptics.mediumTap();
    if (timerRef.current) clearInterval(timerRef.current);

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    setIsRecording(false);
    recordingRef.current = null;

    if (uri) {
      await processUserResponse(uri);
    }
  };

  const processUserResponse = async (uri: string) => {
    setPhase('processing');

    try {
      const transcription = await transcribeAudio(uri);

      // Add user message to conversation
      const newConvo = [...conversationRef.current, { role: 'user' as const, content: transcription }];
      setConversation(newConvo);

      // Generate coach response
      setPhase('responding');

      const context: ConversationContext = {
        messages: newConvo.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(),
        })),
        totalDuration,
      };

      // Get follow-up response (always continue for now)
      const coachResponse = await generateCoachResponse(transcription, context, true);

      // Add continue prompt
      const continuePrompt = getContinuePrompt();
      const fullResponse = `${coachResponse} ${continuePrompt}`;

      setCurrentCoachText(fullResponse);
      setConversation([...newConvo, { role: 'coach', content: fullResponse }]);

      // Speak the response
      setIsSpeaking(true);
      await speakWithElevenLabs(
        fullResponse,
        () => setIsSpeaking(true),
        () => {
          setIsSpeaking(false);
          setPhase('askContinue');
        },
        () => {
          setIsSpeaking(false);
          setPhase('askContinue');
        }
      );
    } catch (error) {
      console.error('Processing failed:', error);
      setPhase('listening');
    }
  };

  const handleContinue = () => {
    Haptics.lightTap();
    setPhase('listening');
  };

  const handleDone = async () => {
    Haptics.success();
    await stopSpeaking();

    // Generate closing
    const closing = "Thanks for sharing with me today. Take care of yourself.";
    setCurrentCoachText(closing);

    setIsSpeaking(true);
    await speakWithElevenLabs(
      closing,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        saveAndExit();
      },
      () => {
        setIsSpeaking(false);
        saveAndExit();
      }
    );
  };

  const saveAndExit = () => {
    // Save the conversation as a journal entry
    if (conversation.length > 1) {
      const entryContent = conversation
        .map((m) => (m.role === 'coach' ? `**Coach:** ${m.content}` : m.content))
        .join('\n\n');

      addEntry({
        content: entryContent,
        type: 'voice',
        voiceDuration: totalDuration,
      });
    }

    router.back();
  };

  const handleClose = async () => {
    Haptics.lightTap();
    await stopSpeaking();
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
    }
    if (timerRef.current) clearInterval(timerRef.current);

    // Save if there's content
    if (conversation.length > 1) {
      saveAndExit();
    } else {
      router.back();
    }
  };

  const handleRecordButton = () => {
    if (isRecording) {
      stopRecording();
    } else if (phase === 'listening' || phase === 'askContinue') {
      handleContinue();
      startRecording();
    }
  };

  const getStatusText = () => {
    switch (phase) {
      case 'greeting':
        return 'Coach is speaking...';
      case 'listening':
        return isRecording ? 'Listening...' : 'Tap to respond';
      case 'processing':
        return 'Processing...';
      case 'responding':
        return 'Coach is responding...';
      case 'askContinue':
        return 'Continue or done?';
      default:
        return '';
    }
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
            className="w-10 h-10 rounded-full bg-stone-100 items-center justify-center"
          >
            <X size={20} color="#78716C" strokeWidth={2} />
          </Pressable>
          <Text style={{ fontFamily: 'DMSans_500Medium' }} className="text-stone-500">
            Talk it Through
          </Text>
          <View className="w-10" />
        </Animated.View>

        {/* Conversation Display */}
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {conversation.slice(-3).map((msg, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(index * 100).springify()}
              className={`mb-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <View
                className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                  msg.role === 'user' ? 'bg-stone-200' : 'bg-white'
                }`}
                style={
                  msg.role === 'coach'
                    ? {
                        shadowColor: '#2D2A26',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.04,
                        shadowRadius: 8,
                        elevation: 2,
                      }
                    : undefined
                }
              >
                <Text
                  style={{ fontFamily: 'DMSans_400Regular' }}
                  className="text-stone-700 text-base leading-6"
                >
                  {msg.content}
                </Text>
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Center Area - Recording/Speaking Indicator */}
        <View className="items-center py-8">
          {/* Speaking Indicator */}
          {isSpeaking && (
            <Animated.View entering={FadeIn} className="items-center mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Volume2 size={18} color="#7C8B75" strokeWidth={2} />
                <Text style={{ fontFamily: 'DMSans_500Medium' }} className="text-stone-600">
                  {getStatusText()}
                </Text>
              </View>
              <View className="flex-row items-center h-12">
                {Array.from({ length: 16 }).map((_, i) => (
                  <WaveformBar key={i} isActive={isSpeaking} />
                ))}
              </View>
            </Animated.View>
          )}

          {/* Processing Indicator */}
          {phase === 'processing' && (
            <Animated.View entering={FadeIn} className="items-center mb-4">
              <ActivityIndicator size="large" color="#7C8B75" />
              <Text
                style={{ fontFamily: 'DMSans_400Regular' }}
                className="text-stone-500 mt-2"
              >
                Processing your response...
              </Text>
            </Animated.View>
          )}

          {/* Record Button */}
          {(phase === 'listening' || phase === 'askContinue') && !isSpeaking && (
            <Animated.View entering={FadeInDown.springify()}>
              <View className="items-center justify-center">
                {isRecording && <PulsingRing />}
                <AnimatedPressable onPress={handleRecordButton}>
                  <LinearGradient
                    colors={
                      isRecording
                        ? (['#DC6B6B', '#C45C5C'] as [string, string])
                        : (['#7C8B75', '#9CAA95'] as [string, string])
                    }
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: 70,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isRecording ? (
                      <Square size={40} color="white" fill="white" strokeWidth={0} />
                    ) : (
                      <Mic size={40} color="white" strokeWidth={2} />
                    )}
                  </LinearGradient>
                </AnimatedPressable>
              </View>
              <Text
                style={{ fontFamily: 'DMSans_400Regular' }}
                className="text-stone-400 text-center mt-4"
              >
                {isRecording ? 'Tap to finish' : getStatusText()}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Bottom Actions - Done Button */}
        {phase === 'askContinue' && !isSpeaking && !isRecording && (
          <Animated.View
            entering={FadeInUp.springify()}
            className="px-6 pb-6"
          >
            <Pressable
              onPress={handleDone}
              className="py-4 rounded-2xl bg-stone-200"
            >
              <Text
                style={{ fontFamily: 'DMSans_500Medium' }}
                className="text-stone-600 text-center"
              >
                Done for today
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Bottom hint */}
        <Animated.View entering={FadeIn.delay(500)} className="px-6 pb-4">
          <Text
            style={{ fontFamily: 'DMSans_400Regular' }}
            className="text-stone-400 text-xs text-center"
          >
            Your conversation will be saved as a journal entry
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
