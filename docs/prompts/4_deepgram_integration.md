# Step 4: Deepgram Integration

Implement Deepgram real-time transcription service with WebSocket connection, API key handling, and basic UI for testing.

## Core Requirements

### 1. Deepgram Client Service
Create `src/services/transcription/DeepgramClient.ts` with:
- WebSocket connection to Deepgram's real-time API
- Auto-reconnect logic with exponential backoff
- Streaming audio chunk handling
- Error handling and connection state management
- Event-driven architecture for transcript updates

### 2. API Key Management
Since IndexedDB isn't implemented yet:
- Add a simple form field in the UI for manual API key entry
- Store API key in memory/session storage for testing
- Display connection status (connected/disconnected/error)
- Add basic validation for API key format

### 3. Basic Transcript UI
Create a rudimentary interface to display Deepgram transcription:
- Real-time transcript display area
- Show interim vs final transcripts differently (styling)
- Basic error messages for connection issues
- Clear transcript functionality

### 4. Integration Points
- Connect audio capture service from Step 3 to Deepgram client
- Handle audio format conversion if needed (Deepgram expects specific formats)
- Implement proper cleanup on component unmount

## Technical Specifications

### Deepgram WebSocket Configuration
- Use Deepgram's real-time streaming API
- Configure for Japanese language detection
- Enable interim results for real-time feedback
- Set appropriate audio encoding parameters

### Error Handling
- Network connectivity issues
- Invalid API key responses
- WebSocket connection failures
- Audio format incompatibilities

### State Management
- Connection status (idle, connecting, connected, error)
- Current transcript segments (interim and final)
- Error messages and user feedback

## Testing Approach
- Mock WebSocket server for connection testing
- Test auto-reconnect scenarios
- Verify audio data is properly streamed
- Test API key validation
- Manual testing with real Deepgram API

## Files to Create/Modify
- `src/services/transcription/DeepgramClient.ts` - Main service
- `src/components/ApiKeyInput.tsx` - API key form component
- `src/components/TranscriptDisplay.tsx` - Basic transcript UI
- Update main App component to integrate new features

## Success Criteria
- ✅ WebSocket connects to Deepgram with valid API key
- ✅ Real-time audio transcription displays in UI
- ✅ Connection auto-recovers from temporary failures
- ✅ User can enter/change API key through form
- ✅ Clear error messages for connection issues
- ✅ Clean disconnect when stopping recording

## Dependencies
- Ensure Step 3 (Audio Capture Service) is completed
- Deepgram SDK or direct WebSocket implementation
- Audio format utilities if needed for compatibility