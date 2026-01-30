import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Trash2, Edit3, Check, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useJournalStore } from '@/stores/journalStore';
import { format } from 'date-fns';

export default function EntryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entries = useJournalStore((s) => s.entries);
  const updateEntry = useJournalStore((s) => s.updateEntry);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);

  const entry = entries.find((e) => e.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(entry?.content || '');

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteEntry(entry.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim().length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateEntry(entry.id, { content: editedContent.trim() });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                value={editedContent}
                onChangeText={setEditedContent}
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
              <Text
                style={{ fontFamily: 'DMSans_400Regular' }}
                className="text-stone-700 text-base leading-7"
              >
                {entry.content}
              </Text>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
