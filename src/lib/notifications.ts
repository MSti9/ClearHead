import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { ReminderSettings } from '@/stores/journalStore';
import { getRandomPrompt } from './prompts';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_NOTIFICATION_ID = 'journal_daily_reminder';

/**
 * Request permission to send notifications
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule daily journal reminders based on settings
 */
export async function scheduleReminders(settings: ReminderSettings): Promise<void> {
  // Cancel existing reminders first
  await cancelReminders();

  if (!settings.enabled) {
    return;
  }

  // Check permissions
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permissions not granted');
    return;
  }

  const [hoursStr, minutesStr] = settings.time.split(':');
  const hour = parseInt(hoursStr, 10);
  const minute = parseInt(minutesStr, 10);

  // Get gentle messages for the notification
  const gentleMessages = settings.gentleNudge
    ? [
        { title: 'A moment for yourself?', body: getRandomPrompt().prompt },
        { title: 'Checking in', body: 'No pressure, but your journal is here when you need it.' },
        { title: 'Quick thought?', body: 'Sometimes just a few words can help clear your head.' },
        { title: 'Your space awaits', body: getRandomPrompt().prompt },
      ]
    : [
        { title: 'Time to journal', body: 'Take a moment to write down your thoughts.' },
        { title: 'Journal reminder', body: 'Your daily journaling time is here.' },
      ];

  // Schedule notifications for each enabled day
  for (const dayIndex of settings.days) {
    const message = gentleMessages[Math.floor(Math.random() * gentleMessages.length)];

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: { type: 'journal_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: dayIndex + 1, // expo uses 1-7 (Sunday=1), we use 0-6
          hour,
          minute,
        },
        identifier: `${REMINDER_NOTIFICATION_ID}_${dayIndex}`,
      });
    } catch (error) {
      console.error(`Failed to schedule notification for day ${dayIndex}:`, error);
    }
  }
}

/**
 * Cancel all journal reminder notifications
 */
export async function cancelReminders(): Promise<void> {
  try {
    // Cancel all scheduled notifications with our prefix
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.identifier.startsWith(REMINDER_NOTIFICATION_ID)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Failed to cancel reminders:', error);
  }
}

/**
 * Get status of scheduled reminders
 */
export async function getScheduledReminders(): Promise<number> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    return scheduledNotifications.filter((n) =>
      n.identifier.startsWith(REMINDER_NOTIFICATION_ID)
    ).length;
  } catch {
    return 0;
  }
}
