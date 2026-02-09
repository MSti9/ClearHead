import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utility for the journal app
 * Provides consistent haptic feedback across the app
 */

// Light tap - for general button presses, navigation
export const lightTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// Medium tap - for more significant actions like opening modals
export const mediumTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

// Heavy tap - for critical actions
export const heavyTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

// Selection feedback - for toggles, pickers, selections
export const selection = () => {
  Haptics.selectionAsync();
};

// Success feedback - for completed actions (save, transcribe complete)
export const success = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// Warning feedback - for destructive action confirmations
export const warning = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

// Error feedback - for failed actions
export const error = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};
