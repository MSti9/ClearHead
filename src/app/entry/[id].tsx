import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Trash2, Edit3, Check, X, Bold, Italic, Heading2, Quote, List, ListOrdered } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useJournalStore } from '@/stores/journalStore';
import * as Haptics from '@/lib/haptics';
import { format } from 'date-fns';
import { MarkdownText, insertFormatting } from '@/components/MarkdownText';
import { TAG_CONFIG } from '@/lib/autoTag';

export default function EntryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entries = useJournalStore((s) => s.entries);
  const updateEntry = useJournalStore((s) => s.updateEntry);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);

  const entry = entries.find((e) => e.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(entry?.content || '');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const prevContentRef = useRef(editedContent);

  if (!entry) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#FAF8F5' }}>
        <Text style={{ fontFamily: 'DMSans_500Medium' }} className="text-stone-500">
          Entry not found
        </Text>
      </View>
    );
  }

  const handleBack = () => {
    Haptics.lightTap();
    router.back();
  };

  const handleDelete = () => {
    Haptics.warning();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    Haptics.heavyTap();
    deleteEntry(entry.id);
    router.back();
  };

  const handleEdit = () => {
    Haptics.lightTap();
    setIsEditing(true);
  };

  const handleFormat = (format: 'bold' | 'italic' | 'header' | 'quote' | 'list' | 'numbered') => {
    Haptics.selection();
    const { newText, newCursorPosition } = insertFormatting(
      editedContent,
      selection.start,
      selection.end,
      format
    );
    setEditedContent(newText);
    prevContentRef.current = newText;

    setTimeout(() => {
      inputRef.current?.setNativeProps({
        selection: { start: newCursorPosition, end: newCursorPosition },
      });
    }, 50);
  };

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
          // Empty bullet - remove it and stop the list
          setEditedContent(textBeforeNewline.slice(0, lastNewlineIndex + 1));
          prevContentRef.current = textBeforeNewline.slice(0, lastNewlineIndex + 1);
          return;
        }
        // Continue the bullet list
        setEditedContent(newText + '- ');
        prevContentRef.current = newText + '- ';
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
          // Empty numbered item - remove it and stop the list
          setEditedContent(textBeforeNewline.slice(0, lastNewlineIndex + 1));
          prevContentRef.current = textBeforeNewline.slice(0, lastNewlineIndex + 1);
          return;
        }
        // Continue the numbered list with next number
        const nextNum = parseInt(numberedMatch[1], 10) + 1;
        setEditedContent(newText + `${nextNum}. `);
        prevContentRef.current = newText + `${nextNum}. `;
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
      for (let i = 0; i < prevText.length; i++) {
        if (newText[i] !== prevText[i]) {
          if (newText[i] === '\n' && diff === 1) {
            const textBeforeCursor = newText.slice(0, i);
            const lastNewlineBeforeCursor = textBeforeCursor.lastIndexOf('\n');
            const lineBeforeCursor = textBeforeCursor.slice(lastNewlineBeforeCursor + 1);

            // Check for bullet
            if (lineBeforeCursor.startsWith('- ')) {
              const listContent = lineBeforeCursor.slice(2).trim();
              if (listContent === '') {
                const before = textBeforeCursor.slice(0, lastNewlineBeforeCursor + 1);
                const after = newText.slice(i + 1);
                setEditedContent(before + after);
                prevContentRef.current = before + after;
                setTimeout(() => {
                  inputRef.current?.setNativeProps({
                    selection: { start: before.length, end: before.length },
                  });
                }, 10);
                return;
              }
              const before = newText.slice(0, i + 1);
              const after = newText.slice(i + 1);
              const newContent = before + '- ' + after;
              setEditedContent(newContent);
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
                const before = textBeforeCursor.slice(0, lastNewlineBeforeCursor + 1);
                const after = newText.slice(i + 1);
                setEditedContent(before + after);
                prevContentRef.current = before + after;
                setTimeout(() => {
                  inputRef.current?.setNativeProps({
                    selection: { start: before.length, end: before.length },
                  });
                }, 10);
                return;
              }
              const nextNum = parseInt(numMatch[1], 10) + 1;
              const before = newText.slice(0, i + 1);
              const after = newText.slice(i + 1);
              const prefix = `${nextNum}. `;
              const newContent = before + prefix + after;
              setEditedContent(newContent);
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

    setEditedContent(newText);
    prevContentRef.current = newText;
  };

  const handleSaveEdit = () => {
    if (editedContent.trim().length === 0) return;
    Haptics.success();
    updateEntry(entry.id, { content: editedContent.trim() });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    Haptics.lightTap();
    setEditedContent(entry.content);
    setIsEditing(false);
  };

  const formattedDate = format(new Date(entry.createdAt), 'EEEE, MMMM d, yyyy');
  const formattedTime = format(new Date(entry.createdAt), 'h:mm a');

  return (
    <View className="flex-1" style={{ backgroundColor: '#FAF8F5' }}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        {/* Header */}
        <Animated.View
          entering={FadeIn.delay(50)}
          className="flex-row items-center justify-between px-4 py-4"
        >
          <Pressable
            onPress={handleBack}
            className="flex-row items-center"
          >
            <ChevronLeft size={24} color="#78716C" strokeWidth={2} />
            <Text style={{ fontFamily: 'DMSans_500Medium' }} className="text-stone-500 ml-1">
              Back
            </Text>
          </Pressable>

          <View className="flex-row items-center gap-2">
            {isEditing ? (
              <>
                <Pressable
                  onPress={handleCancelEdit}
                  className="w-10 h-10 rounded-full bg-stone-100 items-center justify-center"
                >
                  <X size={20} color="#78716C" strokeWidth={2} />
                </Pressable>
                <Pressable
                  onPress={handleSaveEdit}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#7C8B75' }}
                >
                  <Check size={20} color="white" strokeWidth={2.5} />
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  onPress={handleEdit}
                  className="w-10 h-10 rounded-full bg-stone-100 items-center justify-center"
                >
                  <Edit3 size={18} color="#78716C" strokeWidth={2} />
                </Pressable>
                <Pressable
                  onPress={handleDelete}
                  className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
                >
                  <Trash2 size={18} color="#DC6B6B" strokeWidth={2} />
                </Pressable>
              </>
            )}
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Date & Time */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-6">
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
              className="text-2xl text-stone-800 mb-1"
            >
              {formattedDate}
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-400">
              {formattedTime}
            </Text>
          </Animated.View>

          {/* Entry Type Badge */}
          <Animated.View entering={FadeInDown.delay(150).springify()} className="flex-row mb-4">
            {entry.type === 'voice' && (
              <View className="bg-amber-100 px-3 py-1 rounded-full">
                <Text
                  style={{ fontFamily: 'DMSans_500Medium' }}
                  className="text-amber-700 text-xs"
                >
                  Voice note {entry.voiceDuration ? `· ${Math.floor(entry.voiceDuration / 60)}:${(entry.voiceDuration % 60).toString().padStart(2, '0')}` : ''}
                </Text>
              </View>
            )}
            {entry.type === 'prompted' && (
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: '#E8EDE6' }}>
                <Text
                  style={{ fontFamily: 'DMSans_500Medium', color: '#5C6B56', fontSize: 12 }}
                >
                  Prompted entry
                </Text>
              </View>
            )}
            {entry.type === 'text' && (
              <View className="bg-stone-100 px-3 py-1 rounded-full">
                <Text
                  style={{ fontFamily: 'DMSans_500Medium' }}
                  className="text-stone-500 text-xs"
                >
                  Written
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Prompt (if used) */}
          {entry.promptUsed && (
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
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
                className="text-stone-600 text-lg leading-6 italic"
              >
                {entry.promptUsed}
              </Text>
            </Animated.View>
          )}

          {/* Content */}
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            {isEditing ? (
              <TextInput
                ref={inputRef}
                value={editedContent}
                onChangeText={handleTextChange}
                onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                multiline
                textAlignVertical="top"
                autoFocus
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 16,
                  lineHeight: 26,
                  color: '#44403C',
                  minHeight: 200,
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 16,
                }}
              />
            ) : (
              <MarkdownText content={entry.content} />
            )}
          </Animated.View>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              className="flex-row flex-wrap gap-2 mt-6 pt-6 border-t border-stone-200"
            >
              {entry.tags.map((tag) => {
                const config = TAG_CONFIG[tag];
                if (!config) return null;
                return (
                  <View
                    key={tag}
                    className="px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <Text
                      style={{ fontFamily: 'DMSans_500Medium', color: config.color, fontSize: 12 }}
                    >
                      #{config.label}
                    </Text>
                  </View>
                );
              })}
            </Animated.View>
          )}
        </ScrollView>

        {/* Format Toolbar - Bottom (when editing) */}
        {isEditing && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            className="px-6 pb-4 pt-3 border-t border-stone-200"
            style={{ backgroundColor: '#FAF8F5' }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
              style={{ flexGrow: 0 }}
            >
              <Pressable
                onPress={() => handleFormat('bold')}
                className="w-12 h-12 rounded-xl items-center justify-center bg-stone-100"
              >
                <Bold size={22} color="#78716C" strokeWidth={2} />
              </Pressable>
              <Pressable
                onPress={() => handleFormat('italic')}
                className="w-12 h-12 rounded-xl items-center justify-center bg-stone-100"
              >
                <Italic size={22} color="#78716C" strokeWidth={2} />
              </Pressable>
              <Pressable
                onPress={() => handleFormat('header')}
                className="w-12 h-12 rounded-xl items-center justify-center bg-stone-100"
              >
                <Heading2 size={22} color="#78716C" strokeWidth={2} />
              </Pressable>
              <Pressable
                onPress={() => handleFormat('quote')}
                className="w-12 h-12 rounded-xl items-center justify-center bg-stone-100"
              >
                <Quote size={22} color="#78716C" strokeWidth={2} />
              </Pressable>
              <Pressable
                onPress={() => handleFormat('list')}
                className="w-12 h-12 rounded-xl items-center justify-center bg-stone-100"
              >
                <List size={22} color="#78716C" strokeWidth={2} />
              </Pressable>
              <Pressable
                onPress={() => handleFormat('numbered')}
                className="w-12 h-12 rounded-xl items-center justify-center bg-stone-100"
              >
                <ListOrdered size={22} color="#78716C" strokeWidth={2} />
              </Pressable>
            </ScrollView>
          </Animated.View>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <Pressable
            className="flex-1 bg-black/50 items-center justify-center px-8"
            onPress={() => setShowDeleteModal(false)}
          >
            <Pressable
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
              onPress={(e) => e.stopPropagation()}
            >
              <View className="items-center mb-4">
                <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mb-3">
                  <Trash2 size={24} color="#DC2626" />
                </View>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                  className="text-stone-800 text-xl text-center"
                >
                  Delete entry?
                </Text>
              </View>

              <Text
                style={{ fontFamily: 'DMSans_400Regular' }}
                className="text-stone-500 text-center mb-6"
              >
                This cannot be undone. Your entry will be permanently deleted.
              </Text>

              <View className="gap-3">
                <Pressable
                  onPress={() => {
                    Haptics.lightTap();
                    setShowDeleteModal(false);
                  }}
                  className="py-3.5 rounded-2xl bg-stone-100"
                >
                  <Text
                    style={{ fontFamily: 'DMSans_500Medium' }}
                    className="text-stone-700 text-center"
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirmDelete}
                  className="py-3.5 rounded-2xl bg-red-500"
                >
                  <Text
                    style={{ fontFamily: 'DMSans_500Medium' }}
                    className="text-white text-center"
                  >
                    Delete
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
