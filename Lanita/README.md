# Lanita Mobile Ordering Application

This directory contains the **Lanita Mobile App** client frontend, packaged as a hybrid mobile application using **Capacitor** for deployment to the **Android** platform.

The app interfaces with the **Online Restaurant Ordering System** backend APIs to handle user authorization, cart checkout, and real-time order tracking.

<br />

---

<br />

## 🚀 Core Configuration

### Server URL Configuration
The base app configuration is stored in [capacitor.config.json](file:///d:/DEGREE%20-%20UTM%20IDP%20%28LESSON%29/Github/Online-Restaurant-Ordering-System/Lanita/capacitor.config.json).
1. **Local Development / Remote Server**: If you want the app to load a remote backend/web page, specify the URL in the `server.url` property:
   ```json
   "server": {
     "url": "http://YOUR_LOCAL_IP:8000",
     "cleartext": true
   }
   ```
2. **Standalone Web Directory**: If you want to package the app completely standalone (running local pre-built static assets from the `www/` directory), delete the `"server"` block from the configuration.

<br />

---

<br />

## 🛠 Setup & Run

### 1. Prerequisites
Ensure you have the following installed:
* **Node.js** (v18+)
* **Android Studio** (for Android development)

---

### 2. Capacitor Mobile App Build & Compilation (Android)
To compile and build the **Lanita** mobile application:
1. Navigate to the `Lanita` directory.
2. Ensure `capacitor.config.json` points to your backend web service URL (e.g., `https://online-restaurant-ordering-system.onrender.com` or your local development IP) under the `"server.url"` key if remote server hosting is desired.
3. Install dependencies:
   ```bash
   npm install
   ```
4. If you haven't add the `android` folder, run this command:
   ```bash
   npx cap add android
   ```
5. Sync the compiled assets to the native platforms:
   ```bash
   npx cap sync
   ```
6. Open the native platform workspace in Android Studio:
   ```bash
   npx cap open android
   ```
7. Resolve Potential Gradle/JDK Errors (First Time Only)
   Once Android Studio opens the project and starts indexing, if you see an "Invalid Gradle JDK configuration found" error popup in the bottom right corner:
   *   Click the blue link in the popup that says `Use Embedded JDK (.../jbr)`.
   *   Click the Sync Project with Gradle Files button (the Elephant 🐘 icon) in the top-right toolbar to re-sync.
8. Inside Android Studio, build, sign, and compile the final production APK or bundle for deployment.
