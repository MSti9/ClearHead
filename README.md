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

### Auto-Tagging & Filtering
- Entries are automatically tagged based on content
- Theme tags: #work, #family, #relationships, #health, #stress, #grief, #joy, #gratitude, #growth, #money, #faith, #creativity
- Sentiment detection: positive, negative, neutral, mixed
- Tags displayed on entry cards
- Filter entries by tag to see patterns (in "View all" screen)
- Tag counts show how often you write about each topic

### Voice Recording
- Tap to record your thoughts
- Visual waveform feedback while recording
- Pause and resume support
- Auto-transcription using OpenAI Whisper
- **Coach Follow-Up Questions**: After saving a voice entry, the app may ask a gentle follow-up question
  - Text-to-speech reads the question aloud (natural, conversational voice)
  - Rule-based question generation detects themes (stress, work, family, emotions)
  - Option to record a response or skip
  - Follow-up responses are appended to the original entry
  - Appears on ~70% of entries (not pushy)
  - Can replay, stop, or skip the spoken question

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
- **Reflection prompts** based on past entries ("2 weeks ago you wrote about X...")
- Helps create continuity and track progress over time

### Export Options
- Export all entries as a text file
- Year in Review - AI-generated summary of your year
- Stats, themes, and personalized insights
- Easy sharing via native share sheet

### Privacy & Security
- All entries stored locally on your device
- Nothing uploaded to the cloud
- Clear "your entries are private" messaging
- Transparent about AI feature data handling

### Text Journaling
- Clean, distraction-free writing interface
- Word count tracking
- Support for prompted and free-form entries
- **Rich text editing with Markdown support**
  - Bold, italic, headers, quotes, bullet lists, numbered lists
  - Formatting toolbar for easy access
  - Markdown renders beautifully when viewing entries

### Entry Management
- View full entry details
- Edit entries after saving
- Delete entries with confirmation
- Entry type badges (voice, prompted, written)

### Reminder Settings
- Customizable reminder time
- Select active days of the week
- Gentle nudge mode with prompts (softer reminders)
- Local push notifications (requires permission)
- Automatically schedules/cancels based on settings

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
