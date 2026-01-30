import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, Keyboard, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Check, AlertTriangle, Bold, Italic, Heading2, Quote, List, ListOrdered } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useJournalStore } from '@/stores/journalStore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { insertFormatting } from '@/components/MarkdownText';

interface SelectionState {
  start: number;
  end: number;
}

export default function NewEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ prompt?: string }>();
  const addEntry = useJournalStore((s) => s.addEntry);
  const [content, setContent] = useState('');
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [selection, setSelection] = useState<SelectionState>({ start: 0, end: 0 });
  const [showFormatBar, setShowFormatBar] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const promptText = params.prompt || null;
  const hasContent = content.trim().length > 0;
  const prevContentRef = useRef(content);

  // Handle auto-continuing lists on Enter
  const handleTextChange = (newText: string) => {
    const prevText = prevContentRef.current;

    // Check if user just pressed Enter (newline was added)
    if (newText.length === prevText.length + 1 && newText.endsWith('\n') && !prevText.endsWith('\n')) {
      // Find the current line before the new Enter
      const textBeforeNewline = newText.slice(0, -1);
      const lastNewlineIndex = textBeforeNewline.lastIndexOf('\n');
      const currentLine = textBeforeNewline.slice(lastNewlineIndex + 1);

      // Check if previous line was a bullet list item
      if (currentLine.startsWith('- ')) {
        const listContent = currentLine.slice(2).trim();
        if (listContent === '') {
          // Empty bullet - remove it and stop the list (double enter)
          setContent(textBeforeNewline.slice(0, lastNewlineIndex + 1));
          prevContentRef.current = textBeforeNewline.slice(0, lastNewlineIndex + 1);
          return;
        }
        // Continue the bullet list
        setContent(newText + '- ');
        prevContentRef.current = newText + '- ';
        // Move cursor to end
        setTimeout(() => {
          inputRef.current?.setNativeProps({
            selection: { start: newText.length + 2, end: newText.length + 2 },
          });
        }, 10);
        return;
      }

      // Check if previous line was a numbered list item
      const numberedMatch = currentLine.match(/^(\d+)\.\s/);
      if (numberedMatch) {
        const listContent = currentLine.slice(numberedMatch[0].length).trim();
        if (listContent === '') {
          // Empty numbered item - remove it and stop the list (double enter)
          setContent(textBeforeNewline.slice(0, lastNewlineIndex + 1));
          prevContentRef.current = textBeforeNewline.slice(0, lastNewlineIndex + 1);
          return;
        }
        // Continue the numbered list with next number
        const nextNum = parseInt(numberedMatch[1], 10) + 1;
        setContent(newText + `${nextNum}. `);
        prevContentRef.current = newText + `${nextNum}. `;
        // Move cursor to end
        setTimeout(() => {
          const newLength = newText.length + `${nextNum}. `.length;
          inputRef.current?.setNativeProps({
            selection: { start: newLength, end: newLength },
          });
        }, 10);
        return;
      }
    }

    // Also check for Enter pressed in the middle of text
    if (newText.length > prevText.length) {
      const diff = newText.length - prevText.length;
      // Find where the new character(s) were inserted
      for (let i = 0; i < prevText.length; i++) {
        if (newText[i] !== prevText[i]) {
          // Found the insertion point
          if (newText[i] === '\n' && diff === 1) {
            // User pressed Enter, check the line before the cursor
            const textBeforeCursor = newText.slice(0, i);
            const lastNewlineBeforeCursor = textBeforeCursor.lastIndexOf('\n');
            const lineBeforeCursor = textBeforeCursor.slice(lastNewlineBeforeCursor + 1);

            // Check for bullet
            if (lineBeforeCursor.startsWith('- ')) {
              const listContent = lineBeforeCursor.slice(2).trim();
              if (listContent === '') {
                // Empty bullet - remove it
                const before = textBeforeCursor.slice(0, lastNewlineBeforeCursor + 1);
                const after = newText.slice(i + 1);
                setContent(before + after);
                prevContentRef.current = before + after;
                setTimeout(() => {
                  inputRef.current?.setNativeProps({
                    selection: { start: before.length, end: before.length },
                  });
                }, 10);
                return;
              }
              // Insert new bullet
              const before = newText.slice(0, i + 1);
              const after = newText.slice(i + 1);
              const newContent = before + '- ' + after;
              setContent(newContent);
              prevContentRef.current = newContent;
              setTimeout(() => {
                inputRef.current?.setNativeProps({
                  selection: { start: i + 3, end: i + 3 },
                });
              }, 10);
              return;
            }

            // Check for numbered list
            const numMatch = lineBeforeCursor.match(/^(\d+)\.\s/);
            if (numMatch) {
              const listContent = lineBeforeCursor.slice(numMatch[0].length).trim();
              if (listContent === '') {
                // Empty numbered item - remove it
                const before = textBeforeCursor.slice(0, lastNewlineBeforeCursor + 1);
                const after = newText.slice(i + 1);
                setContent(before + after);
                prevContentRef.current = before + after;
                setTimeout(() => {
                  inputRef.current?.setNativeProps({
                    selection: { start: before.length, end: before.length },
                  });
                }, 10);
                return;
              }
              // Insert next number
              const nextNum = parseInt(numMatch[1], 10) + 1;
              const before = newText.slice(0, i + 1);
              const after = newText.slice(i + 1);
              const prefix = `${nextNum}. `;
              const newContent = before + prefix + after;
              setContent(newContent);
              prevContentRef.current = newContent;
              setTimeout(() => {
                inputRef.current?.setNativeProps({
                  selection: { start: i + 1 + prefix.length, end: i + 1 + prefix.length },
                });
              }, 10);
              return;
            }
          }
          break;
        }
      }
    }

    setContent(newText);
    prevContentRef.current = newText;
  };

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

  const handleFormat = (format: 'bold' | 'italic' | 'header' | 'quote' | 'list' | 'numbered') => {
    const { newText, newCursorPosition } = insertFormatting(
      content,
      selection.start,
      selection.end,
      format
    );
    setContent(newText);
    prevContentRef.current = newText;

    // Set cursor position after formatting
    setTimeout(() => {
      inputRef.current?.setNativeProps({
        selection: { start: newCursorPosition, end: newCursorPosition },
      });
    }, 50);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const FormatButton = ({
    icon: Icon,
    onPress,
    label,
  }: {
    icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
    onPress: () => void;
    label: string;
  }) => (
    <Pressable
      onPress={onPress}
      className="w-12 h-12 rounded-xl items-center justify-center bg-stone-100"
      accessibilityLabel={label}
    >
      <Icon size={22} color="#78716C" strokeWidth={2} />
    </Pressable>
  );

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
          <Pressable onPress={() => setShowFormatBar(!showFormatBar)}>
            <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-400 text-sm">
              {wordCount > 0 ? `${wordCount} words` : 'New entry'}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={!hasContent}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: hasContent ? '#7C8B75' : '#E8E4DE' }}
          >
            <Check size={20} color={hasContent ? 'white' : '#9C9690'} strokeWidth={2.5} />
          </Pressable>
        </Animated.View>

        {/* Format Toolbar */}
        {showFormatBar && (
          <Animated.View
            entering={FadeInDown.duration(200)}
            className="px-6 pb-3"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
              style={{ flexGrow: 0 }}
            >
              <FormatButton icon={Bold} onPress={() => handleFormat('bold')} label="Bold" />
              <FormatButton icon={Italic} onPress={() => handleFormat('italic')} label="Italic" />
              <FormatButton icon={Heading2} onPress={() => handleFormat('header')} label="Heading" />
              <FormatButton icon={Quote} onPress={() => handleFormat('quote')} label="Quote" />
              <FormatButton icon={List} onPress={() => handleFormat('list')} label="Bullet list" />
              <FormatButton icon={ListOrdered} onPress={() => handleFormat('numbered')} label="Numbered list" />
            </ScrollView>
            <Text
              style={{ fontFamily: 'DMSans_400Regular' }}
              className="text-stone-400 text-xs mt-2"
            >
              {'Tip: Use **bold**, *italic*, ## headers, > quotes, - lists'}
            </Text>
          </Animated.View>
        )}

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
                <View className="flex-row items-center justify-between mb-4">
                  <Text
                    style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                    className="text-stone-400 text-xl"
                  >
                    What is on your mind?
                  </Text>
                  <Pressable
                    onPress={() => setShowFormatBar(!showFormatBar)}
                    className="px-3 py-1.5 rounded-full bg-stone-100"
                  >
                    <Text
                      style={{ fontFamily: 'DMSans_500Medium' }}
                      className="text-stone-500 text-xs"
                    >
                      {showFormatBar ? 'Hide format' : 'Format'}
                    </Text>
                  </Pressable>
                </View>
              )}
              <TextInput
                ref={inputRef}
                value={content}
                onChangeText={handleTextChange}
                onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                onFocus={() => setShowFormatBar(true)}
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
