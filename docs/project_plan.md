# Real-Time Japanese Translation App - Project Plan

## 1. App Functionality

### Core Features
- **Real-time Audio Transcription**: Capture and transcribe Japanese audio from device microphone using DeepGram's live streaming API
- **Side-by-Side Translation**: Display Japanese transcription alongside English translation in real-time
- **Conversation Recording**: Start/stop recording with clear visual indicators
- **Conversation History**: Save and retrieve past conversations with timestamps
- **Offline Viewing**: Access saved conversations without internet connection

### Stretch Features
- **Vocabulary Extraction**: Identify and list unique vocabulary terms from conversations
- **Grammar Pattern Recognition**: Highlight common grammar patterns used
- **Conversation Summarization**: Generate brief summaries of recorded conversations
- **Export Functionality**: Export conversations as text files or PDFs

## 2. Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Bun (for fast development and bundling)
- **State Management**: Zustand (lightweight, TypeScript-friendly)
- **UI Components**: Custom minimal design with Tailwind CSS
- **Storage**: IndexedDB via Dexie.js (TypeScript wrapper)

### APIs
- **Speech-to-Text**: DeepGram Live Transcription API
  - Supports Japanese with high accuracy
  - WebSocket-based for low latency
  - Handles noisy environments well
  
- **Translation**: DeepL API
  - Superior Japanese translation quality
  - ~$25/million characters
  - REST API with low latency
  - Supports formality settings for Japanese

### Development Tools
- **Type Safety**: TypeScript strict mode
- **Code Quality**: ESLint + Prettier
- **Testing**: Vitest for unit tests
- **PWA**: Service Worker for offline functionality

## 3. System Architecture

### High-Level Architecture
```
┌─────────────────────┐
│   Browser Client    │
├─────────────────────┤
│  React Components   │
│  ├── AudioCapture   │
│  ├── Transcription  │
│  ├── Translation    │
│  └── History        │
├─────────────────────┤
│   State Manager     │
│   (Zustand)         │
├─────────────────────┤
│  Service Layer      │
│  ├── AudioService   │
│  ├── TranscriptSvc  │
│  ├── TranslateSvc   │
│  └── StorageService │
├─────────────────────┤
│  External APIs      │
│  ├── DeepGram WS    │
│  └── DeepL REST     │
└─────────────────────┘
```

### File Structure
```
src/
├── components/
│   ├── AudioControls.tsx
│   ├── TranscriptionView.tsx
│   ├── TranslationView.tsx
│   ├── ConversationHistory.tsx
│   └── Settings.tsx
├── services/
│   ├── audio/
│   │   ├── AudioCapture.ts
│   │   └── AudioProcessor.ts
│   ├── transcription/
│   │   ├── DeepGramClient.ts
│   │   └── TranscriptionService.ts
│   ├── translation/
│   │   ├── TranslationService.ts
│   │   └── DeepLClient.ts
│   └── storage/
│       ├── ConversationStore.ts
│       └── SettingsStore.ts
├── hooks/
│   ├── useAudioStream.ts
│   ├── useTranscription.ts
│   └── useTranslation.ts
├── types/
│   ├── conversation.ts
│   ├── api.ts
│   └── settings.ts
├── utils/
│   ├── audioUtils.ts
│   └── textProcessing.ts
└── App.tsx
```

### Key Interfaces
```typescript
interface Conversation {
  id: string;
  startTime: Date;
  endTime?: Date;
  segments: TranscriptionSegment[];
  vocabulary?: ExtractedTerm[];
  summary?: string;
}

interface TranscriptionSegment {
  id: string;
  timestamp: number;
  japanese: string;
  english: string;
  confidence: number;
}

interface AudioService {
  startCapture(): Promise<MediaStream>;
  stopCapture(): void;
  getAudioLevel(): number;
}

interface TranscriptionService {
  connect(apiKey: string): Promise<void>;
  startTranscription(stream: MediaStream): void;
  stopTranscription(): void;
  on(event: 'transcript', handler: (data: TranscriptData) => void): void;
}
```

### Security & Performance
- API keys stored in browser's localStorage with encryption
- WebSocket connections with automatic reconnection
- Audio processing in Web Workers for performance
- Chunked translation requests to minimize latency
- Virtual scrolling for large conversation histories
- Progressive Web App for installability and offline access