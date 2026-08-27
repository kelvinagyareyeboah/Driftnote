         # Design tokens (theme, typography)
    ├── components/
    │   ├── ConflictResolution    │   ├── AuthS    
    │   ├── Onboardin├── SearchScr    │   ├── Sp
    │   ├── SyncStatusScreen.tsx
    │   └── VersionHistoryScreen.tsx
    ├──
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
