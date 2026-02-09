import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { extractTagsFromContent } from '@/lib/autoTag';

export type EntryType = 'text' | 'voice' | 'prompted';

export interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  type: EntryType;
  promptUsed?: string;
  voiceDuration?: number;
  mood?: string;
  tags?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
}

export interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:mm format
  days: number[]; // 0-6 for Sun-Sat
  gentleNudge: boolean;
}

interface JournalState {
  entries: JournalEntry[];
  reminderSettings: ReminderSettings;
  lastEntryDate: string | null;
  streak: number;
  isLoading: boolean;
  isHydrated: boolean;
  userName: string | null;

  // Actions
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  clearAllEntries: () => void;
  setReminderSettings: (settings: Partial<ReminderSettings>) => void;
  setUserName: (name: string) => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const STORAGE_KEY = 'journal_data';

const defaultReminderSettings: ReminderSettings = {
  enabled: false,
  time: '20:00',
  days: [0, 1, 2, 3, 4, 5, 6],
  gentleNudge: true,
};

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  reminderSettings: defaultReminderSettings,
  lastEntryDate: null,
  streak: 0,
  isLoading: true,
  isHydrated: false,
  userName: null,

  addEntry: (entry) => {
    const now = new Date().toISOString();

    // Auto-tag the entry
    const { themes, sentiment } = extractTagsFromContent(entry.content);

    const newEntry: JournalEntry = {
      ...entry,
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      tags: themes,
      sentiment,
    };

    set((state) => {
      const newEntries = [newEntry, ...state.entries];
      const today = new Date().toDateString();
      const lastDate = state.lastEntryDate;

      let newStreak = state.streak;
      if (lastDate) {
        const lastDateObj = new Date(lastDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDateObj.toDateString() === yesterday.toDateString()) {
          newStreak += 1;
        } else if (lastDateObj.toDateString() !== today) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      return {
        entries: newEntries,
        lastEntryDate: today,
        streak: newStreak,
      };
    });

    get().saveToStorage();
  },

  updateEntry: (id, updates) => {
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
          : entry
      ),
    }));
    get().saveToStorage();
  },

  deleteEntry: (id) => {
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    }));
    get().saveToStorage();
  },

  clearAllEntries: () => {
    set({
      entries: [],
      lastEntryDate: null,
      streak: 0,
    });
    get().saveToStorage();
  },

  setReminderSettings: (settings) => {
    set((state) => ({
      reminderSettings: { ...state.reminderSettings, ...settings },
    }));
    get().saveToStorage();
  },

  setUserName: (name) => {
    set({ userName: name });
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({
          entries: parsed.entries || [],
          reminderSettings: parsed.reminderSettings || defaultReminderSettings,
          lastEntryDate: parsed.lastEntryDate || null,
          streak: parsed.streak || 0,
          userName: parsed.userName || null,
          isLoading: false,
          isHydrated: true,
        });
      } else {
        set({ isLoading: false, isHydrated: true });
      }
    } catch (error) {
      console.error('Failed to load journal data:', error);
      set({ isLoading: false, isHydrated: true });
    }
  },

  saveToStorage: async () => {
    try {
      const { entries, reminderSettings, lastEntryDate, streak, userName } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ entries, reminderSettings, lastEntryDate, streak, userName })
      );
    } catch (error) {
      console.error('Failed to save journal data:', error);
    }
  },
}));
