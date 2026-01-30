# Clearhead

A gentle journaling app for people who want to journal but struggle to do it consistently. No pressure, no guilt—just a calm space to clear your head whenever you need it.

**clearhead.app**

## Features

### Home Dashboard
- Time-aware greetings that change throughout the day
- Breathing orb animation for a calming presence
- Quick access to voice recording and text journaling
- Browse prompts when you do not know where to start
- View recent journal entries (5 most recent with "View all" link)
- Calendar button to view journaling history

### Calendar View
- Monthly calendar showing which days you journaled
- Navigate between months to see your history
- Monthly stats: days journaled and total entries
- Tap any highlighted day to see that day's entries
- Visual indicators for days with multiple entries

### AI-Powered Patterns & Insights
- After 10+ entries, AI analyzes your journaling patterns
- Identifies recurring themes (work stress, relationships, health, etc.)
- Notices emotional patterns (what makes you happy, stressed, peaceful)
- Provides warm, supportive observations to help you understand yourself
- Insights are cached for 24 hours to minimize API usage
- Teaser message shows progress toward unlocking insights

### Voice Recording
- Tap to record your thoughts
- Visual waveform feedback while recording
- Pause and resume support
- Save as voice notes (transcription ready for AI integration)

### Prompt Library
- 6 categories of thoughtful prompts:
  - Work & Career
  - Relationships
  - Self & Identity
  - Stress & Anxiety
  - Gratitude & Joy
  - Change & Decisions
- "Surprise me" random prompt feature
- Prompts are saved with entries for context

### Text Journaling
- Clean, distraction-free writing interface
- Word count tracking
- Support for prompted and free-form entries

### Entry Management
- View full entry details
- Edit entries after saving
- Delete entries with confirmation
- Entry type badges (voice, prompted, written)

### Reminder Settings
- Customizable reminder time
- Select active days of the week
- Gentle nudge mode for softer reminders
- Enable/disable reminders easily

## Design

- Warm, neutral color palette (stone, sand, sage, terracotta)
- Cormorant Garamond serif font for headers (warm, literary feel)
- DM Sans for body text (clean, readable)
- Gentle animations throughout
- Gender-neutral aesthetic

## Tech Stack

- Expo SDK 53
- React Native 0.76.7
- Zustand for state management
- AsyncStorage for persistence
- React Native Reanimated for animations
- Expo AV for audio recording
- NativeWind (Tailwind) for styling
