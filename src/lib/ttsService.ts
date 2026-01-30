import * as Speech from 'expo-speech';

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  language?: string;
  voice?: string;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Text-to-Speech Service
 * Uses Expo Speech for natural voice output
 */
class TTSService {
  private isSpeaking: boolean = false;
  private currentUtterance: string | null = null;

  /**
   * Speak text with natural, coach-like voice
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    // Stop any current speech
    await this.stop();

    const {
      rate = 0.52, // Natural conversational rate (0.52-0.55)
      pitch = 1.0,
      language = 'en-US',
      voice,
      onDone,
      onStopped,
      onError,
    } = options;

    try {
      this.isSpeaking = true;
      this.currentUtterance = text;

      // Get available voices
      const voices = await Speech.getAvailableVoicesAsync();

      // Prefer natural/enhanced voices on iOS (look for Samantha or similar)
      const preferredVoice = voices.find(
        (v) =>
          v.language.startsWith('en') &&
          (v.name.includes('Samantha') || v.name.includes('enhanced') || v.name.includes('premium'))
      );

      await Speech.speak(text, {
        rate,
        pitch,
        language,
        voice: voice || preferredVoice?.identifier,
        onDone: () => {
          this.isSpeaking = false;
          this.currentUtterance = null;
          onDone?.();
        },
        onStopped: () => {
          this.isSpeaking = false;
          this.currentUtterance = null;
          onStopped?.();
        },
        onError: (error: Error) => {
          this.isSpeaking = false;
          this.currentUtterance = null;
          console.error('TTS Error:', error);
          onError?.(error instanceof Error ? error : new Error('Speech synthesis failed'));
        },
      });
    } catch (error) {
      this.isSpeaking = false;
      this.currentUtterance = null;
      console.error('TTS Error:', error);
      onError?.(error as Error);
    }
  }

  /**
   * Stop current speech
   */
  async stop(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.stop();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Pause current speech (iOS only)
   */
  async pause(): Promise<void> {
    if (this.isSpeaking && Speech.pause) {
      await Speech.pause();
    }
  }

  /**
   * Resume paused speech (iOS only)
   */
  async resume(): Promise<void> {
    if (Speech.resume) {
      await Speech.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get current utterance
   */
  getCurrentUtterance(): string | null {
    return this.currentUtterance;
  }

  /**
   * Check if TTS is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.length > 0;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const ttsService = new TTSService();
