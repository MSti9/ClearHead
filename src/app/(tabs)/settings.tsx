import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Clock, Calendar, ChevronRight, Trash2, Info } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useJournalStore } from '@/stores/journalStore';
import DateTimePicker from '@react-native-community/datetimepicker';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function SettingsSection({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} className="mb-6">
      <Text
        style={{ fontFamily: 'DMSans_600SemiBold' }}
        className="text-stone-400 text-xs uppercase tracking-wider mb-2 px-1"
      >
        {title}
      </Text>
      <View
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          shadowColor: '#2D2A26',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}

function SettingsRow({
  icon,
  label,
  sublabel,
  rightElement,
  onPress,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center px-4 py-3.5"
      style={!isLast ? { borderBottomWidth: 1, borderBottomColor: '#F5F2EE' } : undefined}
    >
      <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#FAF8F5' }}>
        {icon}
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'DMSans_500Medium' }} className="text-stone-800 text-base">
          {label}
        </Text>
        {sublabel && (
          <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-400 text-xs mt-0.5">
            {sublabel}
          </Text>
        )}
      </View>
      {rightElement}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const reminderSettings = useJournalStore((s) => s.reminderSettings);
  const setReminderSettings = useJournalStore((s) => s.setReminderSettings);
  const entries = useJournalStore((s) => s.entries);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleToggleReminders = (value: boolean) => {
    setReminderSettings({ enabled: value });
  };

  const handleToggleGentleNudge = (value: boolean) => {
    setReminderSettings({ gentleNudge: value });
  };

  const handleDayToggle = (dayIndex: number) => {
    const newDays = reminderSettings.days.includes(dayIndex)
      ? reminderSettings.days.filter((d) => d !== dayIndex)
      : [...reminderSettings.days, dayIndex].sort();
    setReminderSettings({ days: newDays });
  };

  const handleTimeChange = (_event: unknown, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setReminderSettings({ time: `${hours}:${minutes}` });
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const parseTimeToDate = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date;
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Entries',
      'This will permanently delete all your journal entries. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            // Clear entries logic would go here
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#FAF8F5' }}>
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(50).springify()} className="mb-8">
            <Text
              style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
              className="text-3xl text-stone-800"
            >
              Settings
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-500 text-base mt-1">
              Customize your journaling experience
            </Text>
          </Animated.View>

          {/* Reminders Section */}
          <SettingsSection title="Reminders" delay={100}>
            <SettingsRow
              icon={<Bell size={18} color="#C4775A" strokeWidth={2} />}
              label="Daily reminders"
              sublabel="Get gentle nudges to journal"
              rightElement={
                <Switch
                  value={reminderSettings.enabled}
                  onValueChange={handleToggleReminders}
                  trackColor={{ false: '#E8E4DE', true: '#C4775A' }}
                  thumbColor="white"
                />
              }
            />
            {reminderSettings.enabled && (
              <>
                <SettingsRow
                  icon={<Clock size={18} color="#7C8B75" strokeWidth={2} />}
                  label="Reminder time"
                  onPress={() => setShowTimePicker(true)}
                  rightElement={
                    <View className="flex-row items-center">
                      <Text style={{ fontFamily: 'DMSans_500Medium' }} className="text-stone-500 mr-2">
                        {formatTime(reminderSettings.time)}
                      </Text>
                      <ChevronRight size={18} color="#9C9690" />
                    </View>
                  }
                />
                <View className="px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: '#F5F2EE' }}>
                  <View className="flex-row items-center mb-3">
                    <Calendar size={18} color="#8B7355" strokeWidth={2} />
                    <Text style={{ fontFamily: 'DMSans_500Medium' }} className="text-stone-800 ml-3">
                      Active days
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    {DAYS.map((day, index) => (
                      <Pressable
                        key={day}
                        onPress={() => handleDayToggle(index)}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: reminderSettings.days.includes(index) ? '#C4775A' : '#F5F2EE',
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: 'DMSans_500Medium',
                            color: reminderSettings.days.includes(index) ? 'white' : '#9C9690',
                            fontSize: 12,
                          }}
                        >
                          {day.charAt(0)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <SettingsRow
                  icon={<Info size={18} color="#9C9690" strokeWidth={2} />}
                  label="Gentle nudges"
                  sublabel="Softer reminders with prompts"
                  isLast
                  rightElement={
                    <Switch
                      value={reminderSettings.gentleNudge}
                      onValueChange={handleToggleGentleNudge}
                      trackColor={{ false: '#E8E4DE', true: '#C4775A' }}
                      thumbColor="white"
                    />
                  }
                />
              </>
            )}
            {!reminderSettings.enabled && (
              <View className="px-4 py-3">
                <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-400 text-sm">
                  Enable reminders to set your preferred time and days.
                </Text>
              </View>
            )}
          </SettingsSection>

          {/* Data Section */}
          <SettingsSection title="Data" delay={200}>
            <SettingsRow
              icon={<Trash2 size={18} color="#DC6B6B" strokeWidth={2} />}
              label="Clear all entries"
              sublabel={`${entries.length} entries stored`}
              onPress={handleClearData}
              isLast
              rightElement={<ChevronRight size={18} color="#9C9690" />}
            />
          </SettingsSection>

          {/* About Section */}
          <SettingsSection title="About" delay={300}>
            <View className="px-4 py-4">
              <Text
                style={{ fontFamily: 'CormorantGaramond_500Medium' }}
                className="text-stone-600 text-lg mb-2"
              >
                Clearhead
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-400 text-sm leading-5">
                A journaling app for people who want to journal but have not done it consistently.
                No pressure, no streaks to maintain. Just a calm space to clear your head whenever
                you need it.
              </Text>
            </View>
          </SettingsSection>
        </ScrollView>

        {showTimePicker && (
          <DateTimePicker
            value={parseTimeToDate(reminderSettings.time)}
            mode="time"
            is24Hour={false}
            onChange={handleTimeChange}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
