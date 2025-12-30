# GhostSignal 👻

**GhostSignal** is a production-grade anonymous messaging platform designed for the post-privacy age. It features end-to-end encryption concepts, ephemeral media, secure voice/video calls, and native Tor network detection.

![GhostSignal Banner](https://picsum.photos/800/200?grayscale&blur=2)

## 🚀 Features

*   **Anonymous Identity**: No phone numbers or emails. Accounts are generated via Cryptographic Codenames.
*   **Ephemeral Media**: "View Once" photos that blur and self-destruct after viewing.
*   **Secure P2P Calls**: WebRTC-based voice and video calls (Direct peer-to-peer).
*   **Tor Network Ready**: Automatically detects `.onion` environments and disables high-bandwidth features (media/calls) to prevent IP leaks.
*   **Zero-Trace Infrastructure**: Messages are designed to be ephemeral.
*   **Admin Panel**: Built-in monitoring dashboard for traffic analysis and moderation.
*   **Cyberpunk UI**: A terminal-inspired, dark-mode-first interface using Tailwind CSS.

---

## 🛠️ Technology Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS
*   **Backend**: Firebase (Firestore, Auth, Storage)
*   **Realtime**: Firestore Realtime Listeners
*   **Media**: WebRTC (Simulated/Ready for TURN implementation)

---

## ⚙️ Configuration

Before running the app, you need to configure the Firebase connection.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  **Enable Authentication**: Go to Build > Authentication > Sign-in method > Enable **Email/Password**.
4.  **Enable Firestore**: Go to Build > Firestore Database > Create Database.
5.  **Get Config**: Go to Project Settings > General > Your apps > Web app > SDK setup and configuration.

### Update Code
Open `constants.ts` and replace the placeholder `FIREBASE_CONFIG` with your actual keys:

```typescript
// constants.ts
export const APP_CONFIG = {
  // ...
  FIREBASE_CONFIG: {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "...",
    appId: "..."
  }
};
```

### Security Rules
Copy the contents of `firestore.rules` from this project into your Firebase Console (Firestore > Rules) to ensure data security.

---

## 📦 Deployment Guide: Vercel

Follow these steps to deploy GhostSignal to Vercel for free.

### Step 1: Push to GitHub
1.  Initialize a git repository:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub.
3.  Push your code:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    git push -u origin main
    ```

### Step 2: Import to Vercel
1.  Log in to [Vercel](https://vercel.com/).
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your GitHub repository and click **Import**.

### Step 3: Configure Build Settings
Vercel usually detects the framework automatically (Vite/React). Verify the settings:

*   **Framework Preset**: Vite
*   **Root Directory**: `./` (default)
*   **Build Command**: `npm run build` (or `vite build`)
*   **Output Directory**: `dist`

> **Note**: If your project relies on environment variables (recommended for production), go to the **Environment Variables** section in Vercel and add your Firebase keys (e.g., `VITE_FIREBASE_API_KEY`) instead of hardcoding them in `constants.ts`. You will need to update `constants.ts` to read `import.meta.env.VITE_FIREBASE_API_KEY`.

### Step 4: Deploy
1.  Click **Deploy**.
2.  Wait for the build to finish.
3.  Once complete, your app will be live at `https://your-project-name.vercel.app`.

---

## 🛡️ Tor Deployment (Optional)

To host this as a hidden service:
1.  Deploy the app to a server (VPS).
2.  Install `tor` and `nginx`.
3.  Configure `/etc/tor/torrc` to point a hidden service to your local web server port.
4.  Restart Tor to generate your `.onion` address.
5.  GhostSignal will automatically detect the `.onion` domain and switch to "Secure Mode".

---

## 📜 License

MIT License. Designed for educational and privacy research purposes.
