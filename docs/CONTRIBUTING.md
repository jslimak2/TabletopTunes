# Contributing to TabletopTunes

Thank you for your interest in contributing to TabletopTunes! This guide will help you get started with contributing to our board game soundtrack matching application.

## 🎯 Ways to Contribute

### 1. Adding New Board Games
The most valuable contribution is expanding our board game database with new games and soundtrack matches.

#### What makes a good board game addition:
- Popular or well-known games
- Games with distinct themes or atmospheres
- Games that would benefit from background music
- Games with clear mood or genre associations

#### Steps to add a board game:
1. Research the game's theme, mechanics, and atmosphere
2. Find 2-3 movie soundtracks that would match well
3. Explain why each soundtrack fits the game
4. Add specific track recommendations from each movie
5. Test your additions in the app

### 2. Improving the Matching Algorithm
Help make our soundtrack suggestions even better!

#### Areas for improvement:
- Theme detection accuracy
- Mood-based matching
- Game mechanic considerations
- Player count influences
- Session length considerations

### 3. Platform Features
Enhance the multi-platform experience:

#### Web/PWA improvements:
- Better offline functionality
- Enhanced mobile UI
- Performance optimizations
- Additional PWA features

#### Desktop (Electron) improvements:
- Native menu enhancements
- System integration features
- File system operations
- Better keyboard shortcuts

#### Android (Capacitor) improvements:
- Native device integrations
- Android-specific UI patterns
- Background audio handling
- Performance optimizations

### 4. UI/UX Enhancements
Make the app more beautiful and user-friendly:

- Visual design improvements
- Animation enhancements
- Accessibility improvements
- Responsive design fixes
- Dark/light theme options

## 🛠️ Development Setup

### Prerequisites
- Node.js 16 or higher
- Git
- A modern code editor (VS Code recommended)
- Basic knowledge of HTML, CSS, and JavaScript

### Getting Started
```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/TabletopTunes.git
cd TabletopTunes

# Install dependencies (for Electron/Capacitor features)
npm install

# Start development server
python3 -m http.server 8000
# or
npm run serve

# Open in browser
open http://localhost:8000
```

### Project Structure
```
TabletopTunes/
├── index.html              # Main HTML file
├── styles.css              # All CSS styles
├── script.js               # Main JavaScript application
├── game-soundtrack-data.js # Board game database
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for PWA
├── package.json            # Node.js dependencies
├── capacitor.config.ts     # Android app configuration
├── electron-main.js        # Electron main process
├── electron-preload.js     # Electron preload script
├── icons/                  # App icons for all platforms
├── docs/                   # Documentation
└── README.md              # Main documentation
```

## 📝 Adding Board Games

### Step 1: Research the Game
Before adding a game, research:
- **Theme**: Fantasy, Sci-Fi, Horror, Historical, Modern, etc.
- **Mood**: Tense, Relaxed, Epic, Mysterious, Fun, etc.
- **Mechanics**: Cooperative, Competitive, Worker Placement, etc.
- **Setting**: Time period, location, genre
- **Player Experience**: What emotions does the game evoke?

### Step 2: Find Matching Soundtracks
Look for movie soundtracks that match the game's:
- **Thematic elements** (fantasy game → fantasy movie)
- **Emotional tone** (tense game → suspenseful movie)
- **Setting/Period** (medieval game → medieval movie)
- **Atmosphere** (spooky game → horror movie)

### Step 3: Edit the Database
Open `game-soundtrack-data.js` and add your entry:

```javascript
'Your Game Name': {
    category: 'strategy', // strategy, adventure, horror, cooperative, etc.
    themes: ['keyword1', 'keyword2', 'theme3'], // Descriptive themes
    suggestedSoundtracks: [
        {
            movie: 'Movie Title',
            reason: 'Detailed explanation of why this soundtrack matches the game',
            tracks: ['Specific Track 1', 'Specific Track 2', 'Specific Track 3']
        },
        {
            movie: 'Another Movie',
            reason: 'Another explanation',
            tracks: ['Track A', 'Track B', 'Track C']
        },
        {
            movie: 'Third Movie Option',
            reason: 'Third explanation',
            tracks: ['Song 1', 'Song 2', 'Song 3']
        }
    ]
}
```

### Step 4: Test Your Addition
1. Save the file and refresh the app
2. Search for your game or click it if you added it to popular games
3. Verify the suggestions appear correctly
4. Check that the reasoning makes sense
5. Test clicking on individual tracks

### Example Entry
```javascript
'Azul': {
    category: 'abstract',
    themes: ['artistic', 'peaceful', 'mediterranean', 'beauty'],
    suggestedSoundtracks: [
        {
            movie: 'The Secret Garden',
            reason: 'Beautiful and artistic themes that match the elegant tile-laying gameplay',
            tracks: ['Main Title', 'The Garden', 'Roses']
        },
        {
            movie: 'Life of Pi',
            reason: 'Colorful and meditative atmosphere perfect for strategic thinking',
            tracks: ['Pi\'s Lullaby', 'God Storm', 'Anandi']
        },
        {
            movie: 'Amélie',
            reason: 'Whimsical and artistic French film matching the game\'s aesthetic beauty',
            tracks: ['Comptine d\'un autre été', 'La Valse d\'Amélie', 'Sur le fil']
        }
    ]
}
```

## 🔧 Technical Contributions

### Code Style Guidelines
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code patterns
- Test your changes across platforms

### JavaScript Guidelines
- Use ES6+ features where appropriate
- Keep functions focused and small
- Handle errors gracefully
- Maintain backward compatibility

### CSS Guidelines
- Follow mobile-first responsive design
- Use CSS custom properties for theming
- Maintain consistent spacing and typography
- Ensure accessibility compliance

### HTML Guidelines
- Use semantic HTML elements
- Include proper ARIA labels
- Maintain valid HTML structure
- Optimize for screen readers

## 🧪 Testing Your Changes

### Manual Testing Checklist
- [ ] App loads without errors in multiple browsers
- [ ] Board game search works correctly
- [ ] Soundtrack suggestions appear properly
- [ ] Individual tracks can be selected and played
- [ ] Playlist functionality works
- [ ] PWA install prompt appears (on HTTPS)
- [ ] Responsive design works on mobile
- [ ] No console errors

### Browser Testing
Test in at least:
- Chrome (latest)
- Firefox (latest)
- Safari (if on Mac)
- Mobile browsers

### Platform Testing
If making platform-specific changes:
- Test PWA installation and functionality
- Test Electron app (if Node.js changes)
- Test Android build (if Capacitor changes)

## 📤 Submitting Your Contribution

### Creating a Pull Request
1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b add-new-games`
3. **Make your changes** following the guidelines above
4. **Test thoroughly** across different platforms
5. **Commit with clear messages**: `git commit -m "Add Wingspan and Azul board games with soundtrack suggestions"`
6. **Push to your fork**: `git push origin add-new-games`
7. **Create a Pull Request** on GitHub

### Pull Request Template
When creating a PR, please include:

```markdown
## Description
Brief description of what you've added or changed.

## Changes Made
- [ ] Added X new board games
- [ ] Improved matching algorithm for Y
- [ ] Fixed bug in Z feature
- [ ] Updated documentation

## Testing
- [ ] Tested in Chrome, Firefox, Safari
- [ ] Tested responsive design
- [ ] Tested PWA functionality
- [ ] No console errors
- [ ] All existing features still work

## Screenshots (if UI changes)
Include screenshots of your changes.

## New Board Games Added (if applicable)
List the games you added and why they're good additions.
```

### Review Process
1. **Automated checks** will run on your PR
2. **Manual review** by maintainers
3. **Testing** of your changes
4. **Feedback** and requested changes (if any)
5. **Merge** once approved

## 🎵 Music Integration Guidelines

### Current State
The app currently uses simulated audio playback to demonstrate the interface and matching logic. Real audio integration is planned for future releases.

### Future Audio Integration
When contributing to audio features:
- Consider copyright and licensing issues
- Use royalty-free or properly licensed music
- Implement preview functionality (30-second clips)
- Support multiple audio formats
- Handle loading states and errors gracefully

### Legal Considerations
- Only use properly licensed audio content
- Provide proper attribution for all soundtracks
- Consider fair use guidelines for short previews
- Research copyright requirements in different regions

## 🐛 Bug Reports

### Before Reporting a Bug
1. Check if the issue already exists in GitHub Issues
2. Try reproducing the bug in different browsers
3. Clear your browser cache and try again
4. Test in an incognito/private browsing window

### Good Bug Reports Include
- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Browser and OS** information
- **Screenshots or videos** if helpful
- **Console errors** (F12 → Console tab)

## 💡 Feature Requests

### Before Requesting a Feature
1. Check existing issues and roadmap
2. Consider if it fits the app's core purpose
3. Think about implementation complexity
4. Consider impact on different platforms

### Good Feature Requests Include
- **Clear description** of the proposed feature
- **Use case** or problem it solves
- **Mockups or examples** if applicable
- **Platform considerations** (web, mobile, desktop)

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor statistics

## 📞 Getting Help

If you need help contributing:
- Open a GitHub Discussion for questions
- Check existing documentation
- Look at similar implementations in the codebase
- Ask specific questions in your PR

Thank you for helping make TabletopTunes better for the entire board gaming community! 🎲🎵