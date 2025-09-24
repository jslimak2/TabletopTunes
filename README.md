# TabletopTunes 🎵🎲

**The Ultimate Board Game Soundtrack Player with Movie Soundtrack Matching**

TabletopTunes is a multi-platform audio player specifically designed for tabletop gaming sessions. Our core feature intelligently suggests movie soundtracks that perfectly match your board games, creating the ideal atmospheric backdrop for any gaming experience.

## 🎯 Core Features

### 🎬 Movie Soundtrack Matching
- **Smart Board Game Analysis**: Enter any board game name and get curated movie soundtrack suggestions
- **Intelligent Matching Algorithm**: Analyzes game themes, mechanics, and mood to suggest perfect soundtracks
- **Extensive Game Database**: Pre-configured suggestions for popular games like Gloomhaven, Catan, Pandemic, Scythe, and many more
- **Movie-to-Game Reasoning**: Detailed explanations of why each soundtrack matches your game

### 🎵 Enhanced Audio Experience
- **Category-Based Browsing**: Explore soundtracks by genre (Fantasy, Sci-Fi, Horror, Adventure, etc.)
- **Professional Audio Controls**: Play/Pause, Previous/Next, Volume, Progress, Shuffle, and Loop
- **Smart Playlist Management**: Save and load custom playlists with names
- **Real-time Track Information**: See movie source and track details

### 📱 Multi-Platform Support
- **Progressive Web App (PWA)**: Install on mobile devices for native app experience
- **Android Application**: Full Android app using Capacitor framework
- **Desktop Application**: Cross-platform desktop app built with Electron
- **Web Browser**: Works perfectly in any modern browser

## 🎮 Supported Board Games

Our database includes intelligent soundtrack matching for:

### Strategy Games
- **Settlers of Catan** → Lord of the Rings, How to Train Your Dragon
- **Ticket to Ride** → Around the World in 80 Days, The Polar Express
- **Wingspan** → March of the Penguins, Studio Ghibli films
- **Scythe** → Steampunk soundtracks like Mortal Engines
- **Splendor** → Renaissance-era films like Amadeus

### Adventure & Fantasy
- **Gloomhaven** → Epic fantasy like Lord of the Rings, Conan
- **Betrayal at House on the Hill** → Horror classics like The Conjuring
- **King of Tokyo** → Kaiju films like Godzilla, Pacific Rim

### Cooperative & Thematic
- **Pandemic** → Thriller soundtracks like Contagion, 28 Days Later
- **Dead of Winter** → Survival horror like The Thing, 30 Days of Night
- **Azul** → Artistic films like Amélie, The Secret Garden

### Classic Games
- **Risk** → Epic war films like Gladiator, Braveheart
- **Clue** → Mystery classics like Murder on the Orient Express
- **Monopoly** → Business themes like The Wolf of Wall Street

## 🚀 Getting Started

### Web Browser (Instant)
1. Open `index.html` in any modern web browser
2. Enter your board game name or browse categories
3. Click play and enjoy perfectly matched soundtracks!

### Progressive Web App
1. Visit the web version on your mobile device
2. Look for "Add to Home Screen" or "Install App" prompt
3. Install for native app experience with offline support

### Desktop Application
```bash
# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# Build for production
npm run electron:build
```

### Android Application
```bash
# Install dependencies
npm install

# Add Android platform
npm run capacitor:add:android

# Build and open in Android Studio
npm run android:build
```

## 💡 How It Works

### 1. Board Game Analysis
TabletopTunes analyzes your board game across multiple dimensions:
- **Theme**: Fantasy, Sci-Fi, Horror, Historical, etc.
- **Mood**: Tense, Relaxed, Epic, Mysterious
- **Mechanics**: Cooperative, Competitive, Story-driven
- **Setting**: Medieval, Space, Modern, Ancient

### 2. Movie Soundtrack Matching
Our algorithm matches games to movie soundtracks based on:
- **Thematic Alignment**: Fantasy games get fantasy movie soundtracks
- **Mood Compatibility**: Tense games get suspenseful soundtracks
- **Atmospheric Fit**: Horror games get creepy movie themes
- **Pacing Match**: Fast games get energetic soundtracks

### 3. Curated Recommendations
Each suggestion includes:
- **Movie Title**: Source of the soundtrack
- **Reasoning**: Why this soundtrack fits your game
- **Specific Tracks**: Hand-picked tracks that match best
- **Alternative Options**: Multiple soundtracks per game

## 🛠️ Technology Stack

### Frontend
- **HTML5 & CSS3**: Modern, responsive design with animations
- **Vanilla JavaScript**: Clean, efficient client-side functionality
- **Font Awesome**: Beautiful icons and visual elements
- **Progressive Web App**: Manifest, Service Worker, offline support

### Mobile & Desktop
- **Capacitor**: Native Android app functionality
- **Electron**: Cross-platform desktop application
- **Node.js**: Development and build tools

### Data & Storage
- **Local Storage**: Persistent user preferences and playlists
- **Comprehensive Database**: 20+ board games with movie matches
- **JSON Data Structure**: Flexible, expandable game-soundtrack mapping

## 📊 Browser Compatibility

- **Chrome 60+** ✅
- **Firefox 55+** ✅  
- **Safari 12+** ✅
- **Edge 79+** ✅
- **Mobile Browsers** ✅

## 🔧 Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/jslimak2/TabletopTunes.git
cd TabletopTunes

# Start local server
npm run serve
# or
python3 -m http.server 8000
```

### Adding New Board Games
1. Edit `game-soundtrack-data.js`
2. Add game entry with themes and soundtrack suggestions
3. Include movie titles, reasoning, and specific tracks
4. Test the matching algorithm

### Building for Production
```bash
# Web/PWA - files are ready as-is
npm run build

# Electron Desktop App
npm run electron:build

# Android App
npm run android:build
```

## 🎨 Screenshots

### Web Application
![Desktop Web App](screenshots/desktop.png)

### Mobile PWA
![Mobile App](screenshots/mobile.png)

### Board Game Matching
![Game Suggestions](screenshots/game-matching.png)

## 🎵 Sample Movie Soundtracks

Our database includes tracks from:
- **Epic Fantasy**: Lord of the Rings, Game of Thrones, The Witcher
- **Space Opera**: Star Wars, Interstellar, Blade Runner
- **Horror**: The Conjuring, Halloween, Sinister
- **Adventure**: Indiana Jones, Pirates of the Caribbean
- **Mystery**: Sherlock Holmes, Knives Out
- **And many more...**

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Adding Board Games
- Research game themes and mechanics
- Find matching movie soundtracks
- Add entries to `game-soundtrack-data.js`
- Test suggestions with actual gameplay

### Improving Matching Algorithm
- Enhance theme detection
- Add mood-based matching
- Improve suggestion reasoning
- Add more soundtrack categories

### Platform Features
- Enhance mobile experience
- Add new Electron features
- Improve PWA capabilities
- Add audio file integration

## 📈 Roadmap

- [x] ~~Multi-platform support (PWA, Android, Desktop)~~
- [x] ~~Board game to movie soundtrack matching~~
- [x] ~~Comprehensive game database~~
- [ ] Real audio file integration with preview capability
- [ ] User-uploaded soundtrack support
- [ ] Cloud playlist synchronization
- [ ] Advanced mixing and crossfade controls
- [ ] Sound effect library for immersive gaming
- [ ] Timer integration for game session management
- [ ] Community-driven game and soundtrack database
- [ ] Spotify/Apple Music integration
- [ ] Voice control for hands-free operation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Board Game Community**: Inspiration and feedback from tabletop enthusiasts
- **Movie Soundtrack Artists**: Creating the beautiful music that enhances our games
- **Open Source Libraries**: Electron, Capacitor, and web technologies
- **Game Designers**: Creating amazing games that deserve perfect soundtracks

---

**Perfect soundtracks for every board game adventure!** 🎬🎲🎵

*Transform your tabletop gaming sessions with cinematic soundscapes*
