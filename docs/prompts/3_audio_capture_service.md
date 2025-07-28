# Step 3: Audio Capture Service Implementation

## Context
You are implementing Step 3 of a real-time Japanese translation app. The previous steps have:
1. Set up the React + TypeScript project with Bun, Tailwind CSS, Zustand, and Dexie
2. Created comprehensive TypeScript type definitions in `src/types/`

## Objective
Create an audio capture service that handles microphone permissions, captures audio streams, and monitors audio levels. After implementation, the user should be able to open the app in their browser and interact with recording controls that show visual feedback.

## Requirements

### 1. Create Audio Capture Service (`src/services/audio/AudioCapture.ts`)
Implement a service class that:
- Requests microphone permissions using the Web Audio API
- Captures audio streams from the user's microphone
- Monitors real-time audio levels for visual feedback
- Handles errors gracefully (permission denied, no microphone, etc.)
- Provides methods to start/stop capture
- Emits audio level updates for UI visualization

The service should follow this interface pattern:
```typescript
interface AudioService {
  startCapture(): Promise<MediaStream>;
  stopCapture(): void;
  getAudioLevel(): number;
  onAudioLevel(callback: (level: number) => void): void;
  isCapturing(): boolean;
}
```

### 2. Create Basic UI Components
Create minimal React components in `src/components/`:

**AudioControls.tsx**:
- Record button with start/stop states
- Visual state changes (color, icon) based on recording status
- Disabled state while requesting permissions

**AudioLevelIndicator.tsx**:
- Real-time audio level visualization (e.g., animated bars or meter)
- Smooth animations using CSS transitions
- Shows levels from 0-100

### 3. Create Custom Hook (`src/hooks/useAudioStream.ts`)
Create a React hook that:
- Manages the AudioCapture service instance
- Handles component lifecycle (cleanup on unmount)
- Provides recording state to components
- Manages audio level subscriptions

### 4. Update App Component
Modify `src/App.tsx` to:
- Import and render the audio components
- Show a simple layout with the record button and level indicator
- Display the current recording state
- Apply basic Tailwind styling for a clean interface

### 5. Add Error Handling
Implement proper error states for:
- Microphone permission denied
- No microphone detected
- Browser doesn't support Web Audio API
- Display user-friendly error messages

## Technical Specifications

### Audio Capture Details
- Use `getUserMedia` API for microphone access
- Create an `AudioContext` and `AnalyserNode` for level monitoring
- Sample audio levels at ~30fps for smooth visualization
- Calculate RMS (Root Mean Square) for accurate level representation

### Browser Compatibility
- Add checks for Web Audio API support
- Provide fallback messages for unsupported browsers
- Test in Chrome, Firefox, and Safari

## Success Criteria
After implementing this step:
1. Running `bun dev` shows the app with recording controls
2. Clicking the record button requests microphone permission
3. When recording, the audio level indicator shows real-time levels
4. The record button changes appearance when active
5. Console logs show audio level values
6. Proper error messages appear for permission denial
7. `bun typecheck` passes with no errors

## File Structure to Create
```
src/
├── services/
│   └── audio/
│       └── AudioCapture.ts
├── components/
│   ├── AudioControls.tsx
│   └── AudioLevelIndicator.tsx
├── hooks/
│   └── useAudioStream.ts
└── App.tsx (modify existing)
```

## Testing Instructions
1. Run `bun dev` to start the development server
2. Open the browser and navigate to the local dev URL
3. Click the record button and grant microphone permission
4. Speak or make noise to see the level indicator respond
5. Click stop to end recording
6. Open browser console to verify audio levels are being logged
7. Test permission denial by blocking microphone access
8. Verify all TypeScript types are properly defined

## Notes
- Keep the UI minimal and functional for this MVP stage
- Focus on core functionality over aesthetics
- Ensure all code follows TypeScript strict mode
- Use existing types from `src/types/` where applicable
- Console logging is acceptable for this stage to verify functionality