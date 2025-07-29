# Step 1: Project Setup - Real-Time Japanese Translation App

## Context
You are building a real-time Japanese translation app that captures audio, transcribes it using Deepgram, and translates it using DeepL. This is the first step in the implementation plan.

## Tech Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Bun (for fast development and bundling)
- **State Management**: Zustand (lightweight, TypeScript-friendly)
- **UI Components**: Custom minimal design with Tailwind CSS
- **Storage**: IndexedDB via Dexie.js (TypeScript wrapper)
- **Testing**: Vitest for unit tests

## Task
Initialize the React + TypeScript project with all core dependencies and configurations.

## Steps to Complete

1. **Initialize the project with Bun**
   ```bash
   bun create react-app landside-astrology --template typescript
   cd landside-astrology
   ```

2. **Install core dependencies**
   ```bash
   bun add zustand dexie tailwindcss @types/react @types/react-dom
   bun add -d @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier prettier autoprefixer postcss vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
   ```

3. **Configure TypeScript for strict mode**
   Update `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "jsx": "react-jsx",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "moduleResolution": "bundler",
       "allowSyntheticDefaultImports": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "noImplicitReturns": true,
       "noFallthroughCasesInSwitch": true
     },
     "include": ["src"],
     "exclude": ["node_modules", "build", "dist"]
   }
   ```

4. **Set up Tailwind CSS**
   Initialize Tailwind:
   ```bash
   bunx tailwindcss init -p
   ```

   Update `tailwind.config.js`:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {
         colors: {
           primary: {
             50: '#f0f9ff',
             500: '#3b82f6',
             600: '#2563eb',
             700: '#1d4ed8',
           }
         }
       },
     },
     plugins: [],
   }
   ```

   Create `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

5. **Configure ESLint and Prettier**
   Create `.eslintrc.json`:
   ```json
   {
     "env": {
       "browser": true,
       "es2021": true
     },
     "extends": [
       "eslint:recommended",
       "plugin:@typescript-eslint/recommended",
       "plugin:react/recommended",
       "plugin:react-hooks/recommended",
       "prettier"
     ],
     "parser": "@typescript-eslint/parser",
     "parserOptions": {
       "ecmaVersion": "latest",
       "sourceType": "module",
       "ecmaFeatures": {
         "jsx": true
       }
     },
     "plugins": ["@typescript-eslint", "react", "react-hooks"],
     "rules": {
       "react/react-in-jsx-scope": "off"
     },
     "settings": {
       "react": {
         "version": "detect"
       }
     }
   }
   ```

   Create `.prettierrc`:
   ```json
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 80,
     "tabWidth": 2
   }
   ```

6. **Configure Vitest**
   Create `vitest.config.ts`:
   ```typescript
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: './src/test/setup.ts',
     },
   });
   ```

   Create `src/test/setup.ts`:
   ```typescript
   import '@testing-library/jest-dom';
   ```

7. **Update package.json scripts**
   Add these scripts:
   ```json
   {
     "scripts": {
       "dev": "bun run vite",
       "build": "tsc && bun run vite build",
       "preview": "bun run vite preview",
       "typecheck": "tsc --noEmit",
       "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
       "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
       "test": "vitest",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest --coverage"
     }
   }
   ```

8. **Create initial project structure**
   ```
   src/
   ├── components/
   ├── services/
   ├── hooks/
   ├── types/
   ├── utils/
   ├── stores/
   ├── test/
   │   └── setup.ts
   ├── App.tsx
   ├── App.test.tsx
   ├── main.tsx
   └── index.css
   ```

9. **Create a Hello World page**
   Update `src/App.tsx`:
   ```tsx
   function App() {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="text-center">
           <h1 className="text-4xl font-bold text-gray-800 mb-4">
             Hello World
           </h1>
           <p className="text-lg text-gray-600">
             Landside Astrology
           </p>
         </div>
       </div>
     );
   }

   export default App;
   ```

10. **Create a basic test**
    Create `src/App.test.tsx`:
    ```tsx
    import { render, screen } from '@testing-library/react';
    import { describe, it, expect } from 'vitest';
    import App from './App';

    describe('App', () => {
      it('renders hello world', () => {
        render(<App />);
        expect(screen.getByText('Hello World')).toBeInTheDocument();
        expect(screen.getByText('Landside Astrology')).toBeInTheDocument();
      });
    });
    ```

## Verification
After completing these steps, run:
```bash
bun dev
```

You should see a "Hello World" page with Tailwind styling. Also verify:
- `bun typecheck` runs without errors
- `bun lint` runs without errors
- `bun test` runs and passes the hello world test
- The page displays "Hello World" and "Landside Astrology" centered on a gray background