import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

// Rachel voice - warm, friendly female voice
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

let currentSound: Audio.Sound | null = null;

export async function speakWithElevenLabs(
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

    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;

    // Use fetch to make POST request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.EXPO_PUBLIC_VIBECODE_ELEVENLABS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get the audio blob and save to file
    const audioBlob = await response.blob();
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
    console.error('ElevenLabs TTS error:', error);
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
