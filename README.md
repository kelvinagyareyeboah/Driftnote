s an immutable snapshot. Browse
- **State** — Zustand (notes, sync queue, auth, and settings stores)
- **Persistence** — `@react-native-async-storage/async-storage`
- **Network** — `expo-network`
- *
```
drif# Expo Router file-based pages
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
