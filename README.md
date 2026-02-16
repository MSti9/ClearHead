# ClearHead

A beautiful mental health journaling app built with React Native and Expo. ClearHead helps users reflect, track emotions, and gain insights through voice journaling, AI-powered reflections, and pattern analysis.

## Features

### 🎙️ Voice Journaling
- Record journal entries with voice or text
- AI-powered transcription and formatting
- Voice coach for guided reflection sessions
- Audio playback of your entries

### 📊 Insights & Analytics
- Emotion tracking and visualization
- Pattern detection across entries
- Calendar view of your journaling history
- Tag-based organization

### 🎨 Beautiful Design
- Modern iOS-inspired interface
- Smooth animations and transitions
- Dark mode support
- Paper texture aesthetic for journal entries

### 🔐 Privacy & Security
- Local-first data storage
- Secure authentication with Better Auth
- Your data stays on your device

## Tech Stack

### Mobile App
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand
- **UI Components**: Custom components with Lucide icons
- **Animations**: React Native Reanimated

### Backend
- **Runtime**: Bun
- **Framework**: Hono (lightweight web framework)
- **Database**: SQLite with Prisma ORM
- **Authentication**: Better Auth

### AI Integrations
- **Anthropic Claude Sonnet 4.5** for chat and text generation
- **OpenAI Whisper** for speech-to-text transcription
- **OpenAI TTS** (Nova voice) for text-to-speech
- Pattern analysis and auto-tagging
- All API calls routed through the backend (keys never exposed to client)

## Project Structure

```
ClearHead/
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── app/           # Expo Router screens
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and helpers
│   │   └── stores/        # Zustand state management
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # Bun backend server
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   └── lib/           # Backend utilities
│   ├── prisma/            # Database schema and migrations
│   └── package.json
│
└── shared/                # Shared code between mobile and backend
```

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (v1.0+)
- [Node.js](https://nodejs.org) (v18+)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app for testing on physical devices

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MSti9/ClearHead.git
   cd ClearHead
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   bun install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   bunx prisma generate

   # Run migrations
   bunx prisma migrate deploy
   ```

4. **Install mobile dependencies**
   ```bash
   cd ../mobile
   bun install
   ```

5. **Configure environment variables**

   Create `.env` files in both `backend/` and `mobile/` directories:

   **backend/.env:**
   ```env
   PORT=3000
   OPENAI_API_KEY="your-openai-key"
   ANTHROPIC_API_KEY="your-anthropic-key"
   ```

   **mobile/.env:**
   ```env
   EXPO_PUBLIC_BACKEND_URL="http://localhost:3000"
   ```

### Running the App

1. **Start the backend server**
   ```bash
   cd backend
   bun run dev
   ```
   Server runs on http://localhost:3000

2. **Start the Expo app** (in a new terminal)
   ```bash
   cd mobile
   bunx expo start
   ```

3. **Open the app**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## Key Features Explained

### Journal Entries
- Create entries via voice recording or text input
- AI formats and enhances your transcriptions
- Auto-tagging based on content and emotions
- View entries in timeline or calendar format

### Voice Coach
- Interactive guided reflection sessions
- AI-powered personalized questions (Claude Sonnet 4.5)
- Voice responses with OpenAI TTS (Nova voice)
- Helps users explore their thoughts deeper

### Pattern Analysis
- Detects recurring themes in your journal
- Identifies emotional patterns over time
- Provides insights into your mental health journey

### Export & Privacy
- Export your journal as PDF or text
- All data stored locally on your device
- Optional cloud backup (coming soon)

## API Keys Required

To use all features, you'll need (configured in `backend/.env`):
- **Anthropic API Key** - For AI chat and text generation (Claude Sonnet 4.5)
- **OpenAI API Key** - For speech-to-text transcription (Whisper) and text-to-speech (TTS)

Get your keys from:
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys

## Development

### Running Tests
```bash
cd mobile
bun test
```

### Database Management
```bash
cd backend

# View database in Prisma Studio
bunx prisma studio

# Create a new migration
bunx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
bunx prisma migrate reset
```

### Building for Production

**iOS:**
```bash
cd mobile
eas build --platform ios
```

**Android:**
```bash
cd mobile
eas build --platform android
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary. All rights reserved.

## Support

For issues, questions, or feedback, please open an issue on GitHub.

---

Built with ❤️ using Vibecode - The AI App Builder
