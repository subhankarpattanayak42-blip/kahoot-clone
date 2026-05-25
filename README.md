# QuizBlitz — Kahoot-like Real-time Quiz App

A real-time multiplayer quiz app built with React + Firebase.

## Setup (5 minutes)

### Step 1 — Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**, give it a name (e.g. "quizblitz"), click through and create
3. In the left sidebar, click **"Build" → "Firestore Database"**
   - Click **"Create database"** → choose **"Start in production mode"** → select a region → Done
4. In the left sidebar, click **"Build" → "Authentication"**
   - Click **"Get started"** → click **"Anonymous"** → enable it → Save
5. In the left sidebar, click the gear icon → **"Project settings"**
   - Scroll down to **"Your apps"** → click the **`</>`** (Web) icon
   - Register the app (any nickname) → copy the `firebaseConfig` values

### Step 2 — Add your Firebase config

Open `.env` in this folder and fill in your values:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Step 3 — Set Firestore Security Rules

In Firebase Console → Firestore → **Rules** tab, replace the content with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.hostUid == request.auth.uid;
      allow update: if request.auth != null
                    && request.auth.uid == resource.data.hostUid;
      match /players/{playerId} {
        allow read: if true;
        allow write: if request.auth != null
                     && request.auth.uid == playerId;
      }
    }
  }
}
```

Click **Publish**.

### Step 4 — Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## How to Play

1. **Host**: Click "Host a Game" → create questions → share the 6-letter room code
2. **Players**: Click "Join a Game" → enter the room code + a nickname
3. **Host**: Click "Start Game!" when everyone has joined
4. Players answer on their devices; faster correct answers earn more points
5. Leaderboard updates after every question

## Build for production

```bash
npm run build
```
