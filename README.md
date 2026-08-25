
- **📱 100% Local-First S
  Zero loading screens, zero internet dependency. Notes are written directly to your device's SQLite database (`expo-sqlite`).

- **⚡ Smart Background Sync Queue**  
  Edits made offline are automatically queued with pending status. As soon as connectivity returns, Driftnote pushes ch- **⏱️ 750ms Debounced Autosave**  
  No manual save button required. As you type, notes are debounced and saved automatically with an unobtrusive `StatusPill` indicator (*Saving...*, *Saved locally*  Eveedit creates an immutable local snapshot stored in SQLite. Browse historical versions and restore any past state with
- **⚔️ 3-Way Conflict Resolution**  
  Handles sync conflicts contextually with an interactive modal presenting three distinct resolution strategies:
  - **Keep Mine**: Retains local device version.
  - **Keep Synced Version**: Overwrites with remote version.
  - **Merge Both**: Intelligently concatenates both versions.

- **🎨 Clean Figma-Inspired Authentication**  
  Multi-frame authentication flow (*Login*, *Create Account*, *Forgot Password*, *Set New Password*) with top curved hero headers, warm tinted inputs, high-contrast action buttons, and a **1-Tap Demo Mode** for fast evaluation.

- **🌗 Persisted Dark & Light Themes**  
  Sleek design system built with custom theme tokens (`#090D16` dark mode / `#F8FAFC` light mode) and brand accent tied directly to the **Synced** status indicator.

- **📳 Tactile Haptic Feedback**  
  Uses `expo-haptics` for tactile feedback during save, delete, and sync actions.

---

## 🛠️ Tech Stack

- **Framework:** React Native (Expo SDK 54)
- **Routing:** Expo Router v6 (File-based navigation with 4-tab bar)
- **Language:** TypeScript (Strict mode)
- **Database:** `expo-sqlite` (v16 modern async API)
- **State Management:** Zustand (Notes, Sync Queue, Auth, & Settings stores)
- **Persistence:** `@react-native-async-storage/async-storage`
- **Network State:** `expo-network`
- **Haptics:** `expo-haptics`

---

## 📂 Project Structure

```
driftnote/
├── app/                        # Expo Router file-based pages
│   ├── (tabs)/                 # Bottom 4-tab bar (Notes, Search, Sync, Settings)
│   ├── _layout.tsx             # Root Stack layout & DB startup initialization
│   ├── auth.tsx                # Authentication entry route
│   ├── editor.tsx              # Note editor route (?id=...)
│   ├── history.tsx             # Version history route (?id=...)
│   ├── onboarding.tsx          # Interactive onboarding slides
│   └── splash.tsx              # Animated brand splash screen
└── src/
    ├── constants/
    │   └── theme.ts            # Design system tokens (light/dark themes, typography)
    ├── components/             # Reusable UI components
    │   ├── ConflictResolutionModal.tsx
    │   ├── NoteCard.tsx
    │   ├── StatusPill.tsx
    │   └── SyncDot.tsx
    ├── screens/                # Full screen views
    │   ├── AuthScreen.tsx
    │   ├── NoteEditorScreen.tsx
    │   ├── NotesListScreen.tsx
    │   ├── OnboardingScreen.tsx
    │   ├── SearchScreen.tsx
    │   ├── SettingsScreen.tsx
    │   ├── SplashScreen.tsx
    │   ├── SyncStatusScreen.tsx
    │   └── VersionHistoryScreen.tsx
    ├── services/               # Service layer
    │   ├── db.ts               # SQLite schema & CRUD operations
    │   ├── network.ts          # Network check & sync queue stub
    │   └── storage.ts          # AsyncStorage helper
    ├── store/                  # Zustand state stores
    │   ├── useAuthStore.ts
    │   ├── useNoteStore.ts
    │   ├── useSettingsStore.ts
    │   └── useSyncStore.ts
    └── types/
        └── note.ts             # TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and npm installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/driftnote.git
   cd driftnote
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npx expo start --clear
   ```

4. **Run on a device or emulator:**
   - Press **`a`** to launch in Android Emulator / device.
   - Press **`i`** to launch in iOS Simulator.
   - Scan the QR code using **Expo Go** on your physical mobile device.

---

## 🔒 Security & Privacy

Driftnote is designed with privacy at its core. Your notes are stored exclusively in your device's encrypted sandbox container via SQLite. No data leaves your phone unless you configure a remote sync backend.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
