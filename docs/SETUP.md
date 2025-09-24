# TabletopTunes Setup Guide

This guide will help you set up TabletopTunes across different platforms.

## 📱 Mobile Web App (PWA)

### Install on iOS
1. Open Safari and navigate to your TabletopTunes URL
2. Tap the Share button (square with arrow up)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm
5. The app will appear on your home screen like a native app

### Install on Android
1. Open Chrome and navigate to your TabletopTunes URL
2. Look for the "Add to Home Screen" banner or tap the menu (⋮)
3. Select "Add to Home Screen" or "Install App"
4. Tap "Add" to confirm
5. The app will be installed like a native app

### Features Available in PWA Mode
- ✅ Offline functionality (basic app works without internet)
- ✅ Native app experience with fullscreen mode
- ✅ Home screen icon
- ✅ Background audio (where supported)
- ✅ Push notifications (future feature)

## 🖥️ Desktop Application (Electron)

### Prerequisites
- Node.js 16+ installed
- Git (to clone the repository)

### Installation
```bash
# Clone the repository
git clone https://github.com/jslimak2/TabletopTunes.git
cd TabletopTunes

# Install dependencies
npm install

# Run in development mode
npm run electron:dev
```

### Building for Distribution
```bash
# Build for your current platform
npm run electron:build

# The built app will be in the dist-electron folder
```

### Features Available in Desktop Mode
- ✅ Native menu bar with keyboard shortcuts
- ✅ Window management (minimize, maximize, fullscreen)
- ✅ Better file system access (future feature for audio files)
- ✅ System tray integration (future feature)
- ✅ Automatic updates (future feature)

### Keyboard Shortcuts
- `Ctrl/Cmd + N` - New Playlist
- `Ctrl/Cmd + O` - Open Playlist
- `Ctrl/Cmd + S` - Save Playlist
- `Space` - Play/Pause
- `Left Arrow` - Previous Track
- `Right Arrow` - Next Track
- `Ctrl/Cmd + R` - Shuffle
- `Ctrl/Cmd + L` - Loop

## 📱 Android Application (Capacitor)

### Prerequisites
- Node.js 16+ installed
- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK) 8+

### Setup
```bash
# Clone and install dependencies
git clone https://github.com/jslimak2/TabletopTunes.git
cd TabletopTunes
npm install

# Add Android platform
npm run capacitor:add:android

# Sync files and open in Android Studio
npm run android:build
```

### Building APK
1. In Android Studio, go to Build → Build Bundle(s)/APK(s) → Build APK(s)
2. The APK will be generated in `android/app/build/outputs/apk/debug/`

### Features Available in Android Mode
- ✅ Native Android app experience
- ✅ Access to device features (vibration, notifications)
- ✅ Background audio playback
- ✅ Android-specific UI optimizations
- ✅ Hardware back button support
- ✅ Status bar customization

## 🌐 Web Browser (Universal)

### Quick Start
No installation required! Just open `index.html` in any modern web browser.

### Development Server
```bash
# Using Python (built-in)
python3 -m http.server 8000
# Then open http://localhost:8000

# Using Node.js (if you have it)
npx serve .
# or
npm run serve
```

### Features Available in Web Mode
- ✅ Works on any device with a modern browser
- ✅ No installation required
- ✅ Automatic updates
- ✅ Cross-platform compatibility
- ✅ Easy sharing via URL

## 🎮 Board Game Database

### Supported Games
The app includes intelligent soundtrack matching for these games:

**Strategy Games:**
- Settlers of Catan → Lord of the Rings, How to Train Your Dragon
- Ticket to Ride → Around the World in 80 Days, The Polar Express
- Wingspan → March of the Penguins, Studio Ghibli
- Scythe → Steampunk soundtracks
- Splendor → Renaissance films

**Adventure Games:**
- Gloomhaven → Epic fantasy soundtracks
- Betrayal at House on the Hill → Horror classics
- King of Tokyo → Kaiju films

**Cooperative Games:**
- Pandemic → Thriller/crisis soundtracks
- Dead of Winter → Survival horror

**Classic Games:**
- Risk → Epic war films
- Clue → Mystery classics
- Monopoly → Business themes

### Adding New Games
To add support for new board games:

1. Edit `game-soundtrack-data.js`
2. Add a new entry following this structure:
```javascript
'Your Game Name': {
    category: 'strategy', // or 'adventure', 'horror', etc.
    themes: ['keyword1', 'keyword2', 'keyword3'],
    suggestedSoundtracks: [
        {
            movie: 'Movie Title',
            reason: 'Why this soundtrack matches',
            tracks: ['Track 1', 'Track 2', 'Track 3']
        }
        // Add more movie suggestions...
    ]
}
```

## 🛠️ Troubleshooting

### PWA Not Installing
- Make sure you're using HTTPS (required for PWA)
- Try refreshing the page and looking for the install prompt
- Check that your browser supports PWAs (most modern browsers do)

### Electron App Won't Start
- Ensure Node.js 16+ is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Check that all dependencies installed correctly

### Android Build Issues
- Verify Android Studio and SDK are properly installed
- Make sure ANDROID_HOME environment variable is set
- Try cleaning the project: `cd android && ./gradlew clean`

### Audio Not Playing
- This is expected - the current version uses simulated playback
- Real audio integration is planned for future releases
- The app demonstrates the interface and matching logic

## 🔄 Updates

### Web/PWA
- Updates automatically when you refresh the page
- Service worker will cache new versions

### Desktop (Electron)
- Manual updates: download new version and reinstall
- Auto-updates planned for future releases

### Android
- Manual updates: install new APK
- Play Store distribution planned for future releases

## 📊 Performance Tips

### For Best Performance
- Close unused browser tabs when using web version
- Use desktop app for better performance on computers
- Use Android app for best mobile experience
- Enable hardware acceleration in browser settings

### Storage Usage
- App stores playlists locally using browser storage
- Icons and cached data use minimal space (~5MB)
- No cloud storage currently (planned for future)

## 🔒 Privacy & Security

### Data Storage
- All data stored locally on your device
- No personal information sent to external servers
- Playlists saved in browser local storage

### Permissions
- **PWA**: Minimal permissions, mostly for app installation
- **Desktop**: No special permissions required
- **Android**: May request audio/media permissions for future features

Need help? Check the [main README](../README.md) or open an issue on GitHub!