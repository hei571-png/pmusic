# PMusic Mobile - APK Build Instructions

## Project Overview
PMusic has been transformed into a Metrolist-inspired Material 3 mobile app.

### Features Implemented
- **Material 3 UI** with dynamic colors, rounded corners, and modern aesthetics
- **Bottom Navigation** (Home, Explore, Library, Queue)
- **Full-Screen Player** with blur background artwork
- **Live Lyrics** panel (UI ready, API integration needed)
- **Sleep Timer** with countdown options (5min - 1hour)
- **Download for Offline** - Save songs for offline playback
- **Audio Effects** - Skip silence, normalization, tempo/pitch controls
- **Settings Modal** - Theme toggles (Dark/Pure Black), audio settings
- **Enhanced Queue** - Shuffle, clear, play from queue
- **Improved Search** with category filters
- **Toast Notifications** for user feedback

## File Structure
```
ytmusic web/
├── public/
│   ├── index.html      - New Material 3 UI structure
│   ├── styles.css      - Material 3 design system
│   ├── app.js          - Full-featured JavaScript
│   └── logo.png        - App icon
├── android/            - Capacitor Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── assets/public/  - Web assets
│   │   │   └── res/            - Android resources
│   │   └── build.gradle
│   └── build.gradle
├── server.js
├── capacitor.config.json
└── package.json
```

## To Build the APK

### Option 1: Install Java 11+ (Recommended)

1. Download and install Java 11 or newer:
   - https://adoptium.net/ (Eclipse Temurin JDK 11 or 17)

2. Set JAVA_HOME environment variable:
   ```powershell
   # In PowerShell as Administrator
   [Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17", "Machine")
   ```

3. Add Java to PATH:
   ```powershell
   $path = [Environment]::GetEnvironmentVariable("PATH", "Machine")
   [Environment]::SetEnvironmentVariable("PATH", "$path;%JAVA_HOME%\bin", "Machine")
   ```

4. Restart your terminal and run:
   ```bash
   cd "c:\Users\ADMIN\Downloads\ytmusic web\android"
   .\gradlew assembleRelease
   ```

5. The APK will be at:
   ```
   android\app\build\outputs\apk\release\app-release-unsigned.apk
   ```

### Option 2: Use Android Studio

1. Download and install Android Studio:
   - https://developer.android.com/studio

2. Open the Android project:
   ```
   File > Open > Select: c:\Users\ADMIN\Downloads\ytmusic web\android
   ```

3. Let Android Studio sync and download dependencies

4. Build APK:
   ```
   Build > Build Bundle(s) / APK(s) > Build APK(s)
   ```

### Option 3: Use Online Build Service

Upload the `android` folder to:
- GitHub + GitHub Actions (free CI/CD)
- Bitrise
- Appcircle

## Installation

After building, install on your Android device:

1. Enable "Unknown Sources" in Settings > Security
2. Transfer APK to your device
3. Tap to install

## Development Notes

### Capacitor Commands
```bash
# Sync web changes to Android
npx cap sync android

# Open Android Studio
npx cap open android

# Run on connected device
npx cap run android
```

### Key Changes Made
1. **HTML** - Completely rewritten with Material 3 structure
2. **CSS** - New design system with dynamic colors, elevation, rounded corners
3. **JavaScript** - Added:
   - Full-screen player with gesture controls
   - Sleep timer with countdown
   - Download/offline playback
   - Audio effects (tempo, pitch, skip silence, normalization)
   - Enhanced queue management
   - Bottom sheets for menus
   - Toast notifications

### No Login/Database Required
All data stored locally using:
- localStorage for songs, playlists, settings
- IndexedDB could be added for larger storage

## Testing the Web Version

Before building APK, test the web version:

```bash
cd "c:\Users\ADMIN\Downloads\ytmusic web"
npm start
```

Then open http://localhost:3000 in your browser.

## Troubleshooting

### Build fails with Java version error
- Install Java 11 or 17 (not 8)
- Set JAVA_HOME correctly
- Restart terminal

### Capacitor sync fails
```bash
npx cap sync android --verbose
```

### APK won't install
- Enable "Install from unknown sources" in Android settings
- Check APK is not corrupted
- Try `app-debug.apk` instead of release

## Next Steps (Optional Enhancements)

1. **Add Home Screen Widget** - Android app widget for playback controls
2. **Background Playback** - Configure audio service for background
3. **Push Notifications** - Add Firebase for music recommendations
4. **Lyrics API** - Integrate Genius or similar for live lyrics
5. **Download Audio** - Use youtube-dl or similar for offline audio
6. **Crossfade** - Audio crossfade between tracks
7. **Equalizer** - Built-in EQ settings

## License
Free for personal use. No login or account required.
