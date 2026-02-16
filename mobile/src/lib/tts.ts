import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { textToSpeech } from '@/lib/apiClient';

let currentSound: Audio.Sound | null = null;

export async function speak(
  text: string,
  onStart?: () => void,
  onFinish?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    // Stop any currently playing audio
    await stopSpeaking();

    // Set audio mode for playback
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    onStart?.();

    // Request TTS from backend (OpenAI TTS, API key stays server-side)
    const audioBlob = await textToSpeech({ text });

    const fileUri = FileSystem.documentDirectory + `coach_speech_${Date.now()}.mp3`;

    // Convert blob to base64 and write to file
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
    reader.readAsDataURL(audioBlob);

    const base64Data = await base64Promise;
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: true }
    );

    currentSound = sound;

    // Listen for playback completion
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        onFinish?.();
        cleanupSound();
      }
    });
  } catch (error) {
    console.error('TTS error:', error);
    onError?.(error instanceof Error ? error : new Error('TTS failed'));
    onFinish?.();
  }
}

export async function stopSpeaking(): Promise<void> {
  await cleanupSound();
}

async function cleanupSound(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch (e) {
      // Sound may already be unloaded
    }
    currentSound = null;
  }
}

export function isSpeaking(): boolean {
  return currentSound !== null;
}
