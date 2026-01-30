import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, Keyboard, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Check, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useJournalStore } from '@/stores/journalStore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export default function NewEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ prompt?: string }>();
  const addEntry = useJournalStore((s) => s.addEntry);
  const [content, setContent] = useState('');
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const promptText = params.prompt || null;
  const hasContent = content.trim().length > 0;

  useEffect(() => {
    // Focus the input after a short delay
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    Keyboard.dismiss();
    // If there's content, show confirmation modal
    if (hasContent) {
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    router.back();
  };

  const handleSave = () => {
    if (!hasContent) return;

    addEntry({
      content: content.trim(),
      type: promptText ? 'prompted' : 'text',
      promptUsed: promptText ?? undefined,
    });
    router.back();
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <View className="flex-1" style={{ backgroundColor: '#FAF8F5' }}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        {/* Header */}
        <Animated.View
          entering={FadeIn.delay(50)}
          className="flex-row items-center justify-between px-6 py-4"
        >
          <Pressable
            onPress={handleClose}
            className="w-10 h-10 rounded-full bg-stone-100 items-center justify-center"
          >
            <X size={20} color="#78716C" strokeWidth={2} />
          </Pressable>
          <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-400 text-sm">
            {wordCount > 0 ? `${wordCount} words` : 'New entry'}
          </Text>
          <Pressable
            onPress={handleSave}
            disabled={!hasContent}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: hasContent ? '#7C8B75' : '#E8E4DE' }}
          >
            <Check size={20} color={hasContent ? 'white' : '#9C9690'} strokeWidth={2.5} />
          </Pressable>
        </Animated.View>

        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6">
            {/* Prompt (if provided) */}
            {promptText && (
              <Animated.View
                entering={FadeInDown.delay(100).springify()}
                className="bg-stone-100 rounded-2xl p-4 mb-6"
              >
                <Text
                  style={{ fontFamily: 'DMSans_500Medium' }}
                  className="text-stone-400 text-xs uppercase tracking-wider mb-2"
                >
                  Prompt
                </Text>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                  className="text-stone-700 text-lg leading-6"
                >
                  {promptText}
                </Text>
              </Animated.View>
            )}

            {/* Writing Area */}
            <Animated.View entering={FadeInUp.delay(200).springify()} className="flex-1">
              {!promptText && (
                <Text
                  style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                  className="text-stone-400 text-xl mb-4"
                >
                  What is on your mind?
                </Text>
              )}
              <TextInput
                ref={inputRef}
                value={content}
                onChangeText={setContent}
                placeholder="Start writing..."
                placeholderTextColor="#9C9690"
                multiline
                textAlignVertical="top"
                style={{
                  flex: 1,
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 16,
                  lineHeight: 26,
                  color: '#44403C',
                  minHeight: 200,
                }}
                className="pb-8"
              />
            </Animated.View>
          </View>
        </KeyboardAwareScrollView>

        {/* Bottom hint */}
        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          className="px-6 pb-4"
        >
          <Text
            style={{ fontFamily: 'DMSans_400Regular' }}
            className="text-stone-400 text-xs text-center"
          >
            Write freely. No one else will see this.
          </Text>
        </Animated.View>
      </SafeAreaView>

      {/* Discard Confirmation Modal */}
      <Modal
        visible={showDiscardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDiscardModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center px-8"
          onPress={() => setShowDiscardModal(false)}
        >
          <Pressable
            className="bg-white rounded-3xl p-6 w-full max-w-sm"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mb-3">
                <AlertTriangle size={24} color="#D97706" />
              </View>
              <Text
                style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                className="text-stone-800 text-xl text-center"
              >
                Discard entry?
              </Text>
            </View>

            <Text
              style={{ fontFamily: 'DMSans_400Regular' }}
              className="text-stone-500 text-center mb-6"
            >
              You have unsaved writing. Are you sure you want to leave without saving?
            </Text>

            <View className="gap-3">
              <Pressable
                onPress={() => setShowDiscardModal(false)}
                className="py-3.5 rounded-2xl bg-stone-100"
              >
                <Text
                  style={{ fontFamily: 'DMSans_500Medium' }}
                  className="text-stone-700 text-center"
                >
                  Keep writing
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmDiscard}
                className="py-3.5 rounded-2xl"
                style={{ backgroundColor: '#C4775A' }}
              >
                <Text
                  style={{ fontFamily: 'DMSans_500Medium' }}
                  className="text-white text-center"
                >
                  Discard
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
