import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Clock, Calendar, ChevronRight, Trash2, Info, Download, FileText, Sparkles, Shield, User, Edit3 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useJournalStore } from '@/stores/journalStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { exportAsText, exportYearInReview } from '@/lib/exportJournal';
import { scheduleReminders, requestNotificationPermissions, areNotificationsEnabled } from '@/lib/notifications';

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
  const userName = useJournalStore((s) => s.userName);
  const setUserName = useJournalStore((s) => s.setUserName);
  const entries = useJournalStore((s) => s.entries);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(userName || '');

  // Check notification permissions on mount
  useEffect(() => {
    areNotificationsEnabled().then(setNotificationsAllowed);
  }, []);

  // Schedule/cancel reminders when settings change
  useEffect(() => {
    scheduleReminders(reminderSettings);
  }, [reminderSettings]);

  const handleToggleReminders = async (value: boolean) => {
    if (value) {
      // Request permission when enabling
      const granted = await requestNotificationPermissions();
      setNotificationsAllowed(granted);

      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive journal reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
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

  const handleExportEntries = async () => {
    if (entries.length === 0) {
      Alert.alert('No Entries', 'You don\'t have any journal entries to export yet.');
      return;
    }

    setExporting(true);
    try {
      await exportAsText(entries);
    } catch (error) {
      Alert.alert('Export Failed', 'There was an error exporting your entries. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleYearInReview = async () => {
    const currentYear = new Date().getFullYear();
    const yearEntries = entries.filter((e) => new Date(e.createdAt).getFullYear() === currentYear);

    if (yearEntries.length < 5) {
      Alert.alert(
        'Not Enough Entries',
        `You need at least 5 entries from ${currentYear} to generate a year in review. You currently have ${yearEntries.length}.`
      );
      return;
    }

    setExporting(true);
    try {
      await exportYearInReview(entries);
    } catch (error) {
      Alert.alert('Export Failed', 'There was an error generating your year in review. Please try again.');
    } finally {
      setExporting(false);
    }
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

  const handleSaveName = () => {
    setUserName(tempName.trim());
    setShowNameModal(false);
  };

  const handleOpenNameModal = () => {
    setTempName(userName || '');
    setShowNameModal(true);
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

          {/* Profile Section */}
          <SettingsSection title="Profile" delay={75}>
            <SettingsRow
              icon={<User size={18} color="#7C8B75" strokeWidth={2} />}
              label="Your name"
              sublabel={userName || 'Tap to set your name'}
              onPress={handleOpenNameModal}
              rightElement={
                <View className="flex-row items-center">
                  <Text style={{ fontFamily: 'DMSans_500Medium' }} className="text-stone-500 mr-2">
                    {userName || 'Not set'}
                  </Text>
                  <Edit3 size={16} color="#9C9690" strokeWidth={2} />
                </View>
              }
              isLast
            />
          </SettingsSection>

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

          {/* Export Section */}
          <SettingsSection title="Export" delay={150}>
            <SettingsRow
              icon={<FileText size={18} color="#7C8B75" strokeWidth={2} />}
              label="Export all entries"
              sublabel="Save as text file"
              onPress={handleExportEntries}
              rightElement={
                exporting ? (
                  <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-400 text-sm">
                    Exporting...
                  </Text>
                ) : (
                  <ChevronRight size={18} color="#9C9690" />
                )
              }
            />
            <SettingsRow
              icon={<Sparkles size={18} color="#C49A5A" strokeWidth={2} />}
              label={`${new Date().getFullYear()} Year in Review`}
              sublabel="AI-generated summary of your year"
              onPress={handleYearInReview}
              isLast
              rightElement={
                exporting ? (
                  <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-400 text-sm">
                    Generating...
                  </Text>
                ) : (
                  <ChevronRight size={18} color="#9C9690" />
                )
              }
            />
          </SettingsSection>

          {/* Privacy Section */}
          <SettingsSection title="Privacy" delay={175}>
            <View className="px-4 py-4">
              <View className="flex-row items-start mb-3">
                <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#E8EDE6' }}>
                  <Shield size={18} color="#5C6B56" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'DMSans_600SemiBold' }} className="text-stone-800 text-base mb-1">
                    Your entries are private
                  </Text>
                  <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-400 text-sm leading-5">
                    All journal entries are stored locally on your device. Nothing is uploaded to the cloud or shared with anyone.
                  </Text>
                </View>
              </View>
              <View className="bg-stone-50 rounded-xl p-3 mt-2">
                <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-500 text-xs leading-4">
                  AI features (transcription, insights) send data to OpenAI for processing but entries are never stored on their servers.
                </Text>
              </View>
            </View>
          </SettingsSection>

          {/* Data Section */}
          <SettingsSection title="Data" delay={200}>
            <SettingsRow
              icon={<Download size={18} color="#5A7A8B" strokeWidth={2} />}
              label="Entries stored"
              sublabel="All data stays on your device"
              rightElement={
                <Text style={{ fontFamily: 'DMSans_500Medium' }} className="text-stone-500">
                  {entries.length}
                </Text>
              }
            />
            <SettingsRow
              icon={<Trash2 size={18} color="#DC6B6B" strokeWidth={2} />}
              label="Clear all entries"
              sublabel="Permanently delete everything"
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

        {/* Name Edit Modal */}
        <Modal
          visible={showNameModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNameModal(false)}
        >
          <Pressable
            className="flex-1 bg-black/50 items-center justify-center px-8"
            onPress={() => setShowNameModal(false)}
          >
            <Pressable
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
              onPress={(e) => e.stopPropagation()}
            >
              <View className="items-center mb-4">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: '#E8EDE6' }}
                >
                  <User size={24} color="#7C8B75" strokeWidth={2} />
                </View>
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                  className="text-stone-800 text-xl text-center"
                >
                  What's your name?
                </Text>
              </View>

              <Text
                style={{ fontFamily: 'DMSans_400Regular' }}
                className="text-stone-500 text-center mb-4"
              >
                This will be used in your greetings
              </Text>

              <TextInput
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your name"
                placeholderTextColor="#9C9690"
                autoFocus
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 16,
                  color: '#44403C',
                  backgroundColor: '#FAF8F5',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                }}
              />

              <View className="gap-3">
                <Pressable
                  onPress={handleSaveName}
                  className="py-3.5 rounded-2xl"
                  style={{ backgroundColor: '#7C8B75' }}
                >
                  <Text
                    style={{ fontFamily: 'DMSans_500Medium' }}
                    className="text-white text-center"
                  >
                    Save
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowNameModal(false)}
                  className="py-3.5 rounded-2xl bg-stone-100"
                >
                  <Text
                    style={{ fontFamily: 'DMSans_500Medium' }}
                    className="text-stone-700 text-center"
                  >
                    Cancel
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
