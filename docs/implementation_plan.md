# Real-Time Japanese Translation App - Implementation Plan

## Phase 1: Foundation (Steps 1-2)

**Step 1: Project Setup**
- Initialize React + TypeScript project with Bun
- Install core dependencies: react, typescript, tailwindcss, zustand, dexie
- Configure TypeScript strict mode and ESLint
- Set up Tailwind CSS with minimal theme
- **Test**: Run `bun dev` and verify blank app loads

**Step 2: Core Type Definitions**
- Create `src/types/` directory with interfaces for:
  - `conversation.ts`: Conversation, TranscriptionSegment, ExtractedTerm
  - `api.ts`: DeepgramResponse, DeepLResponse, WebSocketMessage
  - `settings.ts`: UserSettings, APIKeys
- **Test**: Run `bun typecheck` with no errors

## Phase 2: Core Services (Steps 3-7)

**Step 3: Audio Capture Service**
- Implement `src/services/audio/AudioCapture.ts`
- Handle microphone permissions and MediaStream
- Add audio level monitoring
- **Test**: Console log audio levels when capturing

**Step 4: Deepgram Integration**
- Create `src/services/transcription/DeepgramClient.ts`
- Implement WebSocket connection with auto-reconnect
- Handle streaming audio chunks
- **Test**: Mock WebSocket server to verify connection handling

**Step 5: DeepL Translation Service**
- Build `src/services/translation/DeepLClient.ts`
- Implement REST API calls with retry logic
- Add request batching for efficiency
- **Test**: Mock API responses to verify translation flow

**Step 6: State Management**
- Create Zustand stores in `src/stores/`:
  - `conversationStore.ts`: Current conversation state
  - `settingsStore.ts`: User preferences and API keys
- **Test**: Verify state updates via React DevTools

**Step 7: Storage Layer**
- Implement `src/services/storage/ConversationStore.ts` with Dexie
- Define IndexedDB schema for conversations
- Add CRUD operations for conversation history
- **Test**: Save/retrieve test conversation from IndexedDB

## Phase 3: UI Components (Steps 8-13)

**Step 8: Audio Controls**
- Build recording button with visual states
- Add audio level indicator
- Implement start/stop logic
- **Test**: Click button toggles recording state

**Step 9-10: Display Components**
- Create side-by-side transcription/translation views
- Add auto-scroll for new content
- Implement text selection/copy
- **Test**: Display mock Japanese/English text pairs

**Step 11: History Component**
- Build conversation list with timestamps
- Add virtual scrolling for performance
- Implement conversation selection
- **Test**: Load 1000+ mock conversations smoothly

**Step 12: Settings Panel**
- Create API key input forms
- Add secure storage for credentials
- Include test connection buttons
- **Test**: Verify API keys persist after reload

**Step 13: App Integration**
- Wire all components in `App.tsx`
- Connect services to UI via hooks
- Implement error boundaries
- **Test**: Full recording → transcription → translation flow

## Phase 4: Enhancement (Steps 14-18)

**Step 14: PWA Features**
- Add service worker for offline access
- Create app manifest
- Implement cache strategies
- **Test**: App loads offline with cached data

**Step 15-16: Advanced Features**
- Extract vocabulary using NLP patterns
- Add Anki flashcard export for vocabulary and sentences

**Step 17-18: Quality & Performance**
- Write Vitest unit tests for services
- Move audio processing to Web Workers
- **Test**: All tests pass, no UI blocking during recording

Each step is designed to be completed independently with clear verification criteria, making it ideal for iterative development with Claude Code.
