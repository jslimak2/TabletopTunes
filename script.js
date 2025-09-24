// TabletopTunes JavaScript - Board Game Soundtrack Player

class TabletopTunes {
    constructor() {
        this.audioPlayer = document.getElementById('audio-player');
        this.currentPlaylist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isShuffle = false;
        this.isLoop = false;
        this.currentCategory = null;
        this.currentBoardGame = null;
        this.matchingMode = 'category'; // 'category' or 'boardgame'
        
        // Mock soundtrack data (in a real app, this would come from a server or local files)
        this.soundtracks = {
            ambient: [
                { name: "Forest Whispers", duration: "4:32", url: "#", description: "Gentle forest sounds", movie: "Studio Ghibli Collection" },
                { name: "Ocean Breeze", duration: "3:45", url: "#", description: "Calming ocean waves", movie: "Moana" },
                { name: "Mountain Wind", duration: "5:12", url: "#", description: "High altitude ambience", movie: "The Secret Garden" },
                { name: "Rain Drops", duration: "6:00", url: "#", description: "Soft rainfall sounds", movie: "Amélie" }
            ],
            fantasy: [
                { name: "Dragon's Lair", duration: "3:28", url: "#", description: "Epic fantasy adventure", movie: "Lord of the Rings" },
                { name: "Enchanted Forest", duration: "4:15", url: "#", description: "Magical woodland journey", movie: "The Chronicles of Narnia" },
                { name: "Castle Walls", duration: "3:52", url: "#", description: "Medieval fortress theme", movie: "Game of Thrones" },
                { name: "Mystic Spell", duration: "2:43", url: "#", description: "Magical incantations", movie: "Harry Potter" }
            ],
            scifi: [
                { name: "Space Station", duration: "4:20", url: "#", description: "Futuristic facility ambience", movie: "Interstellar" },
                { name: "Alien World", duration: "5:05", url: "#", description: "Extraterrestrial exploration", movie: "Star Wars" },
                { name: "Cyberpunk City", duration: "3:36", url: "#", description: "Neon-lit urban future", movie: "Blade Runner" },
                { name: "Starship Bridge", duration: "4:48", url: "#", description: "Command center atmosphere", movie: "Star Trek" }
            ],
            horror: [
                { name: "Haunted Manor", duration: "3:17", url: "#", description: "Spooky mansion ambience", movie: "The Conjuring" },
                { name: "Creeping Shadows", duration: "4:02", url: "#", description: "Suspenseful darkness", movie: "Halloween" },
                { name: "Ancient Curse", duration: "3:55", url: "#", description: "Mystical dread", movie: "The Mummy" },
                { name: "Whispers in the Dark", duration: "2:28", url: "#", description: "Eerie whispers", movie: "Sinister" }
            ],
            adventure: [
                { name: "Epic Quest", duration: "4:33", url: "#", description: "Heroic journey theme", movie: "Indiana Jones" },
                { name: "Treasure Hunt", duration: "3:21", url: "#", description: "Exciting exploration", movie: "Pirates of the Caribbean" },
                { name: "Victory March", duration: "2:56", url: "#", description: "Triumphant celebration", movie: "Gladiator" },
                { name: "Journey's End", duration: "4:44", url: "#", description: "Peaceful resolution", movie: "The Lord of the Rings" }
            ],
            tavern: [
                { name: "Merry Gathering", duration: "3:40", url: "#", description: "Festive celebration", movie: "The Princess Bride" },
                { name: "Bard's Tale", duration: "4:15", url: "#", description: "Storytelling atmosphere", movie: "Robin Hood" },
                { name: "Drinking Song", duration: "2:33", url: "#", description: "Jovial drinking melody", movie: "Pirates of the Caribbean" },
                { name: "Late Night Chat", duration: "3:58", url: "#", description: "Quiet tavern ambience", movie: "The Hobbit" }
            ]
        };
        
        this.initializeEventListeners();
        this.loadUserPreferences();
        this.updateDisplay();
        this.initializeElectronIntegration();
    }
    
    initializeElectronIntegration() {
        // Check if running in Electron
        if (window.electronAPI) {
            console.log('Running in Electron - setting up menu integration');
            
            // Set up menu action listeners
            window.electronAPI.onMenuAction((event, action) => {
                switch (event) {
                    case 'menu-play-pause':
                        this.togglePlayPause();
                        break;
                    case 'menu-previous':
                        this.previousTrack();
                        break;
                    case 'menu-next':
                        this.nextTrack();
                        break;
                    case 'menu-shuffle':
                        this.toggleShuffle();
                        break;
                    case 'menu-loop':
                        this.toggleLoop();
                        break;
                    case 'menu-save-playlist':
                        // Focus on playlist name input
                        document.getElementById('playlist-name').focus();
                        break;
                    case 'menu-new-playlist':
                        this.clearCurrentPlaylist();
                        break;
                    case 'menu-open-playlist':
                        // Focus on playlist name input for loading
                        document.getElementById('playlist-name').focus();
                        this.showNotification('Enter playlist name and click Load Playlist');
                        break;
                }
            });
        }
    }
    
    clearCurrentPlaylist() {
        this.currentPlaylist = [];
        this.currentTrackIndex = 0;
        this.currentCategory = null;
        this.currentBoardGame = null;
        this.pause();
        this.displayPlaylist();
        this.updateCurrentTrackInfo();
        document.querySelector('.playlist-section h2').textContent = 'Current Playlist';
        this.showNotification('Playlist cleared');
    }
    
    initializeEventListeners() {
        // Audio player events
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.nextTrack());
        
        // Control buttons
        document.getElementById('play-pause-btn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('prev-btn').addEventListener('click', () => this.previousTrack());
        document.getElementById('next-btn').addEventListener('click', () => this.nextTrack());
        document.getElementById('shuffle-btn').addEventListener('click', () => this.toggleShuffle());
        document.getElementById('loop-btn').addEventListener('click', () => this.toggleLoop());
        
        // Volume control
        const volumeSlider = document.getElementById('volume-slider');
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // Progress bar
        const progressBar = document.querySelector('.progress-bar');
        progressBar.addEventListener('click', (e) => this.seek(e));
        
        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => this.selectCategory(card.dataset.category));
        });
        
        // Board game search
        document.getElementById('search-game-btn').addEventListener('click', () => this.performGameSearch());
        document.getElementById('game-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performGameSearch();
            }
        });
        
        // Playlist controls
        document.getElementById('save-playlist').addEventListener('click', () => this.savePlaylist());
        document.getElementById('load-playlist').addEventListener('click', () => this.loadPlaylist());
    }
    
    selectCategory(category) {
        // Remove active class from all cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Add active class to selected card
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.currentCategory = category;
        this.currentPlaylist = [...this.soundtracks[category]];
        this.currentTrackIndex = 0;
        this.displayPlaylist();
        this.updateCurrentTrackInfo();
    }
    
    displayPlaylist() {
        const trackList = document.getElementById('track-list');
        
        if (this.currentPlaylist.length === 0) {
            trackList.innerHTML = '<p class="empty-playlist">Select a category to see available tracks</p>';
            return;
        }
        
        trackList.innerHTML = this.currentPlaylist.map((track, index) => `
            <div class="track-item ${index === this.currentTrackIndex ? 'playing' : ''}" 
                 onclick="tabletopTunes.selectTrack(${index})">
                <span class="track-name">${track.name}</span>
                <span class="track-duration">${track.duration}</span>
            </div>
        `).join('');
    }
    
    selectTrack(index) {
        this.currentTrackIndex = index;
        this.updateCurrentTrackInfo();
        this.displayPlaylist();
        
        // Auto-play if a track was already playing
        if (this.isPlaying) {
            this.play();
        }
    }
    
    updateCurrentTrackInfo() {
        const trackTitle = document.getElementById('current-track');
        const trackCategory = document.getElementById('current-category');
        
        if (this.currentPlaylist.length > 0 && this.currentTrackIndex < this.currentPlaylist.length) {
            const currentTrack = this.currentPlaylist[this.currentTrackIndex];
            trackTitle.textContent = currentTrack.name;
            trackCategory.textContent = `${this.getCurrentCategoryName()} - ${currentTrack.description}`;
        } else {
            trackTitle.textContent = 'No track selected';
            trackCategory.textContent = 'Select a soundtrack category';
        }
    }
    
    getCurrentCategoryName() {
        const categoryNames = {
            ambient: 'Ambient',
            fantasy: 'Fantasy',
            scifi: 'Sci-Fi',
            horror: 'Horror',
            adventure: 'Adventure',
            tavern: 'Tavern'
        };
        return categoryNames[this.currentCategory] || 'Unknown';
    }
    
    togglePlayPause() {
        if (this.currentPlaylist.length === 0) {
            this.showNotification('Please select a soundtrack category first');
            return;
        }
        
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        if (this.currentPlaylist.length === 0) return;
        
        // Since we don't have actual audio files, we'll simulate playback
        this.isPlaying = true;
        this.updatePlayButton();
        this.simulateAudioPlayback();
        this.displayPlaylist();
        
        this.showNotification(`Now playing: ${this.currentPlaylist[this.currentTrackIndex].name}`);
    }
    
    pause() {
        this.isPlaying = false;
        this.updatePlayButton();
        this.displayPlaylist();
        
        if (this.playbackSimulation) {
            clearInterval(this.playbackSimulation);
        }
    }
    
    simulateAudioPlayback() {
        // Simulate audio playback progress (since we don't have real audio files)
        let currentTime = 0;
        const duration = this.getDurationInSeconds(this.currentPlaylist[this.currentTrackIndex].duration);
        
        this.playbackSimulation = setInterval(() => {
            if (!this.isPlaying) return;
            
            currentTime += 1;
            this.updateProgressDisplay(currentTime, duration);
            
            if (currentTime >= duration) {
                clearInterval(this.playbackSimulation);
                this.nextTrack();
            }
        }, 1000);
    }
    
    getDurationInSeconds(timeString) {
        const [minutes, seconds] = timeString.split(':').map(Number);
        return minutes * 60 + seconds;
    }
    
    updateProgressDisplay(currentTime, duration) {
        const progressPercent = (currentTime / duration) * 100;
        document.getElementById('progress').style.width = `${progressPercent}%`;
        document.getElementById('current-time').textContent = this.formatTime(currentTime);
        document.getElementById('duration').textContent = this.formatTime(duration);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    updatePlayButton() {
        const playBtn = document.getElementById('play-pause-btn');
        const icon = playBtn.querySelector('i');
        
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }
    
    previousTrack() {
        if (this.currentPlaylist.length === 0) return;
        
        this.currentTrackIndex = this.currentTrackIndex > 0 
            ? this.currentTrackIndex - 1 
            : this.currentPlaylist.length - 1;
            
        this.updateCurrentTrackInfo();
        this.displayPlaylist();
        
        if (this.isPlaying) {
            this.play();
        }
    }
    
    nextTrack() {
        if (this.currentPlaylist.length === 0) return;
        
        if (this.isLoop && this.currentTrackIndex === this.currentPlaylist.length - 1) {
            this.currentTrackIndex = 0;
        } else if (this.isShuffle) {
            this.currentTrackIndex = Math.floor(Math.random() * this.currentPlaylist.length);
        } else {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.currentPlaylist.length;
        }
        
        this.updateCurrentTrackInfo();
        this.displayPlaylist();
        
        if (this.isPlaying) {
            this.play();
        }
    }
    
    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        const shuffleBtn = document.getElementById('shuffle-btn');
        shuffleBtn.classList.toggle('active', this.isShuffle);
        
        this.showNotification(`Shuffle ${this.isShuffle ? 'enabled' : 'disabled'}`);
    }
    
    toggleLoop() {
        this.isLoop = !this.isLoop;
        const loopBtn = document.getElementById('loop-btn');
        loopBtn.classList.toggle('active', this.isLoop);
        
        this.showNotification(`Loop ${this.isLoop ? 'enabled' : 'disabled'}`);
    }
    
    setVolume(value) {
        this.audioPlayer.volume = value / 100;
        document.getElementById('volume-display').textContent = `${value}%`;
        
        // Update volume icon based on level
        const volumeIcon = document.querySelector('.volume-control i');
        if (value == 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (value < 50) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }
    
    seek(event) {
        // This would work with real audio files
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        
        if (this.audioPlayer.duration) {
            this.audioPlayer.currentTime = percent * this.audioPlayer.duration;
        }
    }
    
    savePlaylist() {
        const playlistName = document.getElementById('playlist-name').value.trim();
        
        if (!playlistName) {
            this.showNotification('Please enter a playlist name');
            return;
        }
        
        if (this.currentPlaylist.length === 0) {
            this.showNotification('Please select a category first');
            return;
        }
        
        const playlist = {
            name: playlistName,
            category: this.currentCategory,
            tracks: this.currentPlaylist,
            created: new Date().toISOString()
        };
        
        // Save to localStorage
        const savedPlaylists = JSON.parse(localStorage.getItem('tabletopTunes_playlists') || '{}');
        savedPlaylists[playlistName] = playlist;
        localStorage.setItem('tabletopTunes_playlists', JSON.stringify(savedPlaylists));
        
        this.showNotification(`Playlist "${playlistName}" saved successfully!`);
        document.getElementById('playlist-name').value = '';
    }
    
    loadPlaylist() {
        const playlistName = document.getElementById('playlist-name').value.trim();
        
        if (!playlistName) {
            this.showNotification('Please enter a playlist name to load');
            return;
        }
        
        const savedPlaylists = JSON.parse(localStorage.getItem('tabletopTunes_playlists') || '{}');
        const playlist = savedPlaylists[playlistName];
        
        if (!playlist) {
            this.showNotification(`Playlist "${playlistName}" not found`);
            return;
        }
        
        // Load the playlist
        this.currentCategory = playlist.category;
        this.currentPlaylist = playlist.tracks;
        this.currentTrackIndex = 0;
        
        // Update UI
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-category="${playlist.category}"]`).classList.add('active');
        
        this.displayPlaylist();
        this.updateCurrentTrackInfo();
        
        this.showNotification(`Playlist "${playlistName}" loaded successfully!`);
        document.getElementById('playlist-name').value = '';
    }
    
    loadUserPreferences() {
        // Load volume preference
        const savedVolume = localStorage.getItem('tabletopTunes_volume') || '70';
        const volumeSlider = document.getElementById('volume-slider');
        volumeSlider.value = savedVolume;
        this.setVolume(savedVolume);
        
        // Load other preferences
        const savedShuffle = localStorage.getItem('tabletopTunes_shuffle') === 'true';
        const savedLoop = localStorage.getItem('tabletopTunes_loop') === 'true';
        
        if (savedShuffle) {
            this.toggleShuffle();
        }
        
        if (savedLoop) {
            this.toggleLoop();
        }
    }
    
    saveUserPreferences() {
        localStorage.setItem('tabletopTunes_volume', document.getElementById('volume-slider').value);
        localStorage.setItem('tabletopTunes_shuffle', this.isShuffle);
        localStorage.setItem('tabletopTunes_loop', this.isLoop);
    }
    
    updateDisplay() {
        this.updateCurrentTrackInfo();
        this.displayPlaylist();
    }
    
    showNotification(message) {
        // Create and show a simple notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
        `;
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Board Game Matching Functions
    performGameSearch() {
        const gameInput = document.getElementById('game-search').value.trim();
        if (!gameInput) {
            this.showNotification('Please enter a board game name');
            return;
        }
        
        const result = this.searchBoardGame(gameInput);
        if (!result) {
            this.showNotification(`No specific suggestions found for "${gameInput}". Try browsing categories or popular games.`);
            // Reset to category browsing
            this.matchingMode = 'category';
            this.currentBoardGame = null;
            document.querySelector('.playlist-section h2').textContent = 'Current Playlist';
        }
    }

    searchBoardGame(gameName) {
        // Load the board game database
        if (typeof BOARD_GAMES_DATABASE !== 'undefined') {
            const game = BOARD_GAMES_DATABASE[gameName];
            if (game) {
                this.currentBoardGame = gameName;
                this.matchingMode = 'boardgame';
                this.displayGameSuggestions(game);
                return game;
            }
        }
        
        // Fallback to theme-based matching if exact game not found
        return this.suggestByTheme(gameName);
    }

    suggestByTheme(input) {
        const themes = input.toLowerCase().split(' ');
        const suggestions = [];
        
        // Simple keyword matching for themes
        themes.forEach(theme => {
            if (theme.includes('fantasy') || theme.includes('magic') || theme.includes('dragon')) {
                suggestions.push({
                    category: 'fantasy',
                    reason: `Fantasy themes detected in "${input}"`,
                    tracks: this.soundtracks.fantasy
                });
            }
            if (theme.includes('horror') || theme.includes('zombie') || theme.includes('scary')) {
                suggestions.push({
                    category: 'horror',
                    reason: `Horror themes detected in "${input}"`,
                    tracks: this.soundtracks.horror
                });
            }
            if (theme.includes('space') || theme.includes('sci') || theme.includes('robot') || theme.includes('cyber')) {
                suggestions.push({
                    category: 'scifi',
                    reason: `Science fiction themes detected in "${input}"`,
                    tracks: this.soundtracks.scifi
                });
            }
            if (theme.includes('adventure') || theme.includes('explore') || theme.includes('quest')) {
                suggestions.push({
                    category: 'adventure',
                    reason: `Adventure themes detected in "${input}"`,
                    tracks: this.soundtracks.adventure
                });
            }
            if (theme.includes('peaceful') || theme.includes('calm') || theme.includes('nature')) {
                suggestions.push({
                    category: 'ambient',
                    reason: `Peaceful themes detected in "${input}"`,
                    tracks: this.soundtracks.ambient
                });
            }
        });

        return suggestions.length > 0 ? suggestions[0] : null;
    }

    displayGameSuggestions(game) {
        const trackList = document.getElementById('track-list');
        const categoryTitle = document.querySelector('.playlist-section h2');
        
        categoryTitle.textContent = `Suggestions for ${this.currentBoardGame}`;
        
        let html = `<div class="game-suggestions">`;
        
        game.suggestedSoundtracks.forEach((suggestion, index) => {
            html += `
                <div class="movie-suggestion" onclick="tabletopTunes.loadMovieSoundtrack('${suggestion.movie}', ${index})">
                    <div class="movie-header">
                        <h4><i class="fas fa-film"></i> ${suggestion.movie}</h4>
                        <p class="suggestion-reason">${suggestion.reason}</p>
                    </div>
                    <div class="suggested-tracks">
                        ${suggestion.tracks.map((track, trackIndex) => `
                            <div class="suggested-track" onclick="event.stopPropagation(); tabletopTunes.playMovieTrack('${suggestion.movie}', '${track}', ${trackIndex})">
                                <span class="track-name">${track}</span>
                                <span class="track-source">from ${suggestion.movie}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        trackList.innerHTML = html;
    }

    loadMovieSoundtrack(movieName, suggestionIndex) {
        // In a real app, this would load actual movie soundtrack files
        this.showNotification(`Loading ${movieName} soundtrack...`);
        
        // Create a playlist from the movie suggestion
        if (this.currentBoardGame && typeof BOARD_GAMES_DATABASE !== 'undefined') {
            const game = BOARD_GAMES_DATABASE[this.currentBoardGame];
            const suggestion = game.suggestedSoundtracks[suggestionIndex];
            
            // Convert movie tracks to our format
            this.currentPlaylist = suggestion.tracks.map((trackName, index) => ({
                name: trackName,
                duration: `${3 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                url: "#",
                description: `From ${movieName}`,
                movie: movieName
            }));
            
            this.currentTrackIndex = 0;
            this.currentCategory = 'movie';
            this.displayPlaylist();
            this.updateCurrentTrackInfo();
        }
    }

    playMovieTrack(movieName, trackName, trackIndex) {
        this.showNotification(`Playing "${trackName}" from ${movieName}`);
        
        // Create a single track playlist
        this.currentPlaylist = [{
            name: trackName,
            duration: `${3 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
            url: "#",
            description: `From ${movieName}`,
            movie: movieName
        }];
        
        this.currentTrackIndex = 0;
        this.currentCategory = 'movie';
        this.displayPlaylist();
        this.updateCurrentTrackInfo();
        this.play();
    }

    // Enhanced display playlist to show movie information
    displayPlaylist() {
        const trackList = document.getElementById('track-list');
        
        if (this.currentPlaylist.length === 0) {
            trackList.innerHTML = '<p class="empty-playlist">Enter a board game name above or select a soundtrack category</p>';
            return;
        }
        
        trackList.innerHTML = this.currentPlaylist.map((track, index) => `
            <div class="track-item ${index === this.currentTrackIndex ? 'playing' : ''}" 
                 onclick="tabletopTunes.selectTrack(${index})">
                <div class="track-details">
                    <span class="track-name">${track.name}</span>
                    ${track.movie ? `<span class="track-movie">from ${track.movie}</span>` : ''}
                </div>
                <span class="track-duration">${track.duration}</span>
            </div>
        `).join('');
    }
}

// Initialize the application when the page loads
let tabletopTunes;

document.addEventListener('DOMContentLoaded', () => {
    tabletopTunes = new TabletopTunes();
});

// Save preferences before page unload
window.addEventListener('beforeunload', () => {
    if (tabletopTunes) {
        tabletopTunes.saveUserPreferences();
    }
});