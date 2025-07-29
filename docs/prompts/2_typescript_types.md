# Step 2: Core Type Definitions

Create the complete TypeScript type definitions for the Real-Time Japanese Translation App. The types should be comprehensive, well-structured, and strictly typed to ensure type safety throughout the application.

## Requirements

1. Create a `src/types/` directory with three main type definition files:
   - `conversation.ts`: Core conversation and transcription types
   - `api.ts`: API request/response types for Deepgram and DeepL
   - `settings.ts`: User settings and configuration types

2. All types must:
   - Use strict TypeScript with no `any` types
   - Include JSDoc comments for complex properties
   - Follow consistent naming conventions (PascalCase for types/interfaces, camelCase for properties)
   - Use readonly modifiers where appropriate for immutability

## Type Specifications

### conversation.ts
- `Conversation`: Main conversation entity with id, timestamps, segments, and optional metadata
- `TranscriptionSegment`: Individual transcription unit with Japanese/English text pairs, timestamps, and confidence scores
- `ExtractedTerm`: Vocabulary term with Japanese text, reading, English meaning, and usage count
- `ConversationSummary`: Brief summary with key points and duration
- Include enums for conversation status (recording, processing, completed, failed)

### api.ts
- `DeepgramResponse`: WebSocket message types for live transcription
- `DeepgramConfig`: Configuration options for the WebSocket connection
- `DeepLResponse`: Translation API response structure
- `DeepLRequest`: Translation request parameters
- `WebSocketMessage`: Generic WebSocket message wrapper with type discrimination
- Error types for both APIs with specific error codes

**API Documentation References:**
- Deepgram Live Transcription: https://developers.deepgram.com/reference/listen-live
- Deepgram WebSocket Guide: https://developers.deepgram.com/docs/lower-level-websockets
- DeepL Translation API: https://developers.deepl.com/api-reference/translate
- DeepL OpenAPI Spec: https://github.com/DeepLcom/openapi/blob/main/openapi.yaml

Consult these official API documentation sources when implementing the types to ensure accuracy and handle all response variations.

### settings.ts
- `UserSettings`: Application preferences (theme, language settings, audio quality)
- `APIKeys`: Secure storage structure for Deepgram and DeepL keys
- `AudioSettings`: Microphone configuration, sample rate, noise suppression
- `DisplaySettings`: UI preferences like font size, layout options
- `ExportSettings`: Format preferences for conversation exports

## Implementation Notes

- Use TypeScript utility types (Partial, Required, Pick, Omit) where appropriate
- Create union types for API response states (loading, success, error)
- Include type guards for runtime type checking of API responses
- Export all types from an index.ts barrel file for clean imports
- Ensure all Date fields use Date type, not string
- Use branded types for IDs to prevent mixing different entity IDs

## Validation

After implementation:
1. Run `bun typecheck` - should pass with no errors
2. All files should have 100% type coverage (no implicit any)
3. Types should be importable from `@/types` alias

## Example Structure

```typescript
// conversation.ts
export interface Conversation {
  readonly id: ConversationId;
  startTime: Date;
  endTime?: Date;
  status: ConversationStatus;
  segments: ReadonlyArray<TranscriptionSegment>;
  // ... etc
}
```

Focus on creating a robust type system that will prevent runtime errors and make the codebase maintainable.