# Claude Code Guidelines for Landside Astrology

## Package Manager
**Always use `bun` instead of `npm` or `yarn` for all commands.**

## Available Commands
Run these commands with `bun`:
- `bun run dev` - Start development server
- `bun run build` - Build for production (runs TypeScript check first)
- `bun run preview` - Preview production build
- `bun run typecheck` - Run TypeScript type checking
- `bun run lint` - Run ESLint (max 0 warnings)
- `bun run format` - Format code with Prettier
- `bun run test` - Run tests with Vitest
- `bun run test:ui` - Run tests with UI
- `bun run test:coverage` - Run tests with coverage

## Code Style Guidelines

### IMPORTANT: Always use formatting tools
- **Before committing any code changes**, run `bun format` to ensure consistent formatting
- **Never** manually fix code style issues - let Prettier handle it
- After making changes, run `bun lint` and `bun typecheck` to catch issues

### Keep code simple and readable
1. **Avoid premature optimization**
   - Don't use `useMemo` unless there's a proven performance issue
   - Don't use `useCallback` for simple event handlers
   - Write straightforward logic first, optimize only when necessary

2. **Prefer simplicity over abstraction**
   - Write code that's easy to understand at first glance
   - Avoid creating abstractions until patterns clearly emerge
   - Use explicit, descriptive variable names

3. **React-specific guidelines**
   - Use functional components with hooks
   - Keep components focused and single-purpose
   - Extract complex logic into custom hooks only when reused multiple times
   - State updates should be straightforward - avoid complex state management patterns unless truly needed

### Example of preferred simplicity:
```tsx
// ❌ Overengineered
const MemoizedValue = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);

// ✅ Simple and clear
const activeItems = items.filter(item => item.active);
```

## Project Overview
This is a web app for experimenting with real-time translation APIs, primarily focused on Japanese translation. The tech stack includes:
- React 19 with TypeScript
- Vite for bundling
- Tailwind CSS for styling
- Zustand for state management
- Deepgram SDK for speech/translation services
- Dexie for IndexedDB operations

## Testing
- Tests use Vitest with React Testing Library
- Run `bun test` before finalizing changes
- Focus on testing user interactions and critical business logic
