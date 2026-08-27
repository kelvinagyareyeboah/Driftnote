ingful edit creates an immutable snapshot. Browse past versions and restore any of them in on| **🎨 Figma-Inspired Auth Flow** | Login, Create Account, Forgot Password, and Set New Password screens, plus a 1-tap demo mode for fast evaluation. |
| **🌗 Light & Dark Themes** | A custom design-token system (`#090D16` dark / `#F8FAFC` light) with the brand accent tied to the *Synced* status c
- **Framework** — React Native (Expo SDK 54)
- **Routing** — Expo Router v6, file-based, 4-tab bottom navigation
- **Language** — TypeScript (strict mode)
- **Database** — `expo-sqlite` (v16 async API)
- **State** — Zustand (notes, sync queue, auth, and settings stores)
- **Persistence** — `@react-native-async-storage/async-storage`
- **Network** — `expo-network`
- **Haptics** — `expo-haptics`

## Project Structure

```
driftnote/
├── app/                      # Expo Router file-based pages
│   ├── (tabs)/                 # Notes · Search · Sync · Settings
│   ├── _layout.tsx             # Root stack layout & DB init
│   ├── auth.tsx                # Authentication entry route
│   ├── editor.tsx              # Note editor (?id=...)
│   ├── history.tsx             # Version history (?id=...)
│   ├── onboarding.tsx          # Onboarding slides
│   └── splash.tsx              # Animated splash screen
│
└── src/
    ├── constants/
    │   └── theme.ts             # Design tokens (theme, typography)
    ├── components/
    │   ├── ConflictResolutionModal.tsx
    │   ├── NoteCard.tsx
    │   ├── StatusPill.tsx
    │   └── SyncDot.tsx
    ├── screens/
    │   ├── AuthScreen.tsx
    │   ├── NoteEditorScreen.tsx
    │   ├── NotesListScreen.tsx
    │   ├── OnboardingScreen.tsx
    │   ├── SearchScreen.tsx
    │   ├── SettingsScreen.tsx
    │   ├── SplashScreen.tsx
    │   ├── SyncStatusScreen.tsx
    │   └── VersionHistoryScreen.tsx
    ├── services/
    │   ├── db.ts                # SQLite schema & CRUD
    │   ├── network.ts           # Network checks & sync queue
    │   └── storage.ts           # AsyncStorage helper
    ├── store/
    │   ├── useAuthStore.ts
    │   ├── useNoteStore.ts
    │   ├── useSettingsStore.ts
    │   └── useSyncStore.ts
    └── types/
        └── note.ts               # Shared TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js v18+
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/driftnote.git
cd driftnote

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npx expo start --clear
```

### Run on a Device

| Key | Target |
|---|---|
| `a` | Android emulator / device |
| `i` | iOS simulator |
| — | Scan the QR code with **Expo Go** on a physical device |

## Security & Privacy

Notes live exclusively in your device's encrypted sandbox via SQLite. Nothing leaves your phone unless you configure a remote sync backend.

## License

Released under the [MIT License](LICENSE).
