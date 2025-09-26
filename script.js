// TabletopTunes JavaScript - Enhanced Board Game Soundtrack Player

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
        
        // Spotify integration
        this.spotifyPlayer = null;
        this.spotifyAccessToken = null;
        this.isSpotifyConnected = false;
        
        // BoardGameGeek API integration
        this.bggService = new BGGApiService();
        
        // Movie API integration for dynamic soundtrack data
        this.movieService = new MovieApiService();
        
        // Games closet for saved games
        this.savedGames = {};
        this.gamePlaylistHistory = {};
        
        // Track current game suggestions for playlist building
        this.currentGameSuggestions = null;
        
        // Store pending game data until music is played
        this.pendingGameData = null;
        
        // Mock soundtrack data (in a real app, this would come from a server or local files)
        this.soundtracks = {
            ambient: [
                { name: "Forest Whispers", duration: "9:99", url: "#", description: "Gentle forest sounds", movie: "Studio Ghibli Collection" },
                { name: "Ocean Breeze", duration: "9:99", url: "#", description: "Calming ocean waves", movie: "Moana" },
                { name: "Mountain Wind", duration: "9:99", url: "#", description: "High altitude ambience", movie: "The Secret Garden" },
                { name: "Rain Drops", duration: "9:99", url: "#", description: "Soft rainfall sounds", movie: "Amélie" }
            ],
            fantasy: [
                { name: "Dragon's Lair", duration: "9:99", url: "#", description: "Epic fantasy adventure", movie: "Lord of the Rings" },
                { name: "Enchanted Forest", duration: "9:99", url: "#", description: "Magical woodland journey", movie: "The Chronicles of Narnia" },
                { name: "Castle Walls", duration: "9:99", url: "#", description: "Medieval fortress theme", movie: "Game of Thrones" },
                { name: "Mystic Spell", duration: "9:99", url: "#", description: "Magical incantations", movie: "Harry Potter" }
            ],
            scifi: [
                { name: "Space Station", duration: "9:99", url: "#", description: "Futuristic facility ambience", movie: "Interstellar" },
                { name: "Alien World", duration: "9:99", url: "#", description: "Extraterrestrial exploration", movie: "Star Wars" },
                { name: "Cyberpunk City", duration: "9:99", url: "#", description: "Neon-lit urban future", movie: "Blade Runner" },
                { name: "Starship Bridge", duration: "9:99", url: "#", description: "Command center atmosphere", movie: "Star Trek" }
            ],
            horror: [
                { name: "Haunted Manor", duration: "9:99", url: "#", description: "Spooky mansion ambience", movie: "The Conjuring" },
                { name: "Creeping Shadows", duration: "9:99", url: "#", description: "Suspenseful darkness", movie: "Halloween" },
                { name: "Ancient Curse", duration: "9:99", url: "#", description: "Mystical dread", movie: "The Mummy" },
                { name: "Whispers in the Dark", duration: "9:99", url: "#", description: "Eerie whispers", movie: "Sinister" }
            ],
            adventure: [
                { name: "Epic Quest", duration: "9:99", url: "#", description: "Heroic journey theme", movie: "Indiana Jones" },
                { name: "Treasure Hunt", duration: "9:99", url: "#", description: "Exciting exploration", movie: "Pirates of the Caribbean" },
                { name: "Victory March", duration: "9:99", url: "#", description: "Triumphant celebration", movie: "Gladiator" },
                { name: "Journey's End", duration: "9:99", url: "#", description: "Peaceful resolution", movie: "The Lord of the Rings" }
            ],
            tavern: [
                { name: "Merry Gathering", duration: "9:99", url: "#", description: "Festive celebration", movie: "The Princess Bride" },
                { name: "Bard's Tale", duration: "9:99", url: "#", description: "Storytelling atmosphere", movie: "Robin Hood" },
                { name: "Drinking Song", duration: "9:99", url: "#", description: "Jovial drinking melody", movie: "Pirates of the Caribbean" },
                { name: "Late Night Chat", duration: "9:99", url: "#", description: "Quiet tavern ambience", movie: "The Hobbit" }
            ]
        };
        
        this.initializeEventListeners();
        this.initializeTabSystem();
        this.initializeSpotifyIntegration();
        this.initializeVisualization();
        this.initializeDynamicVisualizations();
        this.loadUserPreferences();
        this.loadGamesCloset();
        this.updateDisplay();
        this.initializeElectronIntegration();
        this.initializeQuickActions();
        this.initializeGameSessionIndicator();
    }
    
    // Initialize game session indicator functionality
    initializeGameSessionIndicator() {
        const endSessionBtn = document.getElementById('end-game-session');
        if (endSessionBtn) {
            endSessionBtn.addEventListener('click', () => this.endGameSession());
        }
    }
    
    // Update game session indicator visibility and content
    updateGameSessionIndicator() {
        const indicator = document.getElementById('game-session-indicator');
        const gameName = document.getElementById('game-session-name');
        
        if (!indicator || !gameName) return;
        
        if (this.currentBoardGame) {
            indicator.style.display = 'block';
            gameName.textContent = this.currentBoardGame;
        } else {
            indicator.style.display = 'none';
        }
    }
    
    // End the current game session
    endGameSession() {
        if (!this.currentBoardGame) return;
        
        const gameName = this.currentBoardGame;
        this.currentBoardGame = null;
        
        // Update UI elements
        this.updateGameSessionIndicator();
        this.updateCurrentTrackInfo();
        
        // Update playlist header
        const playlistHeader = document.querySelector('.playlist-header h3');
        if (playlistHeader && playlistHeader.textContent.includes('for')) {
            playlistHeader.textContent = 'Current Playlist';
        }
        
        this.showNotification(`Ended game session for ${gameName}`, 'default');
    }
    
    // Tab System Management
    initializeTabSystem() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }
    
    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (selectedTab && selectedBtn) {
            selectedTab.classList.add('active');
            selectedBtn.classList.add('active');
            
            // Special handling for My Games tab
            if (tabName === 'games-closet') {
                this.displayGamesCloset();
                this.updateGamesClosetStats();
            }
        }
    }
    
    // Spotify Integration
    initializeSpotifyIntegration() {
        const spotifyLoginBtn = document.getElementById('spotify-login-btn');
        if (spotifyLoginBtn) {
            spotifyLoginBtn.addEventListener('click', () => this.connectSpotify());
        }
        
        const spotifySearchBtn = document.getElementById('spotify-search-btn');
        if (spotifySearchBtn) {
            spotifySearchBtn.addEventListener('click', () => this.searchSpotify());
        }
        
        // Spotify callback will be set globally after class definition
    }
    
    async connectSpotify() {
        try {
            // Enhanced Spotify OAuth2 flow simulation
            const clientId = 'your-spotify-client-id'; // This would be your actual client ID
            const redirectUri = encodeURIComponent(window.location.origin);
            const scopes = encodeURIComponent('streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state playlist-modify-public playlist-modify-private');
            
            // Show connection progress
            const statusDiv = document.getElementById('spotify-status');
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                        <p>Connecting to Spotify...</p>
                        <p style="font-size: 0.9rem; color: var(--text-muted);">Requesting permissions for streaming and playlist access</p>
                    </div>
                `;
            }
            
            // Simulate OAuth process delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // For demo, we'll simulate a successful connection
            this.simulateSpotifyConnection();
            
        } catch (error) {
            console.error('Spotify connection failed:', error);
            this.showNotification('Failed to connect to Spotify. Please try again.');
            
            // Reset UI on error
            const statusDiv = document.getElementById('spotify-status');
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <p>Connect your Spotify account to access your music library and get personalized recommendations.</p>
                    <button id="spotify-login-btn" class="spotify-btn">
                        <i class="fab fa-spotify"></i> Connect Spotify
                    </button>
                `;
                // Re-attach event listener
                document.getElementById('spotify-login-btn').addEventListener('click', () => this.connectSpotify());
            }
        }
    }
    
    simulateSpotifyConnection() {
        // Simulate successful Spotify connection for demo
        this.isSpotifyConnected = true;
        this.spotifyAccessToken = 'demo-token-' + Date.now();
        
        // Update UI
        const statusDiv = document.getElementById('spotify-status');
        const contentDiv = document.getElementById('spotify-content');
        
        if (statusDiv && contentDiv) {
            statusDiv.style.display = 'none';
            contentDiv.style.display = 'block';
            
            // Show enhanced user profile
            const profileDiv = document.getElementById('user-profile');
            if (profileDiv) {
                profileDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, var(--spotify-green), #1ed760); border-radius: var(--radius-lg); color: white;">
                        <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                            <i class="fab fa-spotify" style="color: white; font-size: 1.8rem;"></i>
                        </div>
                        <div style="flex: 1;">
                            <h4 style="color: white; margin-bottom: 0.25rem; font-size: 1.1rem;">Connected to Spotify Premium</h4>
                            <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 0.9rem;">TabletopTunes Demo User</p>
                            <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.8rem; color: rgba(255,255,255,0.8);">
                                <span><i class="fas fa-music"></i> 2,847 tracks</span>
                                <span><i class="fas fa-list"></i> 23 playlists</span>
                                <span><i class="fas fa-heart"></i> 156 liked</span>
                            </div>
                        </div>
                        <button onclick="tabletopTunes.disconnectSpotify()" style="padding: 0.5rem 1rem; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: var(--radius-md); color: white; cursor: pointer; backdrop-filter: blur(10px);">
                            <i class="fas fa-sign-out-alt"></i> Disconnect
                        </button>
                    </div>
                `;
            }
            
            // Add game-specific recommendations
            this.updateSpotifyRecommendations();
        }
        
        this.showNotification('Successfully connected to Spotify Premium!');
    }

    disconnectSpotify() {
        this.isSpotifyConnected = false;
        this.spotifyAccessToken = null;
        
        const statusDiv = document.getElementById('spotify-status');
        const contentDiv = document.getElementById('spotify-content');
        
        if (statusDiv && contentDiv) {
            statusDiv.style.display = 'block';
            contentDiv.style.display = 'none';
            
            // Reset status div content
            statusDiv.innerHTML = `
                <p>Connect your Spotify account to access your music library and get personalized recommendations.</p>
                <button id="spotify-login-btn" class="spotify-btn">
                    <i class="fab fa-spotify"></i> Connect Spotify
                </button>
            `;
            
            // Re-attach event listener
            document.getElementById('spotify-login-btn').addEventListener('click', () => this.connectSpotify());
        }
        
        this.showNotification('Disconnected from Spotify');
    }

    setupSpotifyPlayer() {
        // Initialize Spotify Web Playback SDK player
        if (window.Spotify && this.spotifyAccessToken) {
            try {
                this.spotifyPlayer = new window.Spotify.Player({
                    name: 'TabletopTunes Player',
                    getOAuthToken: cb => { cb(this.spotifyAccessToken); },
                    volume: 0.5
                });

                // Ready event
                this.spotifyPlayer.addListener('ready', ({ device_id }) => {
                    console.log('Spotify player ready with Device ID', device_id);
                    this.spotifyDeviceId = device_id;
                });

                // Not Ready event
                this.spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                    console.log('Spotify player not ready with Device ID', device_id);
                });

                // Connect to the player
                this.spotifyPlayer.connect();
            } catch (error) {
                console.warn('Failed to initialize Spotify player:', error);
                // Continue without player functionality
            }
        } else {
            console.log('Spotify SDK or access token not available for player setup');
            // This is expected when running without real Spotify authentication
        }
    }

    updateSpotifyRecommendations() {
        const recommendationsDiv = document.getElementById('game-recommendations');
        if (!recommendationsDiv) return;
        
        const currentGame = this.currentBoardGame || 'your selected board game';
        
        // Generate enhanced recommendations based on current game
        const recommendations = this.generateEnhancedSpotifyRecommendations(currentGame);
        
        recommendationsDiv.innerHTML = `
            <div class="enhanced-spotify-recommendations">
                <div class="recommendation-header">
                    <h4>
                        <i class="fas fa-brain"></i> Smart Recommendations for ${currentGame}
                    </h4>
                    <div class="recommendation-meta">
                        <span class="ai-badge">AI-Powered</span>
                        <span class="personalized-badge">Personalized</span>
                    </div>
                </div>
                
                <div class="recommendation-categories">
                    ${recommendations.map(rec => this.createRecommendationCard(rec)).join('')}
                </div>
                
                <div class="recommendation-actions">
                    <button onclick="tabletopTunes.createGamePlaylist('${currentGame}')" class="action-btn primary">
                        <i class="fas fa-list-music"></i> Create Full Playlist
                    </button>
                    <button onclick="tabletopTunes.showRecommendationDetails('${currentGame}')" class="action-btn secondary">
                        <i class="fas fa-info-circle"></i> Why These?
                    </button>
                </div>
            </div>
        `;
    }

    generateEnhancedSpotifyRecommendations(gameName) {
        // Get theme analysis for the game
        const analysis = this.suggestByTheme(gameName);
        const category = analysis.category;
        const confidence = analysis.confidence;
        
        const recommendations = [
            {
                type: 'primary',
                title: this.getCategoryDisplayName(category),
                description: `Perfect match for ${gameName}`,
                confidence: confidence,
                category: category,
                tracks: this.soundtracks[category]?.slice(0, 3) || [],
                reasoning: analysis.reason,
                icon: this.getCategoryIcon(category),
                color: this.getCategoryColor(category)
            }
        ];
        
        // Add secondary recommendations based on scoring breakdown
        if (analysis.scoringBreakdown) {
            const sortedCategories = Object.entries(analysis.scoringBreakdown)
                .filter(([cat, score]) => cat !== category && score > 20)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 2);
                
            sortedCategories.forEach(([cat, score]) => {
                recommendations.push({
                    type: 'secondary',
                    title: this.getCategoryDisplayName(cat),
                    description: `Alternative mood for ${gameName}`,
                    confidence: score,
                    category: cat,
                    tracks: this.soundtracks[cat]?.slice(0, 2) || [],
                    reasoning: `Secondary theme detected with ${score}% confidence`,
                    icon: this.getCategoryIcon(cat),
                    color: this.getCategoryColor(cat)
                });
            });
        }
        
        // Add contextual recommendations
        recommendations.push({
            type: 'contextual',
            title: 'Session Enhancer',
            description: 'Background ambience for game setup',
            confidence: 85,
            category: 'ambient',
            tracks: this.soundtracks.ambient?.slice(0, 2) || [],
            reasoning: 'Ambient music helps with game setup and breaks',
            icon: 'volume-low',
            color: 'var(--secondary-color)'
        });
        
        return recommendations;
    }

    createRecommendationCard(rec) {
        const confidenceClass = rec.confidence > 70 ? 'high-confidence' : 
                               rec.confidence > 50 ? 'medium-confidence' : 'low-confidence';
        
        return `
            <div class="recommendation-card ${rec.type} ${confidenceClass}" data-category="${rec.category}">
                <div class="card-header">
                    <div class="category-icon" style="color: ${rec.color}">
                        <i class="fas fa-${rec.icon}"></i>
                    </div>
                    <div class="card-title">
                        <h5>${rec.title}</h5>
                        <p class="card-description">${rec.description}</p>
                    </div>
                    <div class="confidence-indicator">
                        <div class="confidence-circle" style="--confidence: ${rec.confidence}%">
                            <span>${rec.confidence}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="tracks-preview">
                    ${rec.tracks.slice(0, 3).map(track => `
                        <div class="track-item">
                            <i class="fas fa-music"></i>
                            <span>${track.name || track}</span>
                            <button onclick="tabletopTunes.previewTrack('${rec.category}', '${track.name || track}')" class="preview-btn">
                                <i class="fas fa-play"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <div class="card-actions">
                    <button onclick="tabletopTunes.playRecommendationCategory('${rec.category}')" class="play-btn">
                        <i class="fas fa-play"></i> Play ${rec.title}
                    </button>
                    <button onclick="tabletopTunes.addToQueue('${rec.category}')" class="queue-btn">
                        <i class="fas fa-plus"></i> Add to Queue
                    </button>
                </div>
                
                <div class="reasoning-tooltip" title="${rec.reasoning}">
                    <i class="fas fa-info-circle"></i>
                </div>
            </div>
        `;
    }

    getCategoryDisplayName(category) {
        const displayNames = {
            fantasy: 'Epic Fantasy',
            horror: 'Dark Horror',
            scifi: 'Sci-Fi Atmosphere',
            adventure: 'Adventure Themes',
            ambient: 'Ambient Soundscapes',
            tavern: 'Tavern & Social'
        };
        return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    getCategoryColor(category) {
        const colors = {
            fantasy: '#8b5cf6',
            horror: '#ef4444', 
            scifi: '#06b6d4',
            adventure: '#f59e0b',
            ambient: '#10b981',
            tavern: '#f97316'
        };
        return colors[category] || 'var(--primary-color)';
    }

    playRecommendationCategory(category) {
        // Load and play the category
        this.loadCategory(category);
        this.showNotification(`Playing ${this.getCategoryDisplayName(category)} playlist!`);
    }

    addToQueue(category) {
        // Add category tracks to current playlist
        const tracks = this.soundtracks[category] || [];
        this.currentPlaylist.push(...tracks);
        this.displayPlaylist();
        this.showNotification(`Added ${tracks.length} tracks from ${this.getCategoryDisplayName(category)} to queue`);
    }

    previewTrack(category, trackName) {
        this.showNotification(`Previewing: ${trackName} from ${this.getCategoryDisplayName(category)}`);
    }

    createGamePlaylist(gameName) {
        const analysis = this.suggestByTheme(gameName);
        const playlistName = `${gameName} Soundtrack Collection`;
        
        // Create comprehensive playlist with primary + secondary recommendations
        let playlistTracks = [];
        
        // Add primary category tracks
        if (this.soundtracks[analysis.category]) {
            playlistTracks.push(...this.soundtracks[analysis.category]);
        }
        
        // Add secondary category tracks if scoring breakdown exists
        if (analysis.scoringBreakdown) {
            Object.entries(analysis.scoringBreakdown)
                .filter(([cat, score]) => cat !== analysis.category && score > 30)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 2)
                .forEach(([cat]) => {
                    if (this.soundtracks[cat]) {
                        playlistTracks.push(...this.soundtracks[cat].slice(0, 2));
                    }
                });
        }
        
        this.currentPlaylist = playlistTracks;
        this.displayPlaylist();
        this.showNotification(`Created "${playlistName}" with ${playlistTracks.length} tracks`);
    }

    showRecommendationDetails(gameName) {
        const analysis = this.suggestByTheme(gameName);
        
        const modalHTML = `
            <div class="recommendation-details-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-brain"></i> Why These Recommendations?</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="analysis-section">
                        <h4>Game Analysis for "${gameName}"</h4>
                        <p><strong>Primary Category:</strong> ${this.getCategoryDisplayName(analysis.category)}</p>
                        <p><strong>Confidence Level:</strong> ${analysis.confidence}%</p>
                        <p><strong>Detected Keywords:</strong> ${analysis.detectedKeywords?.join(', ') || 'N/A'}</p>
                        <p><strong>Reasoning:</strong> ${analysis.reason}</p>
                    </div>
                    
                    ${analysis.scoringBreakdown ? `
                        <div class="scoring-breakdown">
                            <h4>Category Scoring Breakdown</h4>
                            ${Object.entries(analysis.scoringBreakdown)
                                .sort(([,a], [,b]) => b - a)
                                .map(([cat, score]) => `
                                    <div class="score-item">
                                        <span class="category-name">${this.getCategoryDisplayName(cat)}</span>
                                        <div class="score-bar">
                                            <div class="score-fill" style="width: ${score}%; background: ${this.getCategoryColor(cat)}"></div>
                                        </div>
                                        <span class="score-value">${score}%</span>
                                    </div>
                                `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Create and show modal
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = modalHTML;
        document.body.appendChild(modalOverlay);
    }

    playRecommendation(type) {
        this.showNotification(`Playing ${type} recommendation from Spotify!`);
    }

    showPopularGames() {
        // Navigate to main tab and show popular games
        this.showTab('main');
        const popularGames = document.querySelector('.popular-games-compact');
        if (popularGames) {
            popularGames.scrollIntoView({ behavior: 'smooth' });
        }
        this.showNotification('Showing popular games selection');
    }
    
    async searchSpotify() {
        const searchInput = document.getElementById('spotify-search');
        const query = searchInput?.value.trim();
        
        if (!query) {
            this.showNotification('Please enter a search term');
            return;
        }
        
        if (!this.isSpotifyConnected) {
            this.showNotification('Please connect to Spotify first');
            return;
        }
        
        // Show loading state
        const resultsDiv = document.getElementById('spotify-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                    <p>Searching Spotify for "${query}"...</p>
                </div>
            `;
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Enhanced mock results based on search query
        const mockResults = this.generateSmartSearchResults(query);
        
        this.displaySpotifyResults(mockResults);
    }

    generateSmartSearchResults(query) {
        const lowerQuery = query.toLowerCase();
        let results = [];
        
        // Generate contextual results based on search terms
        if (lowerQuery.includes('fantasy') || lowerQuery.includes('epic') || lowerQuery.includes('orchestral')) {
            results = [
                { name: 'The Bridge of Khazad Dum', artist: 'Howard Shore', album: 'Lord of the Rings: Fellowship', id: 'fantasy1', duration: '5:57', popularity: 95 },
                { name: 'Duel of the Fates', artist: 'John Williams', album: 'Star Wars: Phantom Menace', id: 'fantasy2', duration: '4:14', popularity: 92 },
                { name: 'Now We Are Free', artist: 'Hans Zimmer', album: 'Gladiator Soundtrack', id: 'fantasy3', duration: '4:18', popularity: 89 },
                { name: 'Heart of Courage', artist: 'Two Steps From Hell', album: 'Invincible', id: 'fantasy4', duration: '2:51', popularity: 87 }
            ];
        } else if (lowerQuery.includes('horror') || lowerQuery.includes('scary') || lowerQuery.includes('dark')) {
            results = [
                { name: 'Halloween Theme', artist: 'John Carpenter', album: 'Halloween Soundtrack', id: 'horror1', duration: '2:36', popularity: 94 },
                { name: 'The Exorcist Theme', artist: 'Mike Oldfield', album: 'Tubular Bells', id: 'horror2', duration: '4:21', popularity: 91 },
                { name: 'Psycho Strings', artist: 'Bernard Herrmann', album: 'Psycho Soundtrack', id: 'horror3', duration: '2:44', popularity: 88 },
                { name: 'The Shining Main Title', artist: 'Wendy Carlos', album: 'The Shining Soundtrack', id: 'horror4', duration: '3:08', popularity: 86 }
            ];
        } else if (lowerQuery.includes('ambient') || lowerQuery.includes('peaceful') || lowerQuery.includes('calm')) {
            results = [
                { name: 'Samsara', artist: 'Audiomachine', album: 'Chronicles', id: 'ambient1', duration: '3:45', popularity: 85 },
                { name: 'Weightless', artist: 'Marconi Union', album: 'Distance', id: 'ambient2', duration: '8:10', popularity: 82 },
                { name: 'The Path of the Wind', artist: 'Joe Hisaishi', album: 'My Neighbor Totoro', id: 'ambient3', duration: '5:23', popularity: 90 },
                { name: 'River Flows in You', artist: 'Yiruma', album: 'First Love', id: 'ambient4', duration: '3:20', popularity: 87 }
            ];
        } else {
            // Default results for any other query
            results = [
                { name: `${query} Epic Version`, artist: 'Movie Soundtracks', album: 'Cinematic Collection', id: `search1_${Date.now()}`, duration: '4:23', popularity: 88 },
                { name: `${query} Orchestral Mix`, artist: 'Epic Music World', album: 'Heroic Tales', id: `search2_${Date.now()}`, duration: '3:45', popularity: 85 },
                { name: `${query} Theme`, artist: 'Soundtrack Artists', album: 'Game Music Collection', id: `search3_${Date.now()}`, duration: '2:56', popularity: 82 },
                { name: `${query} Instrumental`, artist: 'Cinematic Music', album: 'Background Scores', id: `search4_${Date.now()}`, duration: '5:12', popularity: 79 }
            ];
        }
        
        return results;
    }
    
    displaySpotifyResults(results) {
        const resultsDiv = document.getElementById('spotify-results');
        if (!resultsDiv) return;
        
        resultsDiv.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">
                    <i class="fab fa-spotify" style="color: var(--spotify-green);"></i> Search Results
                </h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Found ${results.length} tracks matching your search</p>
            </div>
            <div class="spotify-tracks" style="max-height: 400px; overflow-y: auto;">
                ${results.map((track, index) => `
                    <div class="spotify-track" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-md); margin-bottom: 0.75rem; border: 1px solid var(--gray-700); transition: all 0.2s ease; cursor: pointer;" 
                         onmouseover="this.style.background='var(--bg-card)'; this.style.borderColor='var(--spotify-green)'"
                         onmouseout="this.style.background='var(--bg-secondary)'; this.style.borderColor='var(--gray-700)'">
                        
                        <!-- Album Art Placeholder -->
                        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.8rem;">
                            ${track.name.substring(0, 2).toUpperCase()}
                        </div>
                        
                        <!-- Track Info -->
                        <div style="flex: 1; min-width: 0;">
                            <div style="color: var(--text-primary); font-weight: 500; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${track.name}
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.25rem;">
                                ${track.artist} • ${track.album}
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.8rem; color: var(--text-muted);">
                                <span><i class="fas fa-clock"></i> ${track.duration}</span>
                                ${track.popularity ? `<span><i class="fas fa-chart-line"></i> ${track.popularity}% popular</span>` : ''}
                                <span style="background: var(--spotify-green); color: white; padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.7rem;">
                                    <i class="fab fa-spotify"></i> SPOTIFY
                                </span>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                            <button onclick="event.stopPropagation(); tabletopTunes.previewSpotifyTrack('${track.id}')" 
                                    style="padding: 0.5rem; background: var(--bg-card); border: 1px solid var(--gray-600); border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; transition: all 0.2s ease;"
                                    onmouseover="this.style.background='var(--primary-color)'; this.style.color='white'; this.style.borderColor='var(--primary-color)'"
                                    onmouseout="this.style.background='var(--bg-card)'; this.style.color='var(--text-secondary)'; this.style.borderColor='var(--gray-600)'">
                                <i class="fas fa-play"></i>
                            </button>
                            <button onclick="event.stopPropagation(); tabletopTunes.addSpotifyTrack('${track.id}', '${track.name.replace(/'/g, "\\'")}', '${track.artist.replace(/'/g, "\\'")}')" 
                                    style="padding: 0.5rem 1rem; background: var(--spotify-green); border: none; border-radius: var(--radius-sm); color: white; cursor: pointer; font-weight: 500; transition: all 0.2s ease;"
                                    onmouseover="this.style.background='#1db954'; this.style.transform='translateY(-1px)'"
                                    onmouseout="this.style.background='var(--spotify-green)'; this.style.transform='translateY(0)'">
                                <i class="fas fa-plus"></i> Add
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    previewSpotifyTrack(trackId) {
        this.showNotification('🎵 Playing 30-second preview...');
        // In a real implementation, this would play a preview using Spotify's Web Playback SDK
    }

    addSpotifyTrack(trackId, trackName, artist) {
        // Add track to current playlist
        const newTrack = {
            name: trackName || 'Unknown Track',
            artist: artist || 'Unknown Artist',
            duration: '3:45', // Would get real duration from Spotify API
            url: '#',
            source: 'spotify',
            spotifyId: trackId
        };
        
        this.currentPlaylist.push(newTrack);
        this.displayPlaylist();
        this.showNotification(`✅ "${trackName}" added to your playlist!`);
    }
    
    // Visualization System
    initializeVisualization() {
        const vizAnalyzeBtn = document.getElementById('viz-analyze-btn');
        if (vizAnalyzeBtn) {
            vizAnalyzeBtn.addEventListener('click', () => this.analyzeGameVisualization());
        }
    }
    
    async analyzeGameVisualization() {
        const gameInput = document.getElementById('viz-game-input');
        const gameName = gameInput?.value.trim();
        
        if (!gameName) {
            this.showNotification('Please enter a game name to analyze');
            return;
        }
        
        // Clear previous results
        this.clearVisualizationPanels();
        
        // Start the visualization process
        await this.runVisualizationSteps(gameName);
    }
    
    clearVisualizationPanels() {
        const panels = ['step-list', 'keyword-cloud', 'score-bars', 'result-display'];
        panels.forEach(panelId => {
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.innerHTML = '<p class="placeholder">Analysis in progress...</p>';
            }
        });
    }
    
    async runVisualizationSteps(gameName) {
        // Step 1: Show analysis steps
        await this.showAnalysisSteps(gameName);
        
        // Step 2: Extract and show keywords
        await this.showKeywordAnalysis(gameName);
        
        // Step 3: Show category scoring
        await this.showCategoryScoring(gameName);
        
        // Step 4: Show final recommendation
        await this.showFinalRecommendation(gameName);
    }
    
    async showAnalysisSteps(gameName) {
        const stepList = document.getElementById('step-list');
        if (!stepList) return;
        
        const steps = [
            'Parsing game name input...',
            'Normalizing text and extracting keywords...',
            'Analyzing theme patterns...',
            'Calculating category scores...',
            'Selecting best match...'
        ];
        
        stepList.innerHTML = '';
        
        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const stepDiv = document.createElement('div');
            stepDiv.className = 'analysis-step';
            stepDiv.style.animationDelay = `${i * 0.1}s`;
            stepDiv.textContent = `${i + 1}. ${steps[i]}`;
            stepList.appendChild(stepDiv);
        }
    }
    
    async showKeywordAnalysis(gameName) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const keywordCloud = document.getElementById('keyword-cloud');
        if (!keywordCloud) return;
        
        // Extract keywords from game name (simplified)
        const keywords = this.extractKeywords(gameName);
        
        keywordCloud.innerHTML = '';
        keywords.forEach((keyword, index) => {
            setTimeout(() => {
                const keywordTag = document.createElement('span');
                keywordTag.className = 'keyword-tag';
                keywordTag.textContent = keyword;
                keywordCloud.appendChild(keywordTag);
            }, index * 200);
        });
    }
    
    extractKeywords(gameName) {
        const name = gameName.toLowerCase();
        const keywords = [];
        
        // Simple keyword extraction based on game name
        if (name.includes('dragon') || name.includes('magic') || name.includes('fantasy')) {
            keywords.push('fantasy', 'magic', 'medieval');
        }
        if (name.includes('space') || name.includes('star') || name.includes('cyber')) {
            keywords.push('sci-fi', 'futuristic', 'technology');
        }
        if (name.includes('horror') || name.includes('zombie') || name.includes('haunted')) {
            keywords.push('horror', 'suspense', 'dark');
        }
        if (name.includes('adventure') || name.includes('quest') || name.includes('journey')) {
            keywords.push('adventure', 'exploration', 'heroic');
        }
        
        // Add generic keywords
        const words = name.split(' ');
        keywords.push(...words.filter(word => word.length > 3));
        
        return [...new Set(keywords)].slice(0, 8); // Remove duplicates, limit to 8
    }
    
    async showCategoryScoring(gameName) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const scoreBars = document.getElementById('score-bars');
        if (!scoreBars) return;
        
        // Use the enhanced recommendation system
        const recommendation = this.suggestByTheme(gameName);
        const scores = recommendation ? recommendation.scoringBreakdown : this.calculateAllCategoryScores(gameName);
        
        scoreBars.innerHTML = '';
        
        // Sort scores by value for better visualization
        const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);
        
        sortedScores.forEach(([category, score], index) => {
            setTimeout(() => {
                const barDiv = document.createElement('div');
                barDiv.className = `score-bar ${recommendation && category === recommendation.category ? 'winner' : ''}`;
                barDiv.innerHTML = `
                    <div class="bar-label">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                    <div class="bar-fill">
                        <div class="bar-progress" style="width: ${score}%; background: ${this.getCategoryColor(category)}"></div>
                    </div>
                    <div class="bar-score">${score}%</div>
                `;
                scoreBars.appendChild(barDiv);
            }, index * 300);
        });
    }

    getCategoryColor(category) {
        const colors = {
            fantasy: 'linear-gradient(90deg, #8b5cf6, #a855f7)',
            horror: 'linear-gradient(90deg, #ef4444, #dc2626)', 
            scifi: 'linear-gradient(90deg, #06b6d4, #0891b2)',
            adventure: 'linear-gradient(90deg, #f59e0b, #d97706)',
            ambient: 'linear-gradient(90deg, #10b981, #059669)',
            tavern: 'linear-gradient(90deg, #f97316, #ea580c)'
        };
        return colors[category] || 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))';
    }

    async showFinalRecommendation(gameName) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const resultDisplay = document.getElementById('result-display');
        if (!resultDisplay) return;
        
        const result = this.suggestByTheme(gameName);
        
        if (result) {
            resultDisplay.innerHTML = `
                <div class="recommendation-card enhanced-viz-card">
                    <div class="recommendation-header">
                        <div class="category-badge ${result.category}">
                            <i class="fas fa-${this.getCategoryIcon(result.category)}"></i>
                            ${result.category.charAt(0).toUpperCase() + result.category.slice(1)} Category Selected
                        </div>
                        <div class="confidence-score">
                            <span class="confidence-value">${result.confidence || 'N/A'}% Match</span>
                        </div>
                    </div>
                    <p class="recommendation-reason">${result.reason}</p>
                    <div class="recommendation-details">
                        ${result.detectedKeywords && result.detectedKeywords.length > 0 ? `
                            <div class="detected-elements">
                                <strong>Key Elements:</strong> 
                                ${result.detectedKeywords.slice(0, 4).map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                            </div>
                        ` : ''}
                        <div class="tracks-available">
                            <i class="fas fa-music"></i> ${result.tracks.length} tracks available in this category
                        </div>
                    </div>
                </div>
            `;
        } else {
            resultDisplay.innerHTML = `
                <div class="recommendation-card">
                    <h4>Analysis Complete</h4>
                    <p>Unable to find a specific match. Try browsing categories or popular games for suggestions.</p>
                </div>
            `;
        }
    }

    async showKeywordAnalysis(gameName) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const keywordCloud = document.getElementById('keyword-cloud');
        if (!keywordCloud) return;
        
        // Use enhanced keyword extraction
        const recommendation = this.suggestByTheme(gameName);
        const keywords = recommendation ? 
            (recommendation.detectedKeywords || recommendation.detectedThemes || this.extractAdvancedKeywords(gameName.toLowerCase())) :
            this.extractKeywords(gameName);
        
        keywordCloud.innerHTML = '';
        
        keywords.slice(0, 8).forEach((keyword, index) => {
            setTimeout(() => {
                const keywordTag = document.createElement('div');
                keywordTag.className = 'keyword-tag enhanced-keyword';
                keywordTag.textContent = keyword;
                keywordTag.style.animationDelay = `${index * 0.1}s`;
                keywordCloud.appendChild(keywordTag);
            }, index * 200);
        });
    }
    
    calculateAllCategoryScores(gameName) {
        const name = gameName.toLowerCase();
        const scores = {
            fantasy: 0,
            horror: 0,
            scifi: 0,
            adventure: 0,
            ambient: 0,
            tavern: 0
        };
        
        // Fantasy keywords
        if (name.includes('fantasy') || name.includes('magic') || name.includes('dragon')) scores.fantasy += 80;
        if (name.includes('medieval') || name.includes('castle') || name.includes('knight')) scores.fantasy += 60;
        
        // Horror keywords
        if (name.includes('horror') || name.includes('zombie') || name.includes('scary')) scores.horror += 90;
        if (name.includes('haunted') || name.includes('ghost') || name.includes('dark')) scores.horror += 70;
        
        // Sci-fi keywords
        if (name.includes('space') || name.includes('sci') || name.includes('robot')) scores.scifi += 85;
        if (name.includes('cyber') || name.includes('future') || name.includes('alien')) scores.scifi += 75;
        
        // Adventure keywords
        if (name.includes('adventure') || name.includes('explore') || name.includes('quest')) scores.adventure += 75;
        if (name.includes('journey') || name.includes('expedition') || name.includes('discovery')) scores.adventure += 60;
        
        // Ambient keywords
        if (name.includes('peaceful') || name.includes('calm') || name.includes('nature')) scores.ambient += 70;
        if (name.includes('zen') || name.includes('meditation') || name.includes('serene')) scores.ambient += 80;
        
        // Tavern keywords
        if (name.includes('tavern') || name.includes('inn') || name.includes('social')) scores.tavern += 85;
        if (name.includes('party') || name.includes('gathering') || name.includes('feast')) scores.tavern += 65;
        
        // Add small baseline scores to prevent all zeros, using category-specific defaults
        const baselineScores = {
            ambient: 8,    // Usually a safe fallback for most games
            fantasy: 12,   // Popular category, gets slightly higher baseline
            adventure: 10, // Common theme, moderate baseline
            scifi: 6,      // More specific, lower baseline
            horror: 5,     // Very specific, lowest baseline
            tavern: 7      // Social games, moderate baseline
        };
        
        Object.keys(scores).forEach(key => {
            if (scores[key] === 0) {
                scores[key] = baselineScores[key] || 8; // Default to 8 if category not found
            }
        });
        
        return scores;
    }
    
    async showFinalRecommendation(gameName) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const resultDisplay = document.getElementById('result-display');
        if (!resultDisplay) return;
        
        const result = this.suggestByTheme(gameName);
        
        if (result) {
            resultDisplay.innerHTML = `
                <div class="professional-recommendation-card">
                    <div class="recommendation-header">
                        <div class="primary-recommendation">
                            <div class="category-badge ${result.category}" style="background: ${this.getCategoryColor(result.category)}">
                                <i class="fas fa-${this.getCategoryIcon(result.category)}"></i>
                                <span>${this.getCategoryDisplayName(result.category)}</span>
                            </div>
                            <div class="confidence-display">
                                <div class="confidence-circle" style="--confidence: ${result.confidence}%">
                                    <span class="confidence-percentage">${result.confidence}%</span>
                                    <span class="confidence-label">Match</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="recommendation-meta">
                            <div class="analysis-quality">
                                <i class="fas fa-${result.confidence >= 70 ? 'star' : result.confidence >= 50 ? 'star-half-alt' : 'star'}"></i>
                                <span>${result.confidence >= 70 ? 'Excellent' : result.confidence >= 50 ? 'Good' : 'Basic'} Match</span>
                            </div>
                            <div class="processing-time">
                                <i class="fas fa-clock"></i>
                                <span>Analyzed in 2.3s</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="recommendation-content">
                        <div class="analysis-explanation">
                            <h5><i class="fas fa-brain"></i> Analysis Summary</h5>
                            <p class="recommendation-reason">${result.reason}</p>
                            
                            ${result.detectedKeywords && result.detectedKeywords.length > 0 ? `
                                <div class="detected-themes">
                                    <strong>Key Themes Identified:</strong>
                                    <div class="theme-tags">
                                        ${result.detectedKeywords.slice(0, 6).map(keyword => 
                                            `<span class="theme-tag" style="background: ${this.getCategoryColor(result.category)}20; color: ${this.getCategoryColor(result.category)}">${keyword}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${result.scoringBreakdown ? `
                            <div class="scoring-preview">
                                <h5><i class="fas fa-chart-bar"></i> Category Analysis</h5>
                                <div class="top-categories">
                                    ${Object.entries(result.scoringBreakdown)
                                        .sort(([,a], [,b]) => b - a)
                                        .slice(0, 3)
                                        .map(([category, score]) => `
                                            <div class="category-score">
                                                <div class="category-info">
                                                    <i class="fas fa-${this.getCategoryIcon(category)}"></i>
                                                    <span>${this.getCategoryDisplayName(category)}</span>
                                                </div>
                                                <div class="score-bar">
                                                    <div class="score-fill" style="width: ${score}%; background: ${this.getCategoryColor(category)}"></div>
                                                    <span class="score-text">${score}%</span>
                                                </div>
                                            </div>
                                        `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="playlist-preview">
                            <h5><i class="fas fa-list-music"></i> Recommended Playlist</h5>
                            <div class="tracks-summary">
                                <div class="track-count">
                                    <i class="fas fa-music"></i>
                                    <strong>${result.tracks.length}</strong> curated tracks
                                </div>
                                <div class="estimated-time">
                                    <i class="fas fa-clock"></i>
                                    <strong>~${Math.round(result.tracks.length * 3.5)}</strong> minutes
                                </div>
                                <div class="variety-score">
                                    <i class="fas fa-palette"></i>
                                    <strong>High</strong> variety
                                </div>
                            </div>
                            
                            <div class="sample-tracks">
                                ${result.tracks.slice(0, 3).map(track => `
                                    <div class="sample-track">
                                        <i class="fas fa-play-circle"></i>
                                        <span>${track.name || track}</span>
                                        <span class="track-source">${track.movie || 'Curated'}</span>
                                    </div>
                                `).join('')}
                                ${result.tracks.length > 3 ? `<div class="more-tracks">...and ${result.tracks.length - 3} more tracks</div>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="recommendation-actions">
                        <button onclick="tabletopTunes.loadCategory('${result.category}')" class="primary-action">
                            <i class="fas fa-play"></i> Start Playing Now
                        </button>
                        <button onclick="tabletopTunes.createGamePlaylist('${gameName}')" class="secondary-action">
                            <i class="fas fa-list-plus"></i> Create Full Playlist
                        </button>
                        <button onclick="tabletopTunes.showRecommendationDetails('${gameName}')" class="tertiary-action">
                            <i class="fas fa-info-circle"></i> View Analysis Details
                        </button>
                    </div>
                    
                    <div class="recommendation-footer">
                        <div class="powered-by">
                            <i class="fas fa-magic"></i>
                            <span>Powered by TabletopTunes AI • Enhanced Theme Analysis</span>
                        </div>
                        <div class="recommendation-quality">
                            ${result.confidence >= 80 ? '🎯 Perfect Match' : 
                              result.confidence >= 60 ? '✨ Great Choice' : 
                              result.confidence >= 40 ? '👍 Good Option' : 
                              '💡 Creative Suggestion'}
                        </div>
                    </div>
                </div>
            `;
        } else {
            resultDisplay.innerHTML = `
                <div class="professional-recommendation-card no-match">
                    <div class="no-match-content">
                        <div class="no-match-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h4>No Specific Match Found</h4>
                        <p>We couldn't find a strong thematic match for this game, but don't worry!</p>
                        
                        <div class="fallback-suggestions">
                            <h5>Try These Instead:</h5>
                            <div class="fallback-options">
                                <button onclick="tabletopTunes.loadCategory('ambient')" class="fallback-btn">
                                    <i class="fas fa-volume-low"></i> Ambient Soundscapes
                                </button>
                                <button onclick="tabletopTunes.loadCategory('fantasy')" class="fallback-btn">
                                    <i class="fas fa-dragon"></i> Fantasy Classics
                                </button>
                                <button onclick="tabletopTunes.showPopularGames()" class="fallback-btn">
                                    <i class="fas fa-star"></i> Browse Popular Games
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
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
        
        // Hide player section when playlist is cleared
        this.hidePlayerSection();
        
        const playlistTitle = document.querySelector('.playlist-section h3');
        if (playlistTitle) playlistTitle.textContent = 'Current Playlist';
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
        
        // Live search functionality with debouncing
        document.getElementById('game-search').addEventListener('input', (e) => {
            this.handleLiveSearch(e.target.value);
        });
        
        // Hide live search results when clicking outside
        document.addEventListener('click', (e) => {
            const searchContainer = document.querySelector('.search-container');
            if (!searchContainer.contains(e.target)) {
                this.hideLiveSearchResults();
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
        
        // Update playlist header based on context
        const playlistHeader = document.querySelector('.playlist-header h3');
        if (playlistHeader) {
            if (this.currentBoardGame) {
                playlistHeader.textContent = `Playing for ${this.currentBoardGame}`;
            } else {
                playlistHeader.textContent = 'Current Playlist';
            }
        }
        
        this.displayPlaylist();
        this.updateCurrentTrackInfo();
        
        // Show player section when music is selected
        this.showPlayerSection();
        
        // Show appropriate notification based on context
        const categoryName = this.getCurrentCategoryName();
        if (this.currentBoardGame) {
            this.showNotification(`Selected ${categoryName} soundtrack for ${this.currentBoardGame}`, 'success');
        } else {
            this.showNotification(`${categoryName} soundtrack loaded`);
        }
    }
    
    // Load category method for quick actions
    loadCategory(category) {
        this.selectCategory(category);
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
            
            // Show game context when playing for a specific game
            if (this.currentBoardGame) {
                trackCategory.textContent = `Playing for ${this.currentBoardGame} • ${this.getCurrentCategoryName()} - ${currentTrack.description}`;
            } else {
                trackCategory.textContent = `${this.getCurrentCategoryName()} - ${currentTrack.description}`;
            }
        } else {
            trackTitle.textContent = 'No track selected';
            trackCategory.textContent = this.currentBoardGame ? 
                `Ready to play for ${this.currentBoardGame} - Select a soundtrack category` : 
                'Select a soundtrack category';
        }
        
        // Update game session indicator
        this.updateGameSessionIndicator();
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
        
        // Save pending game data when music is actually played
        this.savePendingGameToCloset();
        
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
            created: new Date().toISOString(),
            boardGame: this.currentBoardGame
        };
        
        // Save to localStorage
        const savedPlaylists = JSON.parse(localStorage.getItem('tabletopTunes_playlists') || '{}');
        savedPlaylists[playlistName] = playlist;
        localStorage.setItem('tabletopTunes_playlists', JSON.stringify(savedPlaylists));
        
        // If we have a current board game, track this playlist usage and save game to closet
        if (this.currentBoardGame) {
            this.trackGamePlaylist(this.currentBoardGame, playlistName, playlist);
            this.saveToGamesCloset(this.currentBoardGame);
        }
        
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
    
    // My Games functionality
    loadGamesCloset() {
        // Load saved games
        const savedGamesData = localStorage.getItem('tabletopTunes_savedGames');
        this.savedGames = savedGamesData ? JSON.parse(savedGamesData) : {};
        
        // Load game playlist history
        const historyData = localStorage.getItem('tabletopTunes_gameHistory');
        this.gamePlaylistHistory = historyData ? JSON.parse(historyData) : {};
    }
    
    saveToGamesCloset(gameName, gameData = {}) {
        if (!gameName) return;
        
        // Create game entry if it doesn't exist
        if (!this.savedGames[gameName]) {
            this.savedGames[gameName] = {
                name: gameName,
                dateAdded: new Date().toISOString(),
                lastPlayed: null,
                playCount: 0,
                ...gameData
            };
        }
        
        // Update last played and play count
        this.savedGames[gameName].lastPlayed = new Date().toISOString();
        this.savedGames[gameName].playCount = (this.savedGames[gameName].playCount || 0) + 1;
        
        // Save to localStorage
        localStorage.setItem('tabletopTunes_savedGames', JSON.stringify(this.savedGames));
        
        this.showNotification(`"${gameName}" added to My Games!`);
    }

    /**
     * Add game to My Games without requiring music to be played
     * This is the new functionality requested in the issue
     */
    addGameToMyGames(gameName, gameData = {}) {
        if (!gameName) return;
        
        // Check if game is already in My Games
        if (this.savedGames[gameName]) {
            this.showNotification(`"${gameName}" is already in your My Games collection!`, 'info');
            return;
        }
        
        // Create game entry without updating play statistics
        this.savedGames[gameName] = {
            name: gameName,
            dateAdded: new Date().toISOString(),
            lastPlayed: null,
            playCount: 0,
            ...gameData
        };
        
        // Save to localStorage
        localStorage.setItem('tabletopTunes_savedGames', JSON.stringify(this.savedGames));
        
        this.showNotification(`"${gameName}" added to My Games!`, 'success');
        
        // If we're currently on the games closet tab, refresh it
        const gamesClosetTab = document.getElementById('games-closet-tab');
        if (gamesClosetTab && gamesClosetTab.classList.contains('active')) {
            this.displayGamesCloset();
        }
        
        // If we're switching away from My Games tab after adding, ensure refresh happens when we return
        this.gamesClosetNeedsRefresh = true;
    }

    /**
     * Add game from theme analysis to My Games 
     */
    addGameFromThemeAnalysis(gameName, detectedCategory) {
        const gameData = {
            source: 'theme_analysis',
            detectedCategory: detectedCategory
        };
        
        this.addGameToMyGames(gameName, gameData);
        
        // Refresh the current display to show "Already in My Games" 
        if (this.currentBoardGame === gameName) {
            const result = this.suggestByTheme(gameName);
            if (result) {
                this.displayThemeBasedSuggestions(result, gameName);
            }
        }
    }

    /**
     * Add game from BGG data to My Games
     */  
    addGameFromBGG(gameName) {
        // Use pendingGameData if available, otherwise create basic BGG game data
        let gameData = { source: 'boardgamegeek' };
        
        if (this.pendingGameData && this.pendingGameData.name === gameName) {
            gameData = {
                source: this.pendingGameData.source,
                bggData: this.pendingGameData.bggData,
                detectedCategory: this.pendingGameData.detectedCategory
            };
        }
        
        this.addGameToMyGames(gameName, gameData);
        
        // Clear pending data since we've now saved the game
        if (this.pendingGameData && this.pendingGameData.name === gameName) {
            this.pendingGameData = null;
        }
        
        // Refresh the current display to show "Already in My Games"
        if (this.currentBoardGame === gameName) {
            // Re-trigger the BGG search to refresh the display
            this.searchBoardGame(gameName);
        }
    }
    
    /**
     * Save the currently pending game data when music is played for the first time
     */
    savePendingGameToCloset() {
        if (this.pendingGameData && this.currentBoardGame) {
            // Check if this game is already saved (to avoid duplicate saves)
            if (!this.savedGames[this.pendingGameData.name]) {
                // Save the pending game data
                this.saveToGamesCloset(this.pendingGameData.name, {
                    source: this.pendingGameData.source,
                    bggData: this.pendingGameData.bggData,
                    detectedCategory: this.pendingGameData.detectedCategory
                });
                
                // Clear pending data
                this.pendingGameData = null;
                
                // Show success message
                this.showNotification(`Added "${this.currentBoardGame}" to My Games after playing music!`, 'success');
            } else {
                // Game already exists, just update play count
                this.savedGames[this.pendingGameData.name].lastPlayed = new Date().toISOString();
                this.savedGames[this.pendingGameData.name].playCount = (this.savedGames[this.pendingGameData.name].playCount || 0) + 1;
                localStorage.setItem('tabletopTunes_savedGames', JSON.stringify(this.savedGames));
                this.pendingGameData = null;
            }
        }
    }
    
    trackGamePlaylist(gameName, playlistName, playlistData) {
        if (!gameName || !playlistName) return;
        
        // Initialize game history if it doesn't exist
        if (!this.gamePlaylistHistory[gameName]) {
            this.gamePlaylistHistory[gameName] = {
                playlists: {},
                popularPlaylists: []
            };
        }
        
        // Track this playlist usage
        const gameHistory = this.gamePlaylistHistory[gameName];
        if (!gameHistory.playlists[playlistName]) {
            gameHistory.playlists[playlistName] = {
                name: playlistName,
                timesUsed: 0,
                lastUsed: null,
                data: playlistData
            };
        }
        
        gameHistory.playlists[playlistName].timesUsed++;
        gameHistory.playlists[playlistName].lastUsed = new Date().toISOString();
        
        // Update popular playlists (simple ranking by usage)
        gameHistory.popularPlaylists = Object.values(gameHistory.playlists)
            .sort((a, b) => b.timesUsed - a.timesUsed)
            .slice(0, 5)
            .map(p => p.name);
        
        // Save to localStorage
        localStorage.setItem('tabletopTunes_gameHistory', JSON.stringify(this.gamePlaylistHistory));
    }
    
    removeFromGamesCloset(gameName) {
        if (this.savedGames[gameName]) {
            delete this.savedGames[gameName];
            localStorage.setItem('tabletopTunes_savedGames', JSON.stringify(this.savedGames));
            
            // Also remove from history
            if (this.gamePlaylistHistory[gameName]) {
                delete this.gamePlaylistHistory[gameName];
                localStorage.setItem('tabletopTunes_gameHistory', JSON.stringify(this.gamePlaylistHistory));
            }
            
            this.showNotification(`"${gameName}" removed from My Games`);
            this.displayGamesCloset(); // Refresh display
        }
    }
    
    displayGamesCloset() {
        const gamesClosetContent = document.getElementById('games-closet-content');
        if (!gamesClosetContent) return;
        
        // Update dashboard stats first
        this.updateClosetDashboard();
        
        const savedGamesList = Object.values(this.savedGames)
            .sort((a, b) => new Date(b.lastPlayed || b.dateAdded) - new Date(a.lastPlayed || a.dateAdded));
        
        if (savedGamesList.length === 0) {
            gamesClosetContent.innerHTML = `
                <div class="empty-games-closet">
                    <div class="empty-state-icon">
                        <i class="fas fa-dice-d20"></i>
                    </div>
                    <h3>Start Your Gaming Journey</h3>
                    <p>Your game collection is waiting for its first adventure! When you search for board games and find soundtracks, they'll automatically be saved here.</p>
                    <div class="empty-state-actions">
                        <button class="action-btn primary large" onclick="tabletopTunes.switchTab('main')">
                            <i class="fas fa-search"></i> Find Your First Game
                        </button>
                        <button class="action-btn secondary" onclick="tabletopTunes.showSampleGames()">
                            <i class="fas fa-lightbulb"></i> Try Sample Games
                        </button>
                    </div>
                    <div class="sample-games-preview">
                        <p>Popular games to get started:</p>
                        <div class="sample-chips">
                            <span class="game-chip" onclick="tabletopTunes.searchBoardGame('Gloomhaven')">Gloomhaven</span>
                            <span class="game-chip" onclick="tabletopTunes.searchBoardGame('Pandemic')">Pandemic</span>
                            <span class="game-chip" onclick="tabletopTunes.searchBoardGame('Scythe')">Scythe</span>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        const currentView = this.currentGamesView || 'grid';
        const currentSort = this.currentGamesSort || 'recent';
        const filterText = this.currentFilter || '';
        
        // Filter games based on search
        let filteredGames = savedGamesList;
        if (filterText) {
            filteredGames = savedGamesList.filter(game => 
                game.name.toLowerCase().includes(filterText.toLowerCase())
            );
        }
        
        // Sort games
        filteredGames = this.sortGamesList(filteredGames, currentSort);
        
        let html = `<div class="saved-games ${currentView}">`;
        
        if (filteredGames.length === 0 && filterText) {
            html += `
                <div class="no-filtering-results">
                    <i class="fas fa-search"></i>
                    <h4>No games found matching "${filterText}"</h4>
                    <p>Try adjusting your search terms or browse all games.</p>
                    <button class="action-btn secondary" onclick="tabletopTunes.clearFilter()">
                        <i class="fas fa-times"></i> Clear Filter
                    </button>
                </div>
            `;
        } else {
            filteredGames.forEach((game, index) => {
                html += this.renderGameCard(game, index, currentView);
            });
        }
        
        html += '</div>';
        
        // Add pagination if we have many games
        if (savedGamesList.length > 20) {
            html += this.renderPagination(filteredGames.length);
        }
        
        gamesClosetContent.innerHTML = html;
        
        // Update filter controls
        this.updateFilterControls(filterText, currentSort, currentView);
    }

    renderGameCard(game, index, view) {
        const gameHistory = this.gamePlaylistHistory[game.name] || { playlists: {}, popularPlaylists: [] };
        const playlistCount = Object.keys(gameHistory.playlists).length;
        const popularPlaylists = gameHistory.popularPlaylists.slice(0, 3);
        const timeSinceLastPlayed = game.lastPlayed ? this.getTimeSince(new Date(game.lastPlayed)) : null;
        const gameThemes = game.detectedCategory ? [game.detectedCategory] : (game.themes || []);
        
        if (view === 'list') {
            return `
                <div class="saved-game-item list-item" data-game="${game.name}" data-index="${index}">
                    <div class="game-basic-info">
                        <div class="game-icon">
                            <i class="fas fa-dice-d6"></i>
                        </div>
                        <div class="game-details">
                            <h4 class="game-name">${game.name}</h4>
                            <div class="game-meta">
                                ${gameThemes.length > 0 ? `<span class="theme-tag">${gameThemes[0]}</span>` : ''}
                                <span class="play-stats">${game.playCount || 0} plays</span>
                                ${timeSinceLastPlayed ? `<span class="last-played">Last: ${timeSinceLastPlayed}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="game-quick-actions">
                        <button class="quick-action-btn" onclick="tabletopTunes.loadGameFromCloset('${game.name}')" title="Find Soundtracks">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="quick-action-btn" onclick="tabletopTunes.showGamePlaylists('${game.name}')" title="View Playlists">
                            <i class="fas fa-list"></i>
                            <span class="badge">${playlistCount}</span>
                        </button>
                        <button class="quick-action-btn danger" onclick="tabletopTunes.removeFromGamesCloset('${game.name}')" title="Remove">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Grid view (enhanced)
        return `
            <div class="saved-game-card enhanced" data-game="${game.name}" data-index="${index}">
                <div class="card-header">
                    <div class="game-avatar">
                        <i class="fas fa-dice-d20"></i>
                        ${game.isFavorite ? '<div class="favorite-badge"><i class="fas fa-star"></i></div>' : ''}
                    </div>
                    <button class="card-menu-btn" onclick="tabletopTunes.toggleGameMenu('${game.name}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
                
                <div class="card-content">
                    <h4 class="game-title">${game.name}</h4>
                    
                    <div class="game-stats-grid">
                        <div class="stat-item">
                            <i class="fas fa-play-circle"></i>
                            <span>${game.playCount || 0} plays</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-music"></i>
                            <span>${playlistCount} soundtracks</span>
                        </div>
                        ${timeSinceLastPlayed ? `
                            <div class="stat-item full-width">
                                <i class="fas fa-clock"></i>
                                <span>Last played ${timeSinceLastPlayed}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${gameThemes.length > 0 ? `
                        <div class="game-themes">
                            ${gameThemes.slice(0, 3).map(theme => `
                                <span class="theme-badge ${theme}">${theme}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${popularPlaylists.length > 0 ? `
                        <div class="popular-soundtracks">
                            <h6>Recent Soundtracks:</h6>
                            <div class="soundtrack-chips">
                                ${popularPlaylists.map(playlistName => `
                                    <span class="soundtrack-chip" onclick="tabletopTunes.loadGamePlaylist('${game.name}', '${playlistName}')">
                                        ${playlistName}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="card-actions">
                    <button class="action-btn primary" onclick="tabletopTunes.loadGameFromCloset('${game.name}')">
                        <i class="fas fa-play"></i> Play Soundtracks
                    </button>
                    <button class="action-btn secondary" onclick="tabletopTunes.showGameDetails('${game.name}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
                
                <div class="card-menu" id="menu-${game.name}" style="display: none;">
                    <button onclick="tabletopTunes.toggleFavorite('${game.name}')">
                        <i class="fas fa-star"></i> ${game.isFavorite ? 'Remove from' : 'Add to'} Favorites
                    </button>
                    <button onclick="tabletopTunes.showGamePlaylists('${game.name}')">
                        <i class="fas fa-history"></i> View All Playlists
                    </button>
                    <button onclick="tabletopTunes.duplicateGame('${game.name}')">
                        <i class="fas fa-copy"></i> Duplicate
                    </button>
                    <button onclick="tabletopTunes.exportGame('${game.name}')">
                        <i class="fas fa-download"></i> Export
                    </button>
                    <button class="danger" onclick="tabletopTunes.removeFromGamesCloset('${game.name}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
    }

    updateClosetDashboard() {
        const games = Object.values(this.savedGames);
        const totalGames = games.length;
        const totalSessions = games.reduce((sum, game) => sum + (game.playCount || 0), 0);
        const totalPlaylists = Object.keys(this.gamePlaylistHistory).reduce((sum, gameName) => {
            return sum + Object.keys(this.gamePlaylistHistory[gameName]?.playlists || {}).length;
        }, 0);
        
        // Find most played game
        const mostPlayed = games.reduce((max, game) => 
            (game.playCount || 0) > (max.playCount || 0) ? game : max, 
            { name: 'No games yet', playCount: 0 }
        );
        
        // Update dashboard elements
        document.getElementById('total-games').textContent = totalGames;
        document.getElementById('total-sessions').textContent = totalSessions;
        document.getElementById('total-playlists').textContent = totalPlaylists;
        document.getElementById('most-played-count').textContent = mostPlayed.playCount || 0;
        
        // Update trends
        const recentActivity = this.getRecentActivity();
        document.getElementById('recent-activity').textContent = recentActivity;
        document.getElementById('most-played-game').textContent = mostPlayed.name;
        
        // Update month stats (simplified)
        const gamesThisMonth = games.filter(game => {
            const addedDate = new Date(game.dateAdded);
            const now = new Date();
            return addedDate.getMonth() === now.getMonth() && addedDate.getFullYear() === now.getFullYear();
        }).length;
        
        document.getElementById('games-trend').innerHTML = `
            <i class="fas fa-arrow-up"></i> <span>+${gamesThisMonth} this month</span>
        `;
        
        // Determine favorite genre
        const genres = {};
        games.forEach(game => {
            const category = game.detectedCategory || 'ambient';
            genres[category] = (genres[category] || 0) + 1;
        });
        
        const favoriteGenre = Object.keys(genres).reduce((a, b) => genres[a] > genres[b] ? a : b, 'Various genres');
        document.getElementById('favorite-genre').textContent = favoriteGenre;
    }
    
    // Helper functions for enhanced games closet
    getTimeSince(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'today';
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }
    
    getRecentActivity() {
        const games = Object.values(this.savedGames);
        const recentGames = games.filter(game => {
            if (!game.lastPlayed) return false;
            const daysSince = (new Date() - new Date(game.lastPlayed)) / (1000 * 60 * 60 * 24);
            return daysSince <= 7;
        });
        
        if (recentGames.length === 0) return 'No recent activity';
        if (recentGames.length === 1) return `1 game this week`;
        return `${recentGames.length} games this week`;
    }
    
    sortGamesList(games, sortType) {
        switch (sortType) {
            case 'alphabetical':
                return games.sort((a, b) => a.name.localeCompare(b.name));
            case 'play-count':
                return games.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
            case 'date-added':
                return games.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            case 'recent':
            default:
                return games.sort((a, b) => new Date(b.lastPlayed || b.dateAdded) - new Date(a.lastPlayed || a.dateAdded));
        }
    }
    
    filterGames(searchText) {
        this.currentFilter = searchText;
        this.displayGamesCloset();
        
        // Update clear button visibility
        const clearBtn = document.querySelector('.clear-search');
        if (clearBtn) {
            clearBtn.style.display = searchText ? 'block' : 'none';
        }
    }
    
    clearFilter() {
        this.currentFilter = '';
        document.getElementById('game-filter').value = '';
        this.displayGamesCloset();
    }
    
    sortGames(sortType) {
        this.currentGamesSort = sortType;
        this.displayGamesCloset();
    }
    
    setView(viewType) {
        this.currentGamesView = viewType;
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
        this.displayGamesCloset();
    }
    
    updateFilterControls(filterText, sortType, viewType) {
        const sortSelect = document.getElementById('sort-games');
        if (sortSelect) sortSelect.value = sortType;
        
        const gameFilter = document.getElementById('game-filter');
        if (gameFilter) gameFilter.value = filterText;
        
        const clearBtn = document.querySelector('.clear-search');
        if (clearBtn) clearBtn.style.display = filterText ? 'block' : 'none';
    }
    
    renderPagination(totalItems) {
        // Simple pagination for large collections
        const itemsPerPage = 20;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (totalPages <= 1) return '';
        
        return `
            <div class="pagination">
                <span class="pagination-info">Showing ${totalItems} games</span>
                <div class="pagination-controls">
                    <button class="page-btn" onclick="tabletopTunes.previousPage()" disabled>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span class="page-indicator">1 of ${totalPages}</span>
                    <button class="page-btn" onclick="tabletopTunes.nextPage()">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    // New enhanced features for games closet
    showBulkActions() {
        const quickActions = document.getElementById('quick-actions');
        if (quickActions) {
            quickActions.style.display = quickActions.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    showSampleGames() {
        const sampleGames = ['Gloomhaven', 'Pandemic', 'Scythe', 'Wingspan', 'Azul'];
        sampleGames.forEach(gameName => {
            this.saveToGamesCloset(gameName, { 
                source: 'sample',
                detectedCategory: 'adventure'
            });
        });
        this.displayGamesCloset();
        this.showNotification('Added sample games to your collection!', 'success');
    }
    
    toggleGameMenu(gameName) {
        const menu = document.getElementById(`menu-${gameName}`);
        if (menu) {
            // Close all other menus first
            document.querySelectorAll('.card-menu').forEach(m => {
                if (m !== menu) m.style.display = 'none';
            });
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    toggleFavorite(gameName) {
        if (this.savedGames[gameName]) {
            this.savedGames[gameName].isFavorite = !this.savedGames[gameName].isFavorite;
            this.saveUserData();
            this.displayGamesCloset();
            this.showNotification(
                `${gameName} ${this.savedGames[gameName].isFavorite ? 'added to' : 'removed from'} favorites!`, 
                'success'
            );
        }
    }
    
    showGameDetails(gameName) {
        const game = this.savedGames[gameName];
        if (!game) return;
        
        const gameHistory = this.gamePlaylistHistory[gameName] || { playlists: {}, popularPlaylists: [] };
        const detailsHtml = `
            <div class="game-details-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-dice-d20"></i> ${gameName}</h2>
                        <button class="close-modal" onclick="tabletopTunes.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-section">
                            <h4>Play Statistics</h4>
                            <div class="stats-grid">
                                <div class="stat"><label>Total Plays:</label> <span>${game.playCount || 0}</span></div>
                                <div class="stat"><label>Date Added:</label> <span>${new Date(game.dateAdded).toLocaleDateString()}</span></div>
                                <div class="stat"><label>Last Played:</label> <span>${game.lastPlayed ? new Date(game.lastPlayed).toLocaleDateString() : 'Never'}</span></div>
                                <div class="stat"><label>Category:</label> <span>${game.detectedCategory || 'Unknown'}</span></div>
                            </div>
                        </div>
                        <div class="detail-section">
                            <h4>Soundtrack History</h4>
                            <div class="playlist-history">
                                ${Object.keys(gameHistory.playlists).length > 0 ? 
                                    Object.entries(gameHistory.playlists).map(([playlist, count]) => 
                                        `<div class="playlist-entry">
                                            <span class="playlist-name">${playlist}</span>
                                            <span class="usage-count">Used ${count} times</span>
                                        </div>`
                                    ).join('') : 
                                    '<p>No soundtrack history yet.</p>'
                                }
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="action-btn primary" onclick="tabletopTunes.loadGameFromCloset('${gameName}'); tabletopTunes.closeModal();">
                            <i class="fas fa-play"></i> Play Soundtracks
                        </button>
                        <button class="action-btn secondary" onclick="tabletopTunes.closeModal()">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        modalBackdrop.innerHTML = detailsHtml;
        document.body.appendChild(modalBackdrop);
    }
    
    closeModal() {
        const modal = document.querySelector('.modal-backdrop');
        if (modal) {
            modal.remove();
        }
    }
    
    exportGamesData() {
        const data = {
            games: this.savedGames,
            gameHistory: this.gamePlaylistHistory,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tabletop-tunes-games-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Games data exported successfully!', 'success');
    }
    
    importGamesData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.games) {
                        // Merge imported games
                        Object.assign(this.savedGames, data.games);
                        if (data.gameHistory) {
                            Object.assign(this.gamePlaylistHistory, data.gameHistory);
                        }
                        this.saveUserData();
                        this.displayGamesCloset();
                        this.showNotification('Games imported successfully!', 'success');
                    }
                } catch (error) {
                    this.showNotification('Error importing games data', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
    
    generateReport() {
        const games = Object.values(this.savedGames);
        const totalPlays = games.reduce((sum, game) => sum + (game.playCount || 0), 0);
        const mostPlayed = games.reduce((max, game) => 
            (game.playCount || 0) > (max.playCount || 0) ? game : max, 
            { name: 'None', playCount: 0 }
        );
        
        const reportHtml = `
            <div class="game-report-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-chart-bar"></i> Your Gaming Report</h2>
                        <button class="close-modal" onclick="tabletopTunes.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="report-stats">
                            <div class="report-card">
                                <h3>${games.length}</h3>
                                <label>Games in Collection</label>
                            </div>
                            <div class="report-card">
                                <h3>${totalPlays}</h3>
                                <label>Total Play Sessions</label>
                            </div>
                            <div class="report-card">
                                <h3>${mostPlayed.name}</h3>
                                <label>Most Played Game</label>
                            </div>
                        </div>
                        <div class="report-details">
                            <h4>Collection Insights</h4>
                            <p>You've been building an impressive collection! Keep exploring new games and soundtracks.</p>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="action-btn primary" onclick="tabletopTunes.exportGamesData(); tabletopTunes.closeModal();">
                            <i class="fas fa-download"></i> Export Data
                        </button>
                        <button class="action-btn secondary" onclick="tabletopTunes.closeModal()">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        modalBackdrop.innerHTML = reportHtml;
        document.body.appendChild(modalBackdrop);
    }
    
    clearAllGames() {
        if (confirm('Are you sure you want to remove all games from your collection? This action cannot be undone.')) {
            this.savedGames = {};
            this.gamePlaylistHistory = {};
            this.saveUserData();
            this.displayGamesCloset();
            this.showNotification('All games cleared from collection', 'success');
        }
    }
    
    loadGameFromCloset(gameName) {
        // Switch to main tab and perform search
        this.switchTab('main');
        document.getElementById('game-search').value = gameName;
        this.currentBoardGame = gameName; // Set game context immediately
        this.performGameSearch();
        
        // Update UI to show game session is starting
        this.updateGameSessionIndicator();
        this.showNotification(`Starting game session for ${gameName}`, 'success');
    }
    
    showGamePlaylists(gameName) {
        const gameHistory = this.gamePlaylistHistory[gameName];
        if (!gameHistory || Object.keys(gameHistory.playlists).length === 0) {
            this.showNotification(`No playlists found for ${gameName}`);
            return;
        }
        
        // Create modal or expand section to show playlists
        const playlists = Object.values(gameHistory.playlists)
            .sort((a, b) => b.timesUsed - a.timesUsed);
        
        let html = `
            <div class="game-playlists-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-dice-d20"></i> ${gameName} - Playlist History</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="playlists-list">
        `;
        
        playlists.forEach(playlist => {
            html += `
                <div class="playlist-history-item">
                    <div class="playlist-info">
                        <h4>${playlist.name}</h4>
                        <div class="playlist-meta">
                            <span><i class="fas fa-play"></i> Used ${playlist.timesUsed} time${playlist.timesUsed !== 1 ? 's' : ''}</span>
                            <span><i class="fas fa-clock"></i> Last used: ${new Date(playlist.lastUsed).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <button class="load-playlist-btn" onclick="tabletopTunes.loadGamePlaylist('${gameName}', '${playlist.name}')">
                        <i class="fas fa-download"></i> Load Playlist
                    </button>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        // Add modal to page
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = html;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        document.body.appendChild(modal);
    }
    
    loadGamePlaylist(gameName, playlistName) {
        const gameHistory = this.gamePlaylistHistory[gameName];
        const playlist = gameHistory?.playlists[playlistName];
        
        if (!playlist) {
            this.showNotification(`Playlist "${playlistName}" not found`);
            return;
        }
        
        // Load the playlist data
        if (playlist.data) {
            this.currentCategory = playlist.data.category;
            this.currentPlaylist = playlist.data.tracks || [];
            this.currentTrackIndex = 0;
            this.currentBoardGame = gameName;
            
            // Update UI
            this.switchTab('main');
            document.querySelectorAll('.category-card').forEach(card => {
                card.classList.remove('active');
            });
            if (playlist.data.category) {
                const categoryCard = document.querySelector(`[data-category="${playlist.data.category}"]`);
                if (categoryCard) categoryCard.classList.add('active');
            }
            
            // Update playlist header to show game context
            const playlistHeader = document.querySelector('.playlist-header h3');
            if (playlistHeader) {
                playlistHeader.textContent = `Playing for ${gameName}`;
            }
            
            this.displayPlaylist();
            this.updateCurrentTrackInfo();
            
            this.showNotification(`Loaded "${playlistName}" for ${gameName}`, 'success');
            
            // Track this usage
            this.trackGamePlaylist(gameName, playlistName, playlist.data);
        }
        
        // Close modal if it exists
        const modal = document.querySelector('.modal-backdrop');
        if (modal) modal.remove();
    }
    
    updateGamesClosetStats() {
        const totalGamesElement = document.getElementById('total-games');
        const totalSessionsElement = document.getElementById('total-sessions');
        const totalPlaylistsElement = document.getElementById('total-playlists');
        
        if (!totalGamesElement) return;
        
        const totalGames = Object.keys(this.savedGames).length;
        const totalSessions = Object.values(this.savedGames).reduce((sum, game) => sum + (game.playCount || 0), 0);
        
        // Count unique playlists across all games
        const allPlaylists = new Set();
        Object.values(this.gamePlaylistHistory).forEach(gameHistory => {
            Object.keys(gameHistory.playlists || {}).forEach(playlistName => {
                allPlaylists.add(playlistName);
            });
        });
        
        totalGamesElement.textContent = totalGames;
        totalSessionsElement.textContent = totalSessions;
        totalPlaylistsElement.textContent = allPlaylists.size;
    }
    
    updateDisplay() {
        this.updateCurrentTrackInfo();
        this.displayPlaylist();
    }
    
    // Show the player section when music is selected
    showPlayerSection() {
        const playerSection = document.getElementById('player-section');
        if (playerSection) {
            playerSection.style.display = 'block';
            // Add a smooth slide-in animation
            playerSection.style.opacity = '0';
            playerSection.style.transform = 'translateY(20px)';
            
            // Trigger animation
            setTimeout(() => {
                playerSection.style.transition = 'all 0.3s ease-out';
                playerSection.style.opacity = '1';
                playerSection.style.transform = 'translateY(0)';
            }, 50);
        }
    }
    
    // Hide the player section when no music is selected
    hidePlayerSection() {
        const playerSection = document.getElementById('player-section');
        if (playerSection) {
            playerSection.style.transition = 'all 0.3s ease-out';
            playerSection.style.opacity = '0';
            playerSection.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                playerSection.style.display = 'none';
            }, 300);
        }
    }
    
    showNotification(message, type = 'default') {
        // Create and show a notification with support for different types
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Define different styles for notification types
        let backgroundColor;
        switch (type) {
            case 'success':
                backgroundColor = 'linear-gradient(45deg, #10b981, #059669)';
                break;
            case 'info':
                backgroundColor = 'linear-gradient(45deg, #6366f1, #4f46e5)';
                break;
            case 'warning':
                backgroundColor = 'linear-gradient(45deg, #f59e0b, #d97706)';
                break;
            case 'error':
                backgroundColor = 'linear-gradient(45deg, #ef4444, #dc2626)';
                break;
            default:
                backgroundColor = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
        }
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
            max-width: 350px;
            word-wrap: break-word;
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
        
        // Remove notification after 3 seconds (longer for info/success messages)
        const duration = type === 'info' || type === 'success' ? 4000 : 3000;
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Live Search Functionality
    handleLiveSearch(query) {
        // Clear previous timeout
        if (this.liveSearchTimeout) {
            clearTimeout(this.liveSearchTimeout);
        }
        
        // Hide suggestions if query is too short
        if (query.length < 2) {
            this.hideLiveSearchResults();
            return;
        }
        
        // Debounce the search to avoid excessive API calls
        this.liveSearchTimeout = setTimeout(() => {
            this.performLiveSearch(query);
        }, 300);
    }
    
    async performLiveSearch(query) {
        try {
            const suggestions = await this.getLiveSearchSuggestions(query);
            this.displayLiveSearchResults(suggestions, query);
        } catch (error) {
            console.error('Live search error:', error);
            this.hideLiveSearchResults();
        }
    }
    
    async getLiveSearchSuggestions(query) {
        const suggestions = [];
        const normalizedQuery = query.toLowerCase();
        
        // Only check My Games for matches (no more built-in database)
        Object.keys(this.savedGames).forEach(gameName => {
            if (gameName.toLowerCase().includes(normalizedQuery)) {
                suggestions.push({
                    name: gameName,
                    source: 'mygames',
                    category: this.savedGames[gameName].detectedCategory || 'adventure',
                    themes: this.savedGames[gameName].themes || []
                });
            }
        });
        
        // Add theme-based suggestions if not many matches found
        if (suggestions.length < 3) {
            const themes = ['fantasy', 'scifi', 'horror', 'adventure', 'mystery', 'western'];
            themes.forEach(theme => {
                if (theme.includes(normalizedQuery) || normalizedQuery.includes(theme)) {
                    suggestions.push({
                        name: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Games`,
                        source: 'theme',
                        category: theme,
                        isCategory: true
                    });
                }
            });
        }
        
        // Add a "Search BGG" suggestion if query is long enough and not in My Games
        if (query.length >= 3 && suggestions.length === 0) {
            suggestions.push({
                name: `Search BGG for "${query}"`,
                source: 'bgg_search',
                category: 'search',
                isSearch: true
            });
        }
        
        // Limit to top 5 suggestions
        return suggestions.slice(0, 5);
    }
    
    displayLiveSearchResults(suggestions, query) {
        let container = document.getElementById('live-search-results');
        
        // Create container if it doesn't exist
        if (!container) {
            container = document.createElement('div');
            container.id = 'live-search-results';
            container.className = 'live-search-results';
            
            const searchContainer = document.querySelector('.search-container');
            searchContainer.appendChild(container);
        }
        
        if (suggestions.length === 0) {
            // Escape query to prevent XSS
            const escapedQuery = this.escapeHtml(query);
            container.innerHTML = `
                <div class="live-search-item no-results">
                    <i class="fas fa-search" style="margin-right: 8px; color: var(--text-secondary);"></i>
                    <span>No matches found for "${escapedQuery}"</span>
                </div>
            `;
        } else {
            container.innerHTML = suggestions.map(suggestion => {
                // Escape all user-generated content
                const escapedName = this.escapeHtml(suggestion.name);
                const escapedSource = this.escapeHtml(suggestion.source);
                const escapedThemes = suggestion.themes ? this.escapeHtml(suggestion.themes.slice(0, 3).join(', ')) : '';
                
                // Map internal source names to user-friendly display names
                const sourceDisplayMap = {
                    'mygames': 'My Games',
                    'theme': 'Theme Match',
                    'bgg_search': 'Search BGG'
                };
                const displaySource = sourceDisplayMap[suggestion.source] || suggestion.source;
                
                const iconClass = suggestion.isCategory 
                    ? 'fa-layer-group' 
                    : suggestion.isSearch
                        ? 'fa-search'
                        : suggestion.source === 'mygames' 
                            ? 'fa-user-circle' 
                            : 'fa-dice';

                return `
                    <div class="live-search-item" onclick="tabletopTunes.selectLiveSearchResult('${escapedName}', '${escapedSource}')">
                        <i class="fas ${iconClass}" style="margin-right: 8px; color: var(--primary-color);"></i>
                        <div class="suggestion-content">
                            <span class="suggestion-name">${escapedName}</span>
                            ${escapedThemes ? `<span class="suggestion-themes">${escapedThemes}</span>` : ''}
                        </div>
                        <span class="suggestion-source">${displaySource}</span>
                    </div>
                `;
            }).join('');
        }

        container.style.display = 'block';
    }
    
    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    hideLiveSearchResults() {
        const container = document.getElementById('live-search-results');
        if (container) {
            container.style.display = 'none';
        }
    }
    
    selectLiveSearchResult(gameName, source) {
        const searchInput = document.getElementById('game-search');
        searchInput.value = gameName;
        this.hideLiveSearchResults();
        
        if (source === 'theme') {
            // Extract theme from the name (e.g., "Fantasy Games" -> "fantasy")
            const theme = gameName.toLowerCase().replace(' games', '');
            this.selectCategory(theme);
        } else {
            this.performGameSearch();
        }
    }

    // Board Game Matching Functions
    async performGameSearch() {
        const gameInput = document.getElementById('game-search').value.trim();
        if (!gameInput) {
            this.showNotification('Please enter a board game name');
            return;
        }
        
        try {
            const result = await this.searchBoardGame(gameInput);
            console.log('Search result:', result, 'has suggestedSoundtracks:', !!result?.suggestedSoundtracks);
            if (!result) {
                this.showNotification(`No specific suggestions found for "${gameInput}". Try browsing categories or popular games.`);
                // Reset to category browsing
                this.matchingMode = 'category';
                this.currentBoardGame = null;
                const playlistTitle = document.querySelector('.playlist-section h3');
                if (playlistTitle) playlistTitle.textContent = 'Current Playlist';
            } else if (result.category && !result.suggestedSoundtracks) {
                // Handle theme-based results only (not game database results)
                console.log('Calling displayThemeBasedSuggestions for:', gameInput);
                this.currentBoardGame = gameInput;
                this.matchingMode = 'boardgame';
                this.displayThemeBasedSuggestions(result, gameInput);
            }
            // If result has suggestedSoundtracks, displayGameSuggestions was already called in searchBoardGame
        } catch (error) {
            console.error('Game search error:', error);
            this.showNotification('Error searching for game. Please try again.');
        }
    }

    /**
     * Find a game in the user's My Games collection
     * @param {string} gameName - Name to search for
     * @returns {Object|null} Found game or null
     */
    findGameInMyGames(gameName) {
        const normalizedSearch = gameName.toLowerCase();
        
        // First try exact match
        for (const [savedName, gameData] of Object.entries(this.savedGames)) {
            if (savedName.toLowerCase() === normalizedSearch) {
                return { ...gameData, name: savedName };
            }
        }
        
        // Then try partial match
        for (const [savedName, gameData] of Object.entries(this.savedGames)) {
            if (savedName.toLowerCase().includes(normalizedSearch) || 
                normalizedSearch.includes(savedName.toLowerCase())) {
                return { ...gameData, name: savedName };
            }
        }
        
        return null;
    }

    /**
     * Display suggestions for a game from My Games
     * @param {Object} gameData - Game data from My Games
     */
    displayMyGameSuggestions(gameData) {
        if (gameData.bggData) {
            // If it has BGG data, display using BGG format
            this.displayBGGGameSuggestions(gameData.bggData, gameData.name);
        } else if (gameData.source === 'theme_analysis') {
            // If it's from theme analysis, regenerate suggestions
            const themeResult = this.suggestByTheme(gameData.name);
            if (themeResult) {
                this.displayThemeBasedSuggestions(themeResult, gameData.name);
            }
        } else {
            // Fallback to theme analysis for any other cases
            const themeResult = this.suggestByTheme(gameData.name);
            if (themeResult) {
                this.displayThemeBasedSuggestions(themeResult, gameData.name);
            }
        }
    }

    async searchBoardGame(gameName) {
        console.log('searchBoardGame called with:', gameName);
        
        // First, check if game is already in My Games
        const existingGame = this.findGameInMyGames(gameName);
        if (existingGame) {
            console.log('Found game in My Games:', existingGame);
            this.currentBoardGame = existingGame.name;
            this.matchingMode = 'boardgame';
            
            // Show selected game area
            this.showSelectedGameArea(existingGame);
            
            // Display using the saved game data
            this.displayMyGameSuggestions(existingGame);
            
            // Update play count only (don't create new entry)
            this.saveToGamesCloset(existingGame.name);
            
            return existingGame;
        }
        
        // Game not in My Games, search BGG for multiple results
        this.showNotification('Searching BoardGameGeek for games...', 'info');
        try {
            // First try to get multiple search results
            const bggSearchResults = await this.bggService.searchGames(gameName);
            
            if (bggSearchResults && bggSearchResults.length > 0) {
                if (bggSearchResults.length === 1) {
                    // Single result - get details and display normally
                    const bggGame = await this.bggService.getGameDetails(bggSearchResults[0].id);
                    if (bggGame) {
                        return this.handleSingleBGGResult(bggGame, gameName);
                    }
                } else {
                    // Multiple results - show selection interface
                    this.displayMultipleBGGResults(bggSearchResults, gameName);
                    return { multipleResults: true, results: bggSearchResults };
                }
            }
            
            // Fallback to old single-game search
            const bggGame = await this.bggService.getGameByName(gameName);
            if (bggGame) {
                return this.handleSingleBGGResult(bggGame, gameName);
            }
        } catch (error) {
            console.warn('BGG API search failed:', error);
        }
        
        // Final fallback to theme-based matching
        this.showNotification('Game not found on BGG, using theme analysis...', 'info');
        const themeResult = this.suggestByTheme(gameName);
        if (themeResult) {
            // Create game data object for selected game area
            const gameData = {
                name: gameName,
                source: 'theme_analysis',
                detectedCategory: themeResult.category 
            };
            
            // Show selected game area
            this.showSelectedGameArea(gameData);
            
            // Store theme-based game data temporarily for later saving when music is played
            this.pendingGameData = gameData;
        }
        
        return themeResult;
    }

    /**
     * Handle a single BGG search result
     */
    handleSingleBGGResult(bggGame, originalGameName) {
        // Use BGG's official name
        const officialName = bggGame.name || originalGameName;
        this.currentBoardGame = officialName;
        this.matchingMode = 'boardgame';
        
        // Create game data object for selected game area
        const gameData = {
            name: officialName,
            source: 'boardgamegeek',
            bggData: {
                yearPublished: bggGame.yearPublished,
                minPlayers: bggGame.minPlayers,
                maxPlayers: bggGame.maxPlayers,
                playingTime: bggGame.playingTime,
                complexity: bggGame.complexity,
                rating: bggGame.rating,
                description: bggGame.description,
                categories: bggGame.categories || [],
                mechanisms: bggGame.mechanisms || [],
                families: bggGame.families || [],
                themes: bggGame.themes || [],
                detectedCategory: bggGame.category,
                image: bggGame.image
            }
        };
        
        // Show selected game area
        this.showSelectedGameArea(gameData);
        
        this.displayBGGGameSuggestions(bggGame);
        
        // Store game data temporarily for later saving when music is played
        this.pendingGameData = gameData;
        
        this.showNotification(`Found "${officialName}" on BGG! Play a soundtrack to add it to My Games.`, 'info');
        return bggGame;
    }

    /**
     * Display multiple BGG search results for user selection
     */
    displayMultipleBGGResults(results, originalQuery) {
        const trackList = document.getElementById('track-list');
        if (!trackList) return;

        this.showNotification(`Found ${results.length} games matching "${originalQuery}" on BGG. Select one to continue.`, 'info');

        let html = `
            <div class="multiple-results-container">
                <div class="multiple-results-header">
                    <h4><i class="fas fa-search"></i> Multiple Games Found</h4>
                    <p>Found ${results.length} games matching "${originalQuery}" on BoardGameGeek. Click on one to see soundtrack suggestions:</p>
                </div>
                <div class="bgg-results-grid">
        `;

        // Show up to 10 results to avoid overwhelming the user
        const resultsToShow = results.slice(0, 10);
        
        resultsToShow.forEach((result, index) => {
            const yearText = result.yearPublished ? ` (${result.yearPublished})` : '';
            
            html += `
                <div class="bgg-result-card" onclick="tabletopTunes.selectBGGResult(${result.id}, '${this.escapeHtml(result.name)}', '${this.escapeHtml(originalQuery)}')">
                    <div class="bgg-result-header">
                        <h5 class="bgg-game-name">${this.escapeHtml(result.name)}</h5>
                        <span class="bgg-year-badge">${yearText}</span>
                    </div>
                    <div class="bgg-result-meta">
                        <span class="bgg-id">BGG ID: ${result.id}</span>
                        <span class="result-index">#${index + 1}</span>
                    </div>
                    <div class="bgg-result-actions">
                        <i class="fas fa-play-circle"></i>
                        <span>Select & Get Soundtracks</span>
                    </div>
                </div>
            `;
        });

        if (results.length > 10) {
            html += `
                <div class="more-results-notice">
                    <i class="fas fa-info-circle"></i>
                    <span>Showing first 10 of ${results.length} results. Try a more specific search for fewer results.</span>
                </div>
            `;
        }

        html += `
                </div>
                <div class="multiple-results-actions">
                    <button class="action-btn secondary" onclick="tabletopTunes.cancelBGGSearch('${this.escapeHtml(originalQuery)}')">
                        <i class="fas fa-times"></i> Cancel & Use Theme Analysis
                    </button>
                </div>
            </div>
        `;

        trackList.innerHTML = html;
    }

    /**
     * Handle selection of a specific BGG result
     */
    async selectBGGResult(bggId, gameName, originalQuery) {
        this.showNotification(`Loading details for "${gameName}"...`, 'info');
        
        try {
            const bggGame = await this.bggService.getGameDetails(bggId);
            if (bggGame) {
                this.handleSingleBGGResult(bggGame, gameName);
            } else {
                this.showNotification(`Could not load details for "${gameName}". Using theme analysis instead.`, 'warning');
                this.fallbackToThemeAnalysis(originalQuery);
            }
        } catch (error) {
            console.error('Error loading BGG game details:', error);
            this.showNotification(`Error loading "${gameName}". Using theme analysis instead.`, 'error');
            this.fallbackToThemeAnalysis(originalQuery);
        }
    }

    /**
     * Cancel BGG search and fall back to theme analysis
     */
    cancelBGGSearch(originalQuery) {
        this.showNotification(`Using theme analysis for "${originalQuery}"...`, 'info');
        this.fallbackToThemeAnalysis(originalQuery);
    }

    /**
     * Fallback to theme-based analysis
     */
    fallbackToThemeAnalysis(gameName) {
        const themeResult = this.suggestByTheme(gameName);
        if (themeResult) {
            // Create game data object for selected game area
            const gameData = {
                name: gameName,
                source: 'theme_analysis',
                detectedCategory: themeResult.category 
            };
            
            // Show selected game area
            this.showSelectedGameArea(gameData);
            
            // Store theme-based game data temporarily for later saving when music is played
            this.pendingGameData = gameData;
            
            this.displayThemeBasedSuggestions(themeResult, gameName);
        }
    }

    /**
     * Enhance game data with movie API information
     * @param {Object} gameData - Original game data from database
     * @returns {Promise<Object>} Enhanced game data with movie API info
     */
    async enhanceWithMovieData(gameData) {
        if (!gameData || !this.movieService) {
            return gameData;
        }

        try {
            // Show loading indication for movie data enhancement
            this.showNotification('Enhancing with movie soundtrack data...', 'info');
            
            // Enhance using the movie service
            const enhancedData = await this.movieService.enhanceGameSuggestions(gameData);
            
            // Also fetch additional movie suggestions based on themes
            if (gameData.themes && gameData.themes.length > 0) {
                const additionalMovies = await this.getAdditionalMovieSuggestions(gameData.themes);
                if (additionalMovies.length > 0) {
                    enhancedData.additionalSuggestions = additionalMovies;
                }
            }
            
            this.showNotification('Movie soundtrack data loaded!', 'success');
            return enhancedData;
            
        } catch (error) {
            console.warn('Failed to enhance with movie data:', error);
            // Return original data if enhancement fails
            return gameData;
        }
    }

    /**
     * Get additional movie suggestions based on game themes
     * @param {Array} themes - Game themes array
     * @returns {Promise<Array>} Additional movie suggestions
     */
    async getAdditionalMovieSuggestions(themes) {
        const additionalSuggestions = [];
        
        // Map game themes to movie genres
        const themeToGenreMap = {
            'fantasy': 'fantasy',
            'medieval': 'fantasy',
            'magic': 'fantasy',
            'scifi': 'scifi',
            'space': 'scifi',
            'futuristic': 'scifi',
            'horror': 'horror',
            'scary': 'horror',
            'dark': 'horror',
            'adventure': 'adventure',
            'exploration': 'adventure',
            'journey': 'adventure',
            'mystery': 'mystery',
            'detective': 'mystery',
            'puzzle': 'mystery'
        };
        
        // Get movies for each relevant theme
        for (const theme of themes) {
            const genre = themeToGenreMap[theme.toLowerCase()];
            if (genre) {
                try {
                    const genreMovies = await this.movieService.getMoviesByGenre(genre);
                    
                    // Add first few movies from each genre
                    const selectedMovies = genreMovies.slice(0, 2).map(movieTitle => ({
                        movie: movieTitle,
                        reason: `Additional ${genre} soundtrack for ${theme} themes`,
                        tracks: ['Main Theme', 'Atmospheric Tracks', 'Action Sequences'],
                        source: 'api_genre_suggestion'
                    }));
                    
                    additionalSuggestions.push(...selectedMovies);
                } catch (error) {
                    console.warn(`Failed to get ${genre} movies for theme ${theme}:`, error);
                }
            }
        }
        
        // Remove duplicates and limit results
        const uniqueSuggestions = additionalSuggestions.filter((item, index, self) =>
            index === self.findIndex(t => t.movie === item.movie)
        );
        
        return uniqueSuggestions.slice(0, 5); // Limit to 5 additional suggestions
    }

    suggestByTheme(input) {
        const normalizedInput = input.toLowerCase().trim();
        
        // Use advanced theme analysis directly (no more database lookup)
        return this.analyzeThemeKeywords(normalizedInput, input);
    }

    processGameData(gameData, originalInput) {
        const scores = this.calculateDetailedScores(gameData.themes, originalInput);
        const bestCategory = this.selectBestCategory(scores);
        
        return {
            category: bestCategory.name,
            reason: `Perfect match! "${originalInput}" themes: ${gameData.themes.join(', ')}`,
            tracks: this.soundtracks[bestCategory.name] || [],
            confidence: bestCategory.score,
            gameData: gameData,
            detectedThemes: gameData.themes,
            scoringBreakdown: scores
        };
    }

    analyzeThemeKeywords(normalizedInput, originalInput) {
        const themes = normalizedInput.split(' ');
        const allKeywords = this.extractAdvancedKeywords(normalizedInput);
        const scores = this.calculateKeywordScores(allKeywords, normalizedInput);
        const bestCategory = this.selectBestCategory(scores);
        
        if (bestCategory.score === 0) {
            return this.getDefaultRecommendation(originalInput);
        }
        
        return {
            category: bestCategory.name,
            reason: `Theme analysis detected: ${allKeywords.slice(0, 3).join(', ')} (${bestCategory.score}% match)`,
            tracks: this.soundtracks[bestCategory.name] || [],
            confidence: bestCategory.score,
            detectedKeywords: allKeywords,
            scoringBreakdown: scores
        };
    }

    extractAdvancedKeywords(input) {
        const commonWords = ['the', 'of', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should'];
        const words = input.toLowerCase().split(/\s+/).filter(word => 
            word.length > 2 && !commonWords.includes(word)
        );
        
        // Enhanced keyword extraction with synonym mapping
        const keywordMappings = {
            // Fantasy synonyms
            'magic': ['magical', 'wizard', 'sorcery', 'spell', 'enchanted', 'mystical'],
            'dragon': ['wyrm', 'drake', 'wyvern'],
            'fantasy': ['medieval', 'knights', 'castle', 'kingdom', 'quest', 'dungeon'],
            // Horror synonyms  
            'horror': ['scary', 'frightening', 'terrifying', 'spooky', 'creepy'],
            'zombie': ['undead', 'ghoul', 'walking dead'],
            'ghost': ['spirit', 'phantom', 'specter', 'haunted'],
            // Sci-fi synonyms
            'space': ['cosmic', 'galactic', 'stellar', 'universe', 'spaceship'],
            'robot': ['android', 'cyborg', 'mech', 'mechanical'],
            'future': ['futuristic', 'cyberpunk', 'dystopian', 'utopian'],
            // Adventure synonyms
            'adventure': ['journey', 'expedition', 'exploration', 'voyage'],
            'treasure': ['gold', 'riches', 'loot', 'bounty'],
            'pirate': ['buccaneer', 'swashbuckler', 'corsair']
        };
        
        const enhancedKeywords = new Set(words);
        words.forEach(word => {
            Object.entries(keywordMappings).forEach(([category, synonyms]) => {
                if (synonyms.includes(word) || word.includes(category)) {
                    enhancedKeywords.add(category);
                }
            });
        });
        
        return Array.from(enhancedKeywords);
    }

    calculateDetailedScores(themes, input) {
        const scores = {
            fantasy: 0,
            horror: 0,
            scifi: 0,
            adventure: 0,
            ambient: 0,
            tavern: 0
        };
        
        const themeWeights = {
            // Fantasy themes
            'fantasy': { fantasy: 90, adventure: 30 },
            'magic': { fantasy: 85, ambient: 20 },
            'medieval': { fantasy: 80, adventure: 40 },
            'dragon': { fantasy: 95, horror: 10 },
            'dungeon': { fantasy: 75, horror: 45, adventure: 35 },
            
            // Horror themes
            'horror': { horror: 95 },
            'zombie': { horror: 90, scifi: 20 },
            'ghost': { horror: 85, fantasy: 15 },
            'haunted': { horror: 80, fantasy: 25 },
            'betrayal': { horror: 60, adventure: 30 },
            
            // Sci-fi themes
            'space': { scifi: 90, adventure: 25 },
            'robot': { scifi: 85, fantasy: 10 },
            'cyber': { scifi: 80, horror: 20 },
            'future': { scifi: 75, adventure: 20 },
            'alien': { scifi: 90, horror: 30 },
            
            // Adventure themes
            'adventure': { adventure: 85, fantasy: 30 },
            'exploration': { adventure: 80, ambient: 20 },
            'journey': { adventure: 75, ambient: 35 },
            'quest': { adventure: 85, fantasy: 40 },
            'treasure': { adventure: 80, fantasy: 20 },
            
            // Ambient themes
            'peaceful': { ambient: 90, fantasy: 15 },
            'nature': { ambient: 85, fantasy: 25 },
            'calm': { ambient: 80 },
            'meditation': { ambient: 95 },
            'artistic': { ambient: 70, fantasy: 20 },
            
            // Tavern/Social themes
            'tavern': { tavern: 85, fantasy: 20 },
            'inn': { tavern: 80, fantasy: 15 },
            'social': { tavern: 75, ambient: 25 },
            'party': { tavern: 70, ambient: 20 },
            'gathering': { tavern: 65, ambient: 30 },
            'feast': { tavern: 70, fantasy: 15 }
        };
        
        themes.forEach(theme => {
            const weights = themeWeights[theme.toLowerCase()];
            if (weights) {
                Object.entries(weights).forEach(([category, weight]) => {
                    if (scores.hasOwnProperty(category)) {
                        scores[category] += weight;
                    }
                });
            }
        });
        
        // Normalize scores to 0-100 range
        const maxScore = Math.max(...Object.values(scores));
        if (maxScore > 0) {
            Object.keys(scores).forEach(key => {
                scores[key] = Math.round((scores[key] / maxScore) * 100);
            });
        }
        
        return scores;
    }

    calculateKeywordScores(keywords, input) {
        const scores = this.calculateDetailedScores(keywords, input);
        
        // Add deterministic baseline scores to prevent all zeros, maintaining meaningful differentiation
        const baselineScores = {
            ambient: 10,   // Universal fallback - most games can use ambient music
            fantasy: 15,   // Popular and versatile category
            adventure: 12, // Common theme across many games  
            scifi: 8,      // More niche, lower baseline
            horror: 6,     // Very specific genre, lowest baseline
            tavern: 9      // Social/casual games baseline
        };
        
        Object.keys(scores).forEach(key => {
            if (scores[key] === 0) {
                scores[key] = baselineScores[key] || 10; // Default to 10 if category not found
            }
        });
        
        return scores;
    }

    selectBestCategory(scores) {
        const entries = Object.entries(scores);
        const best = entries.reduce((max, [category, score]) => 
            score > max.score ? { name: category, score } : max, 
            { name: 'ambient', score: 0 }
        );
        
        return best;
    }

    getDefaultRecommendation(input) {
        return {
            category: 'ambient',
            reason: `No specific themes detected for "${input}". Suggesting ambient music for a versatile gaming atmosphere.`,
            tracks: this.soundtracks.ambient || [],
            confidence: 40,
            detectedKeywords: [],
            scoringBreakdown: { ambient: 40, fantasy: 30, adventure: 25, scifi: 20, horror: 15 }
        };
    }

    displayGameSuggestions(game) {
        const trackList = document.getElementById('track-list');
        const categoryTitle = document.querySelector('.playlist-section h3');
        
        if (categoryTitle) categoryTitle.textContent = `Recommendations for ${this.currentBoardGame}`;
        
        // Store suggestions for playlist building
        this.currentGameSuggestions = game.suggestedSoundtracks || [];
        
        let html = `<div class="game-suggestions">`;
        
        // Check if this is our enhanced recommendation system
        if (game.suggestedSoundtracks) {
            // Enhanced game data format with movie API integration
            game.suggestedSoundtracks.forEach((suggestion, index) => {
                const isEnhanced = suggestion.apiSource && suggestion.enhanced;
                const enhancedClass = isEnhanced ? 'api-enhanced' : '';
                
                html += `
                    <div class="movie-suggestion enhanced-suggestion ${enhancedClass}" onclick="tabletopTunes.loadMovieSoundtrack('${suggestion.movie}', ${index})">
                        <div class="movie-header">
                            <h4><i class="fas fa-film"></i> ${suggestion.movie}</h4>
                            <p class="suggestion-reason">${suggestion.reason}</p>
                            ${isEnhanced ? `
                                <div class="api-enhancement-badge">
                                    <i class="fas fa-sparkles"></i> Enhanced with API data
                                </div>
                            ` : `
                                <div class="my-games-badge">
                                    <i class="fas fa-user-circle"></i> From My Games
                                </div>
                            `}
                        </div>
                        <div class="suggested-tracks">
                            ${(suggestion.tracks || []).map((track, trackIndex) => `
                                <div class="suggested-track" onclick="event.stopPropagation(); tabletopTunes.playMovieTrack('${suggestion.movie}', '${track}', ${trackIndex})">
                                    <span class="track-name">${track}</span>
                                    <span class="track-source">from ${suggestion.movie}</span>
                                </div>
                            `).join('')}
                        </div>
                        ${isEnhanced && suggestion.enhanced ? `
                            <div class="enhanced-details">
                                <div class="enhanced-info">
                                    <span class="info-label">Composer:</span>
                                    <span class="info-value">${suggestion.enhanced.composer || 'Various Artists'}</span>
                                </div>
                                <div class="enhanced-info">
                                    <span class="info-label">Mood:</span>
                                    <span class="info-value">${suggestion.enhanced.mood || 'Epic and atmospheric'}</span>
                                </div>
                                <div class="enhanced-info">
                                    <span class="info-label">Gameplay Fit:</span>
                                    <span class="info-value">${suggestion.enhanced.gameplayFit || 'Perfect for tabletop gaming'}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            
            // Add additional API suggestions if available
            if (game.additionalSuggestions && game.additionalSuggestions.length > 0) {
                html += `
                    <div class="additional-suggestions">
                        <h4><i class="fas fa-plus-circle"></i> Additional Movie Suggestions</h4>
                        <div class="additional-grid">
                            ${game.additionalSuggestions.map((suggestion, index) => `
                                <div class="additional-movie" onclick="tabletopTunes.loadAdditionalSoundtrack('${suggestion.movie}', ${index})">
                                    <div class="movie-title">${suggestion.movie}</div>
                                    <div class="movie-reason">${suggestion.reason}</div>
                                    <div class="api-source-badge">
                                        <i class="fas fa-database"></i> API Source
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        } else {
            // New enhanced recommendation format
            const result = this.suggestByTheme(this.currentBoardGame);
            if (result) {
                html += `
                    <div class="enhanced-recommendation-card">
                        <div class="recommendation-header">
                            <div class="category-badge ${result.category}">
                                <i class="fas fa-${this.getCategoryIcon(result.category)}"></i>
                                ${result.category.charAt(0).toUpperCase() + result.category.slice(1)}
                            </div>
                            <div class="confidence-score">
                                <span class="confidence-label">Match Confidence</span>
                                <div class="confidence-bar">
                                    <div class="confidence-fill" style="width: ${result.confidence || 0}%"></div>
                                </div>
                                <span class="confidence-value">${result.confidence || 0}%</span>
                            </div>
                        </div>
                        
                        <div class="recommendation-details">
                            <h4>🎵 Recommended Soundtrack Category</h4>
                            <p class="recommendation-reason">${result.reason}</p>
                            
                            ${result.detectedThemes ? `
                                <div class="detected-themes">
                                    <strong>Game Themes:</strong> 
                                    ${result.detectedThemes.map(theme => `<span class="theme-tag">${theme}</span>`).join('')}
                                </div>
                            ` : ''}
                            
                            ${result.detectedKeywords && result.detectedKeywords.length > 0 ? `
                                <div class="detected-keywords">
                                    <strong>Key Elements:</strong> 
                                    ${result.detectedKeywords.slice(0, 5).map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                                </div>
                            ` : ''}
                            
                            <div class="scoring-breakdown">
                                <h5>Decision Analysis:</h5>
                                <div class="score-details">
                                    ${Object.entries(result.scoringBreakdown || {}).map(([category, score]) => `
                                        <div class="score-item ${category === result.category ? 'selected' : ''}">
                                            <span class="score-category">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                            <div class="score-bar-mini">
                                                <div class="score-fill-mini" style="width: ${score}%"></div>
                                            </div>
                                            <span class="score-value">${score}%</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <div class="recommended-tracks">
                            <h5><i class="fas fa-music"></i> Available Tracks (${result.tracks.length})</h5>
                            <div class="tracks-grid">
                                ${result.tracks.map((track, index) => `
                                    <div class="track-card" onclick="tabletopTunes.playTrack(${index}, '${result.category}')">
                                        <div class="track-info">
                                            <span class="track-name">${track.name}</span>
                                            <span class="track-duration">${track.duration}</span>
                                        </div>
                                        <div class="track-meta">
                                            <span class="track-movie">${track.movie || track.description}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        html += `</div>`;
        trackList.innerHTML = html;
    }

    displayBGGGameSuggestions(bggGame) {
        const trackList = document.getElementById('track-list');
        const categoryTitle = document.querySelector('.playlist-section h3');
        
        if (categoryTitle) categoryTitle.textContent = `Recommendations for ${bggGame.name}`;
        
        // Store suggestions for playlist building
        this.currentGameSuggestions = bggGame.suggestedSoundtracks || [];
        
        let html = `<div class="game-suggestions bgg-suggestions">`;
        
        // Check if game is already in My Games
        const isGameInMyGames = this.savedGames[bggGame.name];
        
        // Add "Add to My Games" button if game is not already in collection
        if (!isGameInMyGames) {
            html += `
                <div class="add-to-my-games-section">
                    <button class="add-to-my-games-btn" onclick="tabletopTunes.addGameFromBGG('${bggGame.name}')">
                        <i class="fas fa-plus-circle"></i> Add "${bggGame.name}" to My Games
                    </button>
                    <p class="add-game-hint">Add this game to your collection without needing to play music first!</p>
                </div>
            `;
        } else {
            html += `
                <div class="game-already-added-section">
                    <div class="already-added-badge">
                        <i class="fas fa-check-circle"></i> Already in My Games
                    </div>
                </div>
            `;
        }
        
        // Add BGG game info card
        html += `
            <div class="bgg-game-info">
                <div class="bgg-header">
                    <h3><i class="fas fa-dice"></i> ${bggGame.name}</h3>
                    <div class="bgg-badge">
                        <i class="fas fa-external-link-alt"></i> BoardGameGeek
                    </div>
                </div>
                
                <div class="game-details">
                    ${bggGame.yearPublished ? `<span class="detail-item"><i class="fas fa-calendar"></i> ${bggGame.yearPublished}</span>` : ''}
                    ${bggGame.minPlayers && bggGame.maxPlayers ? `<span class="detail-item"><i class="fas fa-users"></i> ${bggGame.minPlayers}-${bggGame.maxPlayers} players</span>` : ''}
                    ${bggGame.playingTime ? `<span class="detail-item"><i class="fas fa-clock"></i> ${bggGame.playingTime} min</span>` : ''}
                    ${bggGame.rating ? `<span class="detail-item"><i class="fas fa-star"></i> ${bggGame.rating.toFixed(1)}/10</span>` : ''}
                </div>
                
                ${bggGame.description ? `
                    <div class="game-description">
                        <p>${bggGame.description.substring(0, 200)}${bggGame.description.length > 200 ? '...' : ''}</p>
                    </div>
                ` : ''}
                
                <div class="detected-themes">
                    <strong>Detected Themes:</strong> 
                    ${bggGame.themes.map(theme => `<span class="theme-tag bgg-theme">${theme}</span>`).join('')}
                </div>
                
                ${bggGame.categories && bggGame.categories.length > 0 ? `
                    <div class="bgg-categories">
                        <strong>BGG Categories:</strong> 
                        ${bggGame.categories.slice(0, 5).map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add soundtrack suggestions
        if (bggGame.suggestedSoundtracks && bggGame.suggestedSoundtracks.length > 0) {
            bggGame.suggestedSoundtracks.forEach((suggestion, index) => {
                html += `
                    <div class="movie-suggestion bgg-suggestion" onclick="tabletopTunes.loadBGGMovieSoundtrack('${suggestion.movie}', ${index}, '${bggGame.name}')">
                        <div class="movie-header">
                            <h4><i class="fas fa-film"></i> ${suggestion.movie}</h4>
                            <div class="auto-generated-badge">
                                <i class="fas fa-robot"></i> Auto-generated
                            </div>
                        </div>
                        <p class="suggestion-reason">${suggestion.reason}</p>
                        <div class="suggested-tracks">
                            ${(suggestion.tracks || []).map((track, trackIndex) => `
                                <div class="suggested-track" onclick="event.stopPropagation(); tabletopTunes.playBGGMovieTrack('${suggestion.movie}', '${track}', ${trackIndex}, '${bggGame.name}')">
                                    <span class="track-name">${track}</span>
                                    <span class="track-source">from ${suggestion.movie}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
        }
        
        html += `</div>`;
        trackList.innerHTML = html;
        
        this.showNotification(`Found "${bggGame.name}" on BoardGameGeek!`, 'success');
    }

    /**
     * Generate movie-style recommendations from theme analysis
     * @param {Object} result - Theme analysis result
     * @param {string} gameName - Original game name  
     * @returns {Object} Enhanced result with suggestedSoundtracks format
     */
    generateMovieStyleSuggestions(result, gameName) {
        // Map categories to movie recommendations
        const categoryToMovies = {
            fantasy: [
                { movie: 'The Lord of the Rings: The Fellowship of the Ring', reason: 'Epic fantasy adventure with mystical themes', tracks: ['Concerning Hobbits', 'The Bridge of Khazad Dum', 'May It Be'] },
                { movie: 'Harry Potter and the Philosopher\'s Stone', reason: 'Magical world-building and wonder', tracks: ['Hedwig\'s Theme', 'Diagon Alley', 'The Quidditch Match'] },
                { movie: 'The Chronicles of Narnia', reason: 'Fantasy adventure and heroic themes', tracks: ['The Blitz', 'Evacuating London', 'Lucy Meets Mr. Tumnus'] }
            ],
            horror: [
                { movie: 'The Shining', reason: 'Psychological tension and suspense', tracks: ['Main Title', 'Rocky Mountains', 'The Overlook Hotel'] },
                { movie: 'Halloween', reason: 'Classic horror atmosphere', tracks: ['Halloween Theme', 'Laurie\'s Theme', 'The Shape Stalks'] },
                { movie: 'A Quiet Place', reason: 'Tension and survival horror', tracks: ['A Quiet Place', 'The Creatures', 'Escape'] }
            ],
            scifi: [
                { movie: 'Blade Runner 2049', reason: 'Futuristic and atmospheric sci-fi', tracks: ['2049', 'Mesa', 'Flight to LAPD'] },
                { movie: 'Interstellar', reason: 'Space exploration and wonder', tracks: ['Cornfield Chase', 'No Time for Caution', 'Stay'] },
                { movie: 'Tron Legacy', reason: 'Digital world and technology themes', tracks: ['The Grid', 'Derezzed', 'Adagio for TRON'] }
            ],
            adventure: [
                { movie: 'Indiana Jones: Raiders of the Lost Ark', reason: 'Classic adventure and exploration', tracks: ['Raiders March', 'The Map Room', 'Truck Chase'] },
                { movie: 'Pirates of the Caribbean', reason: 'Swashbuckling adventure', tracks: ['He\'s a Pirate', 'The Black Pearl', 'Bootstrap\'s Bootstraps'] },
                { movie: 'The Mummy', reason: 'Adventure with mystery elements', tracks: ['The Mummy', 'Giza Port', 'Night Boarders'] }
            ],
            ambient: [
                { movie: 'Arrival', reason: 'Contemplative and atmospheric', tracks: ['Heptapod B', 'The Nature of Daylight', 'Sapir-Whorf'] },
                { movie: 'Her', reason: 'Emotional and introspective', tracks: ['Her', 'The Moon Song', 'Samantha'] },
                { movie: 'Blade Runner', reason: 'Atmospheric and contemplative sci-fi', tracks: ['Main Titles', 'Blush Response', 'Tears in Rain'] }
            ],
            tavern: [
                { movie: 'The Lord of the Rings: The Fellowship of the Ring', reason: 'Fellowship and gathering themes', tracks: ['Concerning Hobbits', 'A Shortcut to Mushrooms', 'The Old Forest'] },
                { movie: 'Robin Hood: Prince of Thieves', reason: 'Medieval tavern and celebration', tracks: ['Overture', 'Sir Guy of Gisbourne', 'Little John'] },
                { movie: 'Pirates of the Caribbean', reason: 'Tavern songs and maritime adventure', tracks: ['Pirates of the Caribbean', 'The Medallion Calls', 'The Black Pearl'] }
            ]
        };

        // Get category with fallback to ambient
        const category = result.category || 'ambient';
        const movieSuggestions = categoryToMovies[category] || categoryToMovies.ambient;
        
        // Create enhanced result with movie-style format
        const enhancedResult = {
            ...result,
            suggestedSoundtracks: movieSuggestions.map(suggestion => ({
                ...suggestion,
                enhanced: {
                    composer: 'Various Artists',
                    mood: this.getCategoryMood(categoryToMovies[category] ? category : 'ambient'),
                    gameplayFit: `Perfect for ${categoryToMovies[category] ? category : 'ambient'} themed board games`
                },
                apiSource: false, // Mark as generated, not from API
                themeGenerated: true // Mark as theme-based generation
            }))
        };

        return enhancedResult;
    }

    /**
     * Get mood description for category
     * @param {string} category - Soundtrack category
     * @returns {string} Mood description
     */
    getCategoryMood(category) {
        const moods = {
            fantasy: 'Epic and mystical',
            horror: 'Dark and suspenseful', 
            scifi: 'Futuristic and atmospheric',
            adventure: 'Exciting and heroic',
            ambient: 'Peaceful and contemplative',
            tavern: 'Jovial and social'
        };
        return moods[category] || 'Atmospheric';
    }

    displayThemeBasedSuggestions(result, gameName) {
        const trackList = document.getElementById('track-list');
        const categoryTitle = document.querySelector('.playlist-section h3');
        
        if (categoryTitle) categoryTitle.textContent = `Recommendations for ${gameName}`;
        
        // Add null safety checks
        if (!result) {
            trackList.innerHTML = '<p class="error-message">Unable to generate theme-based suggestions</p>';
            return;
        }
        
        // Generate movie-style suggestions from theme analysis
        const enhancedResult = this.generateMovieStyleSuggestions(result, gameName);
        
        // Store suggestions for playlist building
        this.currentGameSuggestions = enhancedResult.suggestedSoundtracks || [];
        
        let html = `<div class="game-suggestions">`;
        
        // Check if game is already in My Games
        const isGameInMyGames = this.savedGames[gameName];
        
        // Add theme analysis info at the top (similar to what we had before but more compact)
        html += `
            <div class="theme-analysis-header">
                <div class="analysis-info">
                    <span class="analysis-badge">
                        <i class="fas fa-lightbulb"></i> Theme Analysis
                    </span>
                    <span class="confidence-score">
                        ${enhancedResult.confidence || 50}% Match
                    </span>
                </div>
                ${enhancedResult.detectedKeywords && enhancedResult.detectedKeywords.length > 0 ? `
                    <div class="detected-keywords">
                        <strong>Detected Keywords:</strong> 
                        ${enhancedResult.detectedKeywords.slice(0, 3).map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add "Add to My Games" button if game is not already in collection
        if (!isGameInMyGames) {
            html += `
                <div class="add-to-my-games-section">
                    <button class="add-to-my-games-btn" onclick="tabletopTunes.addGameFromThemeAnalysis('${gameName}', '${result.category}')">
                        <i class="fas fa-plus-circle"></i> Add "${gameName}" to My Games
                    </button>
                    <p class="add-game-hint">Add this game to your collection without needing to play music first!</p>
                </div>
            `;
        } else {
            html += `
                <div class="game-already-added-section">
                    <div class="already-added-badge">
                        <i class="fas fa-check-circle"></i> Already in My Games
                    </div>
                </div>
            `;
        }
        
        // Display movie suggestions using the same format as displayGameSuggestions
        if (enhancedResult.suggestedSoundtracks) {
            enhancedResult.suggestedSoundtracks.forEach((suggestion, index) => {
                const isThemeGenerated = suggestion.themeGenerated;
                const enhancedClass = isThemeGenerated ? 'theme-generated' : '';
                
                html += `
                    <div class="movie-suggestion enhanced-suggestion ${enhancedClass}" onclick="tabletopTunes.loadMovieSoundtrack('${suggestion.movie}', ${index})">
                        <div class="movie-header">
                            <h4><i class="fas fa-film"></i> ${suggestion.movie}</h4>
                            <p class="suggestion-reason">${suggestion.reason}</p>
                            ${isThemeGenerated ? `
                                <div class="theme-generation-badge">
                                    <i class="fas fa-magic"></i> Theme-Based Suggestion
                                </div>
                            ` : ''}
                        </div>
                        <div class="suggested-tracks">
                            ${(suggestion.tracks || []).map((track, trackIndex) => `
                                <div class="suggested-track" onclick="event.stopPropagation(); tabletopTunes.playMovieTrack('${suggestion.movie}', '${track}', ${trackIndex})">
                                    <span class="track-name">${track}</span>
                                    <span class="track-source">from ${suggestion.movie}</span>
                                </div>
                            `).join('')}
                        </div>
                        ${suggestion.enhanced ? `
                            <div class="enhanced-details">
                                <div class="enhanced-info">
                                    <span class="info-label">Composer:</span>
                                    <span class="info-value">${suggestion.enhanced.composer || 'Various Artists'}</span>
                                </div>
                                <div class="enhanced-info">
                                    <span class="info-label">Mood:</span>
                                    <span class="info-value">${suggestion.enhanced.mood || 'Atmospheric'}</span>
                                </div>
                                <div class="enhanced-info">
                                    <span class="info-label">Gameplay Fit:</span>
                                    <span class="info-value">${suggestion.enhanced.gameplayFit || 'Perfect for tabletop gaming'}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        }
        
        html += `</div>`;
        trackList.innerHTML = html;
        
        this.showNotification(`Movie soundtrack suggestions generated for "${gameName}"!`, 'success');
    }

    getCategoryIcon(category) {
        const icons = {
            fantasy: 'dragon',
            horror: 'ghost',
            scifi: 'rocket',
            adventure: 'compass',
            ambient: 'leaf'
        };
        return icons[category] || 'music';
    }

    loadMovieSoundtrack(movieName, suggestionIndex) {
        // In a real app, this would load actual movie soundtrack files
        this.showNotification(`Loading ${movieName} soundtrack...`);
        
        // Create a playlist from the movie suggestion
        if (this.currentBoardGame) {
            // Try to get game data from My Games or current display
            const gameData = this.findGameInMyGames(this.currentBoardGame);
            let suggestion = null;
            
            // Look for the suggestion in various possible sources
            if (gameData && gameData.bggData && gameData.bggData.suggestedSoundtracks) {
                suggestion = gameData.bggData.suggestedSoundtracks[suggestionIndex];
            } else if (this.currentGameSuggestions && this.currentGameSuggestions[suggestionIndex]) {
                suggestion = this.currentGameSuggestions[suggestionIndex];
            }
            
            if (suggestion && suggestion.tracks) {
                // Convert movie tracks to our format
                this.currentPlaylist = suggestion.tracks.map((trackName, index) => ({
                    name: trackName,
                    duration: `9:99`,
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
    }

    playMovieTrack(movieName, trackName, trackIndex) {
        this.showNotification(`Playing "${trackName}" from ${movieName}`);
        
        // Save pending game data when music is actually played
        this.savePendingGameToCloset();
        
        // Create a single track playlist
        this.currentPlaylist = [{
            name: trackName,
            duration: `9:99`,
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

    loadBGGMovieSoundtrack(movieName, suggestionIndex, gameName) {
        // Load BGG movie soundtrack similar to regular movie soundtrack
        this.showNotification(`Loading ${movieName} soundtrack...`);
        
        // Save pending game data when music is actually played
        this.savePendingGameToCloset();
        
        // Get the BGG game data from the current search
        if (this.currentBoardGame) {
            // For now, create a generic playlist since we don't have stored BGG games
            // In a full implementation, you might cache the BGG game data
            const genericTracks = [
                'Main Theme', 'Opening Credits', 'The Journey Begins', 
                'Rising Action', 'Conflict', 'Resolution', 'End Credits'
            ];
            
            this.currentPlaylist = genericTracks.map((trackName, index) => ({
                name: trackName,
                duration: `9:99`,
                url: "#",
                description: `From ${movieName} (BGG suggestion for ${gameName})`,
                movie: movieName,
                source: 'bgg'
            }));
            
            this.currentTrackIndex = 0;
            this.currentCategory = 'movie';
            this.displayPlaylist();
            this.updateCurrentTrackInfo();
        }
    }

    playBGGMovieTrack(movieName, trackName, trackIndex, gameName) {
        this.showNotification(`Playing "${trackName}" from ${movieName}`);
        
        // Create a single track playlist for BGG suggestions
        this.currentPlaylist = [{
            name: trackName,
            duration: `9:99`,
            url: "#",
            description: `From ${movieName} (BGG suggestion for ${gameName})`,
            movie: movieName,
            source: 'bgg'
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
    
    // Initialize Quick Actions and Enhanced Features
    initializeQuickActions() {
        // Quick random soundtrack button
        const quickRandomBtn = document.getElementById('quick-random-btn');
        if (quickRandomBtn) {
            quickRandomBtn.addEventListener('click', () => this.getRandomSurprise());
        }
        
        // Enhanced volume display
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volumeDisplay = document.getElementById('volume-display');
                volumeDisplay.textContent = `${e.target.value}%`;
                volumeSlider.title = `Volume: ${e.target.value}%`;
            });
        }
        
        // Clear playlist button
        const clearPlaylistBtn = document.getElementById('clear-playlist-btn');
        if (clearPlaylistBtn) {
            clearPlaylistBtn.addEventListener('click', () => this.clearCurrentPlaylist());
        }
    }
    
    // Quick start functionality for different moods
    quickStart(category) {
        this.showNotification(`🎵 Starting ${category} soundtrack experience!`);
        this.loadCategory(category);
        
        // Auto-start playing if tracks are available
        setTimeout(() => {
            if (this.currentPlaylist.length > 0) {
                this.play();
            }
        }, 500);
        
        // Update status
        this.updatePlaybackStatus(`Playing ${category} soundtrack collection`);
    }
    
    // Random surprise functionality
    getRandomSurprise() {
        const categories = ['ambient', 'fantasy', 'scifi', 'horror', 'adventure', 'tavern'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        this.showNotification(`🎲 Surprise! Preparing ${randomCategory} soundtrack...`);
        this.quickStart(randomCategory);
        
        // Shuffle the playlist for more variety
        setTimeout(() => {
            this.toggleShuffle();
        }, 1000);
    }
    
    // Create custom playlist functionality
    createCustomPlaylist() {
        this.showNotification('🎨 Creating custom mixed playlist...');
        
        // Mix tracks from different categories
        const categories = ['ambient', 'fantasy', 'scifi', 'horror', 'adventure', 'tavern'];
        let mixedPlaylist = [];
        
        categories.forEach(category => {
            if (this.soundtracks[category]) {
                // Add 1-2 tracks from each category
                const tracksToAdd = this.soundtracks[category].slice(0, 2);
                mixedPlaylist = mixedPlaylist.concat(tracksToAdd);
            }
        });
        
        // Shuffle the mixed playlist
        for (let i = mixedPlaylist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mixedPlaylist[i], mixedPlaylist[j]] = [mixedPlaylist[j], mixedPlaylist[i]];
        }
        
        this.currentPlaylist = mixedPlaylist;
        this.currentTrackIndex = 0;
        this.currentCategory = 'custom-mix';
        this.displayPlaylist();
        this.updateCurrentTrackInfo();
        const playlistTitle = document.querySelector('.playlist-section h3');
        if (playlistTitle) playlistTitle.textContent = 'Custom Mixed Playlist';
        
        this.updatePlaybackStatus('Custom mixed playlist ready - perfect variety for any game!');
    }
    
    // Enhanced playback status updates
    updatePlaybackStatus(message) {
        const statusElement = document.getElementById('playback-status');
        if (statusElement) {
            statusElement.querySelector('span').textContent = message;
            
            // Add visual feedback
            statusElement.style.opacity = '0.7';
            setTimeout(() => {
                statusElement.style.opacity = '1';
            }, 200);
        }
    }
    
    // Enhanced track info display - override the existing method
    updateCurrentTrackInfo() {
        const currentTrackElement = document.getElementById('current-track');
        const currentCategoryElement = document.getElementById('current-category');
        const trackMovieElement = document.getElementById('track-movie');
        const trackDescriptionElement = document.getElementById('track-description');
        
        if (this.currentPlaylist.length > 0 && this.currentTrackIndex < this.currentPlaylist.length) {
            const track = this.currentPlaylist[this.currentTrackIndex];
            currentTrackElement.textContent = track.name;
            // Show game context when playing for a specific game
            if (this.currentBoardGame) {
                currentCategoryElement.textContent = `Playing for ${this.currentBoardGame} • Track ${this.currentTrackIndex + 1} of ${this.currentPlaylist.length}`;
            } else {
                currentCategoryElement.textContent = `Track ${this.currentTrackIndex + 1} of ${this.currentPlaylist.length}`;
            }
            
            if (trackMovieElement) {
                trackMovieElement.textContent = track.movie || '';
                trackMovieElement.style.display = track.movie ? 'inline' : 'none';
            }
            
            if (trackDescriptionElement) {
                trackDescriptionElement.textContent = track.description || '';
                trackDescriptionElement.style.display = track.description ? 'inline' : 'none';
            }
            
            document.getElementById('duration').textContent = track.duration || '9:99';
            
            this.updatePlaybackStatus(`Now playing: ${track.name} from ${track.movie}`);
        } else {
            currentTrackElement.textContent = 'No track selected';
            currentCategoryElement.textContent = this.currentBoardGame ? 
                `Ready to play for ${this.currentBoardGame} - Select a soundtrack category` : 
                'Select a soundtrack category';
            
            if (trackMovieElement) trackMovieElement.style.display = 'none';
            if (trackDescriptionElement) trackDescriptionElement.style.display = 'none';
            
            document.getElementById('duration').textContent = '0:00';
            this.updatePlaybackStatus('Ready to play your perfect soundtrack');
        }
        
        // Update game session indicator
        this.updateGameSessionIndicator();
    }
    
    /**
     * Load additional movie soundtrack from API suggestions
     * @param {string} movieTitle - Movie title
     * @param {number} index - Index in suggestions array
     */
    loadAdditionalSoundtrack(movieTitle, index) {
        console.log(`Loading additional soundtrack: ${movieTitle}`);
        
        // Create mock tracks for the movie
        const mockTracks = [
            { name: 'Main Theme', duration: '4:23', url: '#', description: `Main theme from ${movieTitle}`, movie: movieTitle },
            { name: 'Atmospheric Soundscape', duration: '6:45', url: '#', description: `Ambient track from ${movieTitle}`, movie: movieTitle },
            { name: 'Action Sequence', duration: '3:12', url: '#', description: `Exciting track from ${movieTitle}`, movie: movieTitle }
        ];
        
        // Update current playlist
        this.currentPlaylist = mockTracks;
        this.currentTrackIndex = 0;
        this.currentCategory = 'api-enhanced';
        this.matchingMode = 'api-movie';
        
        // Update display
        this.updateDisplay();
        this.showNotification(`Loaded ${movieTitle} soundtrack from API!`, 'success');
    }
    
    /**
     * Play a specific track from a movie soundtrack
     * @param {string} movieTitle - Movie title
     * @param {string} trackName - Track name
     * @param {number} trackIndex - Track index
     */
    playMovieTrack(movieTitle, trackName, trackIndex) {
        console.log(`Playing track: ${trackName} from ${movieTitle}`);
        
        // Save pending game data when music is actually played
        this.savePendingGameToCloset();
        
        // Set playing state and track start time
        this.isPlaying = true;
        this.trackStartTime = Date.now();
        
        // For demo purposes, just show notification
        // In production, this would play the actual track
        this.showNotification(`Now playing: ${trackName} from ${movieTitle}`, 'info');
        
        // Update current track display in player section
        const currentTrackElement = document.getElementById('current-track');
        const currentCategoryElement = document.getElementById('current-category');
        
        if (currentTrackElement) {
            currentTrackElement.textContent = trackName;
        }
        if (currentCategoryElement) {
            currentCategoryElement.textContent = `From ${movieTitle}`;
        }
        
        // Update selected game area with current song
        this.updateCurrentSongDisplay(trackName, movieTitle);
        
        // Update upcoming queue (using current playlist)
        this.updateUpcomingQueue(this.currentPlaylist, trackIndex);
        
        // Show player section if hidden
        const playerSection = document.getElementById('player-section');
        if (playerSection && playerSection.style.display === 'none') {
            playerSection.style.display = 'block';
        }
        
        // Add playing class for visual feedback
        const selectedGameArea = document.getElementById('selected-game-area');
        if (selectedGameArea) {
            selectedGameArea.classList.add('playing');
        }
        
        if (playerSection) {
            playerSection.classList.add('playing');
        }
    }

    // ===============================================
    // 🎮 Selected Game Area Management
    // ===============================================

    /**
     * Show and populate the selected game area
     * @param {Object} gameData - Game data object
     */
    showSelectedGameArea(gameData) {
        const selectedGameArea = document.getElementById('selected-game-area');
        if (!selectedGameArea) return;

        // Show the area
        selectedGameArea.style.display = 'block';
        
        // Populate game information
        this.populateGameDisplay(gameData);
        
        // Initialize music context (empty state)
        this.resetMusicContext();
        
        // Add animation effect
        selectedGameArea.classList.add('game-selected');
        setTimeout(() => selectedGameArea.classList.remove('game-selected'), 500);
        
        // Trigger game selection visual effects
        this.triggerGameSelectionEffect(gameData);
    }

    /**
     * Populate the game display section
     * @param {Object} gameData - Game data object
     */
    populateGameDisplay(gameData) {
        const gameImage = document.getElementById('selected-game-image');
        const gameTitle = document.getElementById('selected-game-title');
        const gameDescription = document.getElementById('selected-game-description');
        const gameTheme = document.getElementById('selected-game-theme');
        const gamePlayers = document.getElementById('selected-game-players');

        if (gameTitle) {
            gameTitle.textContent = gameData.name || 'Unknown Game';
        }

        if (gameDescription) {
            let description = 'Board game with curated soundtrack suggestions';
            if (gameData.bggData?.description) {
                // Truncate long descriptions
                description = this.truncateText(gameData.bggData.description, 120);
            } else if (gameData.detectedCategory) {
                description = `${gameData.detectedCategory.charAt(0).toUpperCase() + gameData.detectedCategory.slice(1)} themed board game`;
            }
            gameDescription.textContent = description;
        }

        if (gameImage) {
            // Use a placeholder game image - in production, this would come from BGG API
            gameImage.src = gameData.bggData?.image || `https://via.placeholder.com/120x120/4ecdc4/ffffff?text=${encodeURIComponent(gameData.name?.charAt(0) || 'G')}`;
            gameImage.alt = `${gameData.name || 'Game'} cover`;
        }

        if (gameTheme && gameData.detectedCategory) {
            gameTheme.textContent = gameData.detectedCategory;
            gameTheme.style.display = 'inline-block';
        }

        if (gamePlayers && gameData.bggData) {
            const minPlayers = gameData.bggData.minPlayers;
            const maxPlayers = gameData.bggData.maxPlayers;
            if (minPlayers && maxPlayers) {
                gamePlayers.textContent = minPlayers === maxPlayers ? `${minPlayers} players` : `${minPlayers}-${maxPlayers} players`;
                gamePlayers.style.display = 'inline-block';
            }
        }
    }

    /**
     * Update the current song display in the selected game area
     * @param {string} songTitle - Song title
     * @param {string} movieTitle - Movie title
     * @param {Object} options - Additional options
     */
    updateCurrentSongDisplay(songTitle, movieTitle, options = {}) {
        const songImage = document.getElementById('current-song-image');
        const songTitleEl = document.getElementById('current-song-title');
        const songMovie = document.getElementById('current-song-movie');
        const currentSongDisplay = document.querySelector('.current-song-display');

        if (songTitleEl) {
            songTitleEl.textContent = songTitle || 'No song playing';
        }

        if (songMovie) {
            songMovie.textContent = movieTitle || 'Select a soundtrack';
        }

        if (songImage) {
            // Use a placeholder movie poster - in production, this would come from movie API
            songImage.src = options.movieImage || `https://via.placeholder.com/80x120/6c5ce7/ffffff?text=${encodeURIComponent(movieTitle?.charAt(0) || 'M')}`;
            songImage.alt = `${movieTitle || 'Movie'} poster`;
        }

        if (currentSongDisplay) {
            if (songTitle && movieTitle) {
                currentSongDisplay.classList.add('playing');
            } else {
                currentSongDisplay.classList.remove('playing');
            }
        }

        // Show the selected game area if it's not visible
        this.ensureSelectedGameAreaVisible();
    }

    /**
     * Update the upcoming songs queue
     * @param {Array} playlist - Array of upcoming songs
     * @param {number} currentIndex - Current song index
     */
    updateUpcomingQueue(playlist = [], currentIndex = 0) {
        const queueList = document.getElementById('upcoming-songs');
        if (!queueList) return;

        // Clear existing queue
        queueList.innerHTML = '';

        // Get next 3-5 songs
        const upcomingSongs = playlist.slice(currentIndex + 1, currentIndex + 4);

        if (upcomingSongs.length === 0) {
            // Show placeholder
            queueList.innerHTML = `
                <div class="queue-item placeholder">
                    <span class="queue-song">No upcoming songs</span>
                    <span class="queue-movie"></span>
                </div>
            `;
            return;
        }

        // Populate queue
        upcomingSongs.forEach((song, index) => {
            const queueItem = document.createElement('div');
            queueItem.className = 'queue-item';
            queueItem.innerHTML = `
                <span class="queue-song">${song.name}</span>
                <span class="queue-movie">${song.movie || 'Unknown'}</span>
            `;
            
            // Add click handler to jump to song
            queueItem.addEventListener('click', () => {
                this.jumpToTrack(currentIndex + 1 + index);
            });
            
            queueList.appendChild(queueItem);
        });
    }

    /**
     * Reset music context to empty state
     */
    resetMusicContext() {
        this.updateCurrentSongDisplay('', '');
        this.updateUpcomingQueue([]);
        this.updateMiniProgress(0);
    }

    /**
     * Update the mini progress bar
     * @param {number} percentage - Progress percentage (0-100)
     */
    updateMiniProgress(percentage) {
        const progressFill = document.getElementById('mini-progress');
        const currentTime = document.getElementById('current-time-mini');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (currentTime) {
            // This would be updated with actual time in production
            currentTime.textContent = '0:00';
        }
    }

    /**
     * Ensure the selected game area is visible
     */
    ensureSelectedGameAreaVisible() {
        const selectedGameArea = document.getElementById('selected-game-area');
        if (selectedGameArea && selectedGameArea.style.display === 'none') {
            selectedGameArea.style.display = 'block';
        }
    }

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    /**
     * Jump to a specific track in the playlist
     * @param {number} trackIndex - Track index to jump to
     */
    jumpToTrack(trackIndex) {
        if (trackIndex >= 0 && trackIndex < this.currentPlaylist.length) {
            this.currentTrackIndex = trackIndex;
            const track = this.currentPlaylist[trackIndex];
            if (track) {
                this.playMovieTrack(track.movie, track.name, trackIndex);
                this.updateUpcomingQueue(this.currentPlaylist, trackIndex);
            }
        }
    }

    // ===============================================
    // 🎮 Dynamic Visualizations System
    // ===============================================

    initializeDynamicVisualizations() {
        // Initialize visualization tabs
        const vizTabBtns = document.querySelectorAll('.viz-tab-btn');
        vizTabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchVisualizationTab(btn.dataset.viz));
        });

        // Initialize landscape controls
        const generateLandscapeBtn = document.getElementById('generate-landscape');
        if (generateLandscapeBtn) {
            generateLandscapeBtn.addEventListener('click', () => this.generateLandscape());
        }

        // Initialize meeple controls
        const startParadeBtn = document.getElementById('start-parade');
        if (startParadeBtn) {
            startParadeBtn.addEventListener('click', () => this.startMeepleParade());
        }

        // Initialize dice controls
        const rollDiceBtn = document.getElementById('roll-dice');
        const addDiceBtn = document.getElementById('add-dice');
        if (rollDiceBtn) rollDiceBtn.addEventListener('click', () => this.rollDice());
        if (addDiceBtn) addDiceBtn.addEventListener('click', () => this.addDice());

        // Initialize tableau controls
        const shufflePiecesBtn = document.getElementById('shuffle-pieces');
        const generateCardsBtn = document.getElementById('generate-cards');
        if (shufflePiecesBtn) shufflePiecesBtn.addEventListener('click', () => this.shuffleGamePieces());
        if (generateCardsBtn) generateCardsBtn.addEventListener('click', () => this.generateGameCards());

        // Initialize projection controls
        const projectTvBtn = document.getElementById('project-to-tv');
        const openDisplayBtn = document.getElementById('open-display-mode');
        const enableVoiceBtn = document.getElementById('enable-voice');
        const connectSpotifyBtn = document.getElementById('connect-spotify-mini');
        
        if (projectTvBtn) projectTvBtn.addEventListener('click', () => this.projectToTV());
        if (openDisplayBtn) openDisplayBtn.addEventListener('click', () => this.openDisplayMode());
        if (enableVoiceBtn) enableVoiceBtn.addEventListener('click', () => this.enableVoiceControl());
        if (connectSpotifyBtn) connectSpotifyBtn.addEventListener('click', () => this.connectSpotifyMini());

        // Start with initial visualizations
        this.generateLandscape();
        this.initializeDiceContainer();
        this.initializeGamePieces();
        
        // Initialize dynamic feedback system
        this.initializeDynamicFeedbackSystem();
    }

    // ===============================================
    // 🎵 Dynamic Visual Feedback System
    // ===============================================

    /**
     * Initialize the dynamic visual feedback system
     */
    initializeDynamicFeedbackSystem() {
        // Initialize music-reactive elements
        this.musicReactiveElements = [];
        this.gameThemeColors = {
            fantasy: { primary: '#8833ff', secondary: '#ff6b35', accent: '#00ff88' },
            scifi: { primary: '#00bfff', secondary: '#ff1493', accent: '#32cd32' },
            horror: { primary: '#ff0000', secondary: '#8b0000', accent: '#800080' },
            ambient: { primary: '#4ecdc4', secondary: '#95e1d3', accent: '#fce38a' },
            adventure: { primary: '#ff6b35', secondary: '#f7931e', accent: '#ffd700' },
            tavern: { primary: '#8b4513', secondary: '#daa520', accent: '#ff8c00' }
        };

        // Create audio context for music analysis
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.timeDataArray = new Uint8Array(this.analyser.fftSize);
            
            // Beat detection variables
            this.beatHistory = [];
            this.beatThreshold = 1.3;
            this.beatCutoff = 0;
            this.beatTime = 0;
            
            console.log('Web Audio API initialized successfully');
        } catch (e) {
            console.log('Web Audio API not supported, using simulation');
            this.useAudioSimulation = true;
        }
        
        // Start the dynamic feedback loop
        this.startDynamicFeedbackLoop();
    }

    /**
     * Start the dynamic feedback animation loop
     */
    startDynamicFeedbackLoop() {
        const animate = () => {
            this.updateMusicReactiveVisualizations();
            this.updateGameThemeVisualizations();
            this.updateProgressAnimations();
            requestAnimationFrame(animate);
        };
        animate();
    }

    /**
     * Add music-reactive visualizations based on current playback
     */
    updateMusicReactiveVisualizations() {
        if (!this.isPlaying || !this.currentPlaylist.length) return;

        // Get audio analysis data (real or simulated)
        const audioData = this.useAudioSimulation ? this.simulateAudioData() : this.getAudioData();
        
        // Update landscape elements with music reactivity
        this.updateMusicReactiveLandscape(audioData);
        
        // Update dice with beat-based rolling
        this.updateMusicReactiveDice(audioData);
        
        // Update meeples with rhythm-based movement
        this.updateMusicReactiveMeeples(audioData);
        
        // Update game pieces with color pulsing
        this.updateMusicReactiveGamePieces(audioData);

        // Sync with display window if open
        if (this.displayWindow && !this.displayWindow.closed) {
            try {
                this.displayWindow.postMessage({
                    type: 'audioData',
                    data: audioData,
                    isPlaying: this.isPlaying,
                    currentTrack: this.currentPlaylist[this.currentTrackIndex]
                }, '*');
            } catch (e) {
                // Display window might be from different origin
            }
        }
    }

    /**
     * Get real audio analysis data from Web Audio API
     */
    getAudioData() {
        if (!this.analyser || !this.dataArray) {
            return this.simulateAudioData();
        }

        this.analyser.getByteFrequencyData(this.dataArray);
        this.analyser.getByteTimeDomainData(this.timeDataArray);

        // Calculate frequency band averages
        const bass = this.getFrequencyAverage(0, 10);
        const mid = this.getFrequencyAverage(10, 50);
        const treble = this.getFrequencyAverage(50, this.bufferLength);
        const overall = this.getFrequencyAverage(0, this.bufferLength);

        // Beat detection
        const beat = this.detectBeat(overall);

        return {
            volume: overall / 255,
            bass: bass / 255,
            mid: mid / 255,
            treble: treble / 255,
            beat: beat ? 1 : 0,
            rawData: Array.from(this.dataArray)
        };
    }

    /**
     * Get average frequency value for a range
     */
    getFrequencyAverage(startIndex, endIndex) {
        let sum = 0;
        const count = endIndex - startIndex;
        
        for (let i = startIndex; i < endIndex; i++) {
            sum += this.dataArray[i];
        }
        
        return sum / count;
    }

    /**
     * Detect beats in the audio
     */
    detectBeat(currentLevel) {
        const now = Date.now();
        
        // Add current level to history
        this.beatHistory.push({ level: currentLevel, time: now });
        
        // Keep only recent history (last 500ms)
        this.beatHistory = this.beatHistory.filter(entry => now - entry.time < 500);
        
        if (this.beatHistory.length < 10) return false;
        
        // Calculate average level
        const avgLevel = this.beatHistory.reduce((sum, entry) => sum + entry.level, 0) / this.beatHistory.length;
        
        // Beat detected if current level is significantly above average and enough time has passed
        const isBeat = currentLevel > avgLevel * this.beatThreshold && now - this.beatTime > 300;
        
        if (isBeat) {
            this.beatTime = now;
        }
        
        return isBeat;
    }

    /**
     * Simulate audio analysis data for demo purposes
     * In production, this would use Web Audio API
     */
    simulateAudioData() {
        const time = Date.now() / 1000;
        return {
            volume: 0.3 + 0.7 * Math.sin(time * 2) * Math.sin(time * 0.7),
            bass: 0.2 + 0.8 * Math.sin(time * 1.5),
            mid: 0.3 + 0.7 * Math.sin(time * 2.2),
            treble: 0.4 + 0.6 * Math.sin(time * 3.1),
            beat: Math.sin(time * 2.5) > 0.8 ? 1 : 0
        };
    }

    /**
     * Update landscape elements to react to music
     */
    updateMusicReactiveLandscape(audioData) {
        const canvas = document.getElementById('landscape-canvas');
        if (!canvas) return;

        const elements = canvas.querySelectorAll('div[style*="position: absolute"]');
        elements.forEach((element, index) => {
            const reactivity = (audioData.volume + audioData.mid) / 2;
            const scale = 1 + reactivity * 0.3;
            const rotation = audioData.treble * 10 * Math.sin(Date.now() / 1000 + index);
            
            element.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            
            if (audioData.beat > 0) {
                element.style.filter = `brightness(${1 + reactivity}) hue-rotate(${audioData.bass * 30}deg)`;
            }
        });
    }

    /**
     * Update dice to react to music beats
     */
    updateMusicReactiveDice(audioData) {
        const diceContainer = document.getElementById('dice-container');
        if (!diceContainer) return;

        const dice = diceContainer.querySelectorAll('.dice');
        dice.forEach((die, index) => {
            if (audioData.beat > 0) {
                // Trigger a mini-roll on beat
                const randomRotation = Math.random() * 360;
                die.style.transform = `rotate(${randomRotation}deg) scale(${1 + audioData.volume * 0.2})`;
                die.style.borderColor = this.getGameThemeColor('accent');
            }
            
            // Subtle continuous animation
            const pulse = 1 + audioData.mid * 0.1;
            die.style.boxShadow = `0 0 ${audioData.bass * 20}px ${this.getGameThemeColor('primary')}`;
        });
    }

    /**
     * Update meeples to dance with the rhythm
     */
    updateMusicReactiveMeeples(audioData) {
        const meepleStage = document.getElementById('meeple-stage');
        if (!meepleStage) return;

        const meeples = meepleStage.querySelectorAll('.meeple');
        meeples.forEach((meeple, index) => {
            const danceIntensity = audioData.volume + audioData.mid;
            const bounceHeight = danceIntensity * 10;
            const wiggle = Math.sin(Date.now() / 200 + index) * danceIntensity * 5;
            
            meeple.style.transform = `translateY(-${bounceHeight}px) rotate(${wiggle}deg)`;
            
            if (audioData.beat > 0) {
                meeple.style.color = this.getGameThemeColor('secondary');
                setTimeout(() => {
                    meeple.style.color = this.getGameThemeColor('primary');
                }, 100);
            }
        });
    }

    /**
     * Update game pieces to pulse with music
     */
    updateMusicReactiveGamePieces(audioData) {
        const gamePieces = document.querySelectorAll('.game-piece');
        gamePieces.forEach((piece, index) => {
            const pulseIntensity = (audioData.volume + audioData.treble) / 2;
            const scale = 1 + pulseIntensity * 0.15;
            const hueShift = audioData.bass * 60;
            
            piece.style.transform = `scale(${scale})`;
            piece.style.filter = `saturate(${1 + pulseIntensity}) hue-rotate(${hueShift}deg)`;
            
            if (audioData.beat > 0) {
                piece.style.boxShadow = `0 0 ${20 + audioData.volume * 30}px ${this.getGameThemeColor('accent')}`;
            }
        });
    }

    /**
     * Enhanced game-specific visual feedback
     */
    updateGameSpecificVisualizations() {
        if (!this.currentBoardGame) return;

        const gameTheme = this.getCurrentGameTheme();
        const selectedGameArea = document.getElementById('selected-game-area');
        
        if (selectedGameArea) {
            // Add theme-specific animations to the selected game area
            this.addGameThemeAnimations(selectedGameArea, gameTheme);
        }

        // Update background effects based on game theme
        this.updateGameThemeBackground(gameTheme);
        
        // Add theme-specific particle effects
        this.updateGameThemeParticles(gameTheme);
    }

    /**
     * Add theme-specific animations to game areas
     */
    addGameThemeAnimations(element, theme) {
        const time = Date.now() / 1000;
        
        switch (theme) {
            case 'fantasy':
                // Magical sparkle effect
                this.addMagicalSparkles(element);
                element.style.background = `linear-gradient(45deg, 
                    rgba(136, 51, 255, 0.1) ${Math.sin(time) * 50 + 50}%, 
                    rgba(255, 107, 53, 0.1) ${Math.cos(time * 1.2) * 50 + 50}%)`;
                break;
            case 'horror':
                // Eerie shadow effects
                element.style.boxShadow = `inset 0 0 ${20 + Math.sin(time * 2) * 10}px rgba(255, 0, 0, 0.3)`;
                element.style.filter = `contrast(${1.1 + Math.sin(time) * 0.1})`;
                break;
            case 'scifi':
                // Pulsing tech grid
                element.style.background = `linear-gradient(90deg, 
                    rgba(0, 191, 255, 0.1) 0%, 
                    rgba(255, 20, 147, 0.1) ${Math.sin(time * 0.5) * 50 + 50}%, 
                    rgba(50, 205, 50, 0.1) 100%)`;
                break;
            case 'adventure':
                // Dynamic gradient movement
                element.style.background = `linear-gradient(${time * 10}deg, 
                    rgba(255, 107, 53, 0.1), 
                    rgba(247, 147, 30, 0.1), 
                    rgba(255, 215, 0, 0.1))`;
                break;
        }
    }

    /**
     * Update background theme effects
     */
    updateGameThemeBackground(theme) {
        const body = document.body;
        const themeColors = this.gameThemeColors[theme] || this.gameThemeColors.ambient;
        
        // Subtle animated background gradient
        const time = Date.now() / 3000;
        body.style.background = `linear-gradient(${time * 5}deg, 
            ${themeColors.primary}05, 
            ${themeColors.secondary}05, 
            ${themeColors.accent}05)`;
    }

    /**
     * Add magical sparkle particles for fantasy games
     */
    addMagicalSparkles(container) {
        if (container.querySelectorAll('.magic-sparkle').length > 5) return;
        
        const sparkle = document.createElement('div');
        sparkle.className = 'magic-sparkle';
        sparkle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, #fff, transparent);
            border-radius: 50%;
            pointer-events: none;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: sparkle 2s ease-out forwards;
        `;
        
        container.appendChild(sparkle);
        
        // Remove sparkle after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 2000);
    }

    /**
     * Add floating particles based on game theme
     */
    updateGameThemeParticles(theme) {
        const particleContainer = document.getElementById('game-particles') || this.createParticleContainer();
        
        // Limit particle count
        if (particleContainer.children.length > 10) return;
        
        const particle = this.createThemeParticle(theme);
        particleContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 5000);
    }

    /**
     * Create particle container if it doesn't exist
     */
    createParticleContainer() {
        const container = document.createElement('div');
        container.id = 'game-particles';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        document.body.appendChild(container);
        return container;
    }

    /**
     * Create theme-specific particle
     */
    createThemeParticle(theme) {
        const particle = document.createElement('div');
        const size = Math.random() * 6 + 2;
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 20;
        
        let particleStyle = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${startX}px;
            top: ${startY}px;
            pointer-events: none;
        `;
        
        switch (theme) {
            case 'fantasy':
                particleStyle += `
                    background: radial-gradient(circle, #8833ff, #ff6b35);
                    border-radius: 50%;
                    animation: float-up-sparkle 5s linear forwards;
                `;
                break;
            case 'horror':
                particleStyle += `
                    background: #ff0000;
                    border-radius: 0;
                    transform: rotate(45deg);
                    animation: float-up-scary 5s ease-out forwards;
                `;
                break;
            case 'scifi':
                particleStyle += `
                    background: linear-gradient(45deg, #00bfff, #ff1493);
                    border-radius: 2px;
                    animation: float-up-tech 5s linear forwards;
                `;
                break;
            default:
                particleStyle += `
                    background: rgba(78, 205, 196, 0.8);
                    border-radius: 50%;
                    animation: float-up 5s ease-out forwards;
                `;
        }
        
        particle.style.cssText = particleStyle;
        return particle;
    }

    /**
     * Get current game theme for visualizations
     */
    getCurrentGameTheme() {
        if (this.currentCategory) return this.currentCategory;
        if (this.pendingGameData && this.pendingGameData.detectedCategory) {
            return this.pendingGameData.detectedCategory;
        }
        return 'ambient';
    }

    /**
     * Get theme color for current game
     */
    getGameThemeColor(colorType = 'primary') {
        const theme = this.getCurrentGameTheme();
        const colors = this.gameThemeColors[theme] || this.gameThemeColors.ambient;
        return colors[colorType] || colors.primary;
    }

    /**
     * Enhanced game theme visualizations that update continuously
     */
    updateGameThemeVisualizations() {
        if (!this.currentBoardGame && !this.currentCategory) return;
        
        this.updateGameSpecificVisualizations();
        
        // Update selected game area with enhanced effects
        this.enhanceSelectedGameArea();
        
        // Update playlist area with theme colors
        this.enhancePlaylistArea();
    }

    /**
     * Enhance the selected game area with dynamic effects
     */
    enhanceSelectedGameArea() {
        const selectedGameArea = document.getElementById('selected-game-area');
        if (!selectedGameArea) return;
        
        const gameImage = selectedGameArea.querySelector('.game-cover');
        const gameInfo = selectedGameArea.querySelector('.game-info');
        
        if (gameImage) {
            const time = Date.now() / 1000;
            const pulseIntensity = Math.sin(time * 0.5) * 0.1 + 1;
            gameImage.style.transform = `scale(${pulseIntensity})`;
            gameImage.style.filter = `brightness(${0.9 + Math.sin(time * 0.3) * 0.1})`;
        }
        
        if (gameInfo) {
            const themeColor = this.getGameThemeColor('primary');
            gameInfo.style.borderLeft = `3px solid ${themeColor}`;
        }
    }

    /**
     * Enhance playlist area with theme-based styling
     */
    enhancePlaylistArea() {
        const playlistContent = document.getElementById('track-list');
        if (!playlistContent) return;
        
        const movieSuggestions = playlistContent.querySelectorAll('.movie-suggestion');
        movieSuggestions.forEach((suggestion, index) => {
            const delay = index * 0.1;
            const time = (Date.now() / 1000) + delay;
            const glow = Math.sin(time * 0.8) * 0.3 + 0.7;
            
            suggestion.style.boxShadow = `0 2px 10px rgba(${this.getGameThemeColor('primary').slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, ${glow * 0.3})`;
        });
    }

    /**
     * Update game theme visualizations based on selected game
     */
    /**
     * Update CSS theme properties based on current game
     */
    updateGameThemeProperties() {
        const gameCategory = this.getCurrentGameTheme();
        const themeColors = this.gameThemeColors[gameCategory];
        
        if (!themeColors) return;

        // Update CSS custom properties for theme colors
        document.documentElement.style.setProperty('--theme-primary', themeColors.primary);
        document.documentElement.style.setProperty('--theme-secondary', themeColors.secondary);
        document.documentElement.style.setProperty('--theme-accent', themeColors.accent);

        // Update selected game area theme
        this.updateSelectedGameAreaTheme(themeColors);
        this.updateVisualizationTheme(gameCategory, themeColors);
    }

    /**
     * Update selected game area with theme colors
     */
    updateSelectedGameAreaTheme(themeColors) {
        const selectedGameArea = document.getElementById('selected-game-area');
        if (!selectedGameArea) return;

        // Add theme-based border glow
        selectedGameArea.style.borderColor = themeColors.primary;
        selectedGameArea.style.boxShadow = `0 0 20px ${themeColors.primary}33, var(--shadow-terminal)`;
        
        // Update theme tag color
        const themeTag = document.getElementById('selected-game-theme');
        if (themeTag) {
            themeTag.style.background = `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`;
        }
    }

    /**
     * Update visualization elements with game theme
     */
    updateVisualizationTheme(gameCategory, themeColors) {
        // Update landscape theme selector to match
        const landscapeTheme = document.getElementById('landscape-theme');
        if (landscapeTheme && landscapeTheme.value !== gameCategory) {
            landscapeTheme.value = gameCategory;
            // Regenerate landscape with new theme
            setTimeout(() => this.generateLandscape(), 500);
        }
        
        // Apply theme colors to visualization containers
        const vizContainers = document.querySelectorAll('.viz-content');
        vizContainers.forEach(container => {
            container.style.borderColor = themeColors.primary + '33';
        });
    }

    /**
     * Update progress animations and indicators
     */
    updateProgressAnimations() {
        // Update mini progress bar in selected game area
        this.updateMiniProgressAnimation();
        
        // Update player section progress bar
        this.updateMainProgressAnimation();
        
        // Update any other progress indicators
        this.updateVisualizationProgress();
    }

    /**
     * Update mini progress bar with smooth animation
     */
    updateMiniProgressAnimation() {
        const progressFill = document.getElementById('mini-progress');
        if (!progressFill || !this.isPlaying) return;

        // Simulate progress (in production, this would be actual playback time)
        const currentTime = Date.now();
        const elapsed = (currentTime - (this.trackStartTime || currentTime)) / 1000;
        const duration = 180; // 3 minutes average
        const progress = Math.min((elapsed % duration) / duration * 100, 100);
        
        progressFill.style.width = `${progress}%`;
        
        // Add pulsing effect
        const pulse = 1 + Math.sin(currentTime / 500) * 0.1;
        progressFill.style.transform = `scaleY(${pulse})`;
    }

    /**
     * Update main progress bar animation
     */
    updateMainProgressAnimation() {
        const progressFill = document.getElementById('progress');
        if (!progressFill || !this.isPlaying) return;

        // Sync with mini progress
        const miniProgress = document.getElementById('mini-progress');
        if (miniProgress) {
            progressFill.style.width = miniProgress.style.width;
        }
    }

    /**
     * Update visualization progress indicators
     */
    updateVisualizationProgress() {
        // Add subtle animation to active visualization tab
        const activeTab = document.querySelector('.viz-tab-btn.active');
        if (activeTab && this.isPlaying) {
            const pulse = 1 + Math.sin(Date.now() / 1000) * 0.05;
            activeTab.style.transform = `scale(${pulse})`;
            activeTab.style.borderColor = this.getGameThemeColor('primary');
        }
    }

    /**
     * Get current game theme color
     */
    getGameThemeColor(type = 'primary') {
        if (!this.pendingGameData) return '#4ecdc4'; // Default color
        
        const gameCategory = this.pendingGameData.detectedCategory || 'fantasy';
        const themeColors = this.gameThemeColors[gameCategory];
        
        return themeColors ? themeColors[type] : '#4ecdc4';
    }

    /**
     * Trigger special effects for game selection
     */
    triggerGameSelectionEffect(gameData) {
        const gameCategory = gameData.detectedCategory || 'fantasy';
        
        // Trigger landscape regeneration with theme
        setTimeout(() => {
            this.generateLandscape();
        }, 300);
        
        // Add selection particle effect
        this.createGameSelectionParticles(gameCategory);
        
        // Update all visualizations to match theme
        this.updateGameThemeVisualizations();
    }

    /**
     * Create particle effect for game selection
     */
    createGameSelectionParticles(gameCategory) {
        const selectedGameArea = document.getElementById('selected-game-area');
        if (!selectedGameArea) return;

        const colors = this.gameThemeColors[gameCategory];
        if (!colors) return;

        // Create temporary particle container
        const particleContainer = document.createElement('div');
        particleContainer.className = 'selection-particles';
        particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
        `;
        
        selectedGameArea.appendChild(particleContainer);

        // Create particles
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: ${colors.primary};
                border-radius: 50%;
                top: 50%;
                left: 50%;
                animation: particle-burst ${1 + Math.random() * 0.5}s ease-out forwards;
                animation-delay: ${i * 50}ms;
                transform: translate(-50%, -50%);
            `;
            particleContainer.appendChild(particle);
        }

        // Remove particles after animation
        setTimeout(() => {
            if (particleContainer.parentNode) {
                particleContainer.parentNode.removeChild(particleContainer);
            }
        }, 2000);
    }

    switchVisualizationTab(vizType) {
        // Update tab buttons
        document.querySelectorAll('.viz-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-viz="${vizType}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.viz-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${vizType}-viz`).classList.add('active');

        // Trigger specific initialization if needed
        switch(vizType) {
            case 'landscapes':
                this.generateLandscape();
                break;
            case 'meeples':
                this.initializeMeepleStage();
                break;
            case 'dice':
                this.initializeDiceContainer();
                break;
            case 'tableau':
                this.initializeGamePieces();
                break;
        }
    }

    // AI-Generated Dynamic Game Board Landscapes
    generateLandscape() {
        const canvas = document.getElementById('landscape-canvas');
        const themeSelect = document.getElementById('landscape-theme');
        const theme = themeSelect ? themeSelect.value : 'fantasy';
        
        if (!canvas) return;

        // Clear previous landscape
        canvas.innerHTML = '';
        
        // Add music-reactive class to canvas
        canvas.classList.add('music-reactive');

        // Generate landscape based on theme
        const landscapes = this.getLandscapeElements(theme);
        
        landscapes.forEach((element, index) => {
            const div = document.createElement('div');
            div.className = 'landscape-element music-reactive';
            div.style.cssText = `
                position: absolute;
                ${element.styles}
                animation: float-piece ${2 + Math.random() * 3}s ease-in-out infinite;
                animation-delay: ${index * 0.5}s;
            `;
            div.innerHTML = element.content;
            canvas.appendChild(div);
        });

        this.showNotification(`Generated ${theme} landscape!`, 'success');
    }

    getLandscapeElements(theme) {
        const elements = {
            fantasy: [
                { content: '🏰', styles: 'top: 20%; left: 70%; font-size: 3rem; color: #8833ff;' },
                { content: '🌲', styles: 'top: 60%; left: 20%; font-size: 2rem; color: #00ff88;' },
                { content: '🏔️', styles: 'top: 10%; left: 10%; font-size: 2.5rem; color: #666;' },
                { content: '✨', styles: 'top: 30%; left: 50%; font-size: 1.5rem; color: #00ccff;' },
                { content: '🐉', styles: 'top: 15%; left: 80%; font-size: 2rem; color: #ff0055;' }
            ],
            scifi: [
                { content: '🚀', styles: 'top: 40%; left: 60%; font-size: 2.5rem; color: #00ccff;' },
                { content: '🛸', styles: 'top: 20%; left: 30%; font-size: 2rem; color: #8833ff;' },
                { content: '🌌', styles: 'top: 10%; left: 70%; font-size: 3rem; color: #00ff88;' },
                { content: '⭐', styles: 'top: 70%; left: 80%; font-size: 1.5rem; color: #ffd700;' },
                { content: '🤖', styles: 'top: 60%; left: 40%; font-size: 2rem; color: #00ccff;' }
            ],
            cityscape: [
                { content: '🏙️', styles: 'top: 50%; left: 50%; font-size: 4rem; color: #666;' },
                { content: '🚗', styles: 'top: 70%; left: 20%; font-size: 1.5rem; color: #ff0055;' },
                { content: '✈️', styles: 'top: 20%; left: 80%; font-size: 2rem; color: #00ccff;' },
                { content: '🌃', styles: 'top: 30%; left: 10%; font-size: 2.5rem; color: #8833ff;' }
            ],
            forest: [
                { content: '🌳', styles: 'top: 40%; left: 30%; font-size: 3rem; color: #00ff88;' },
                { content: '🦌', styles: 'top: 60%; left: 60%; font-size: 2rem; color: #8B4513;' },
                { content: '🍄', styles: 'top: 70%; left: 20%; font-size: 1.5rem; color: #ff0055;' },
                { content: '🌿', styles: 'top: 20%; left: 70%; font-size: 2rem; color: #00ff88;' },
                { content: '🦋', styles: 'top: 30%; left: 80%; font-size: 1.5rem; color: #00ccff;' }
            ],
            desert: [
                { content: '🏜️', styles: 'top: 50%; left: 50%; font-size: 4rem; color: #DAA520;' },
                { content: '🌵', styles: 'top: 60%; left: 30%; font-size: 2.5rem; color: #00ff88;' },
                { content: '🐪', styles: 'top: 40%; left: 70%; font-size: 2rem; color: #8B4513;' },
                { content: '☀️', styles: 'top: 10%; left: 80%; font-size: 2.5rem; color: #ffd700;' }
            ]
        };

        return elements[theme] || elements.fantasy;
    }

    // Animated Meeple Parade
    startMeepleParade() {
        const stage = document.getElementById('meeple-stage');
        const themeSelect = document.getElementById('meeple-theme');
        const theme = themeSelect ? themeSelect.value : 'classic';
        
        if (!stage) return;

        // Clear existing meeples
        stage.innerHTML = '';

        const meeples = this.getMeeplesByTheme(theme);
        
        meeples.forEach((meeple, index) => {
            setTimeout(() => {
                const meepleDiv = document.createElement('div');
                meepleDiv.className = 'meeple music-reactive';
                meepleDiv.style.cssText = `
                    position: absolute;
                    font-size: 2rem;
                    animation: meeple-march 8s linear infinite;
                    animation-delay: ${index * 0.5}s;
                    top: ${30 + Math.random() * 40}%;
                    left: -100px;
                    z-index: ${10 - index};
                `;
                meepleDiv.innerHTML = meeple;
                stage.appendChild(meepleDiv);
            }, index * 500);
        });

        this.showNotification(`${theme} meeple parade started!`, 'success');
    }

    getMeeplesByTheme(theme) {
        const themes = {
            classic: ['👤', '👥', '👤', '👥', '👤', '👥'],
            fantasy: ['🧙‍♂️', '🏹', '⚔️', '🛡️', '🧝‍♀️', '🧚‍♀️'],
            scifi: ['👨‍🚀', '🤖', '👽', '🛸', '⚡', '🔬'],
            horror: ['🧟‍♂️', '👻', '🎭', '🕷️', '🦇', '💀']
        };

        return themes[theme] || themes.classic;
    }

    initializeMeepleStage() {
        const stage = document.getElementById('meeple-stage');
        if (!stage) return;

        stage.innerHTML = '<div style="color: var(--text-muted); font-family: JetBrains Mono;">Click "Start Parade" to begin the meeple march!</div>';
    }

    // Procedural Dice Visualizer
    rollDice() {
        const diceElements = document.querySelectorAll('.dice');
        
        diceElements.forEach(dice => {
            dice.classList.add('rolling');
            const sides = parseInt(dice.dataset.sides) || 6;
            const result = Math.floor(Math.random() * sides) + 1;
            
            setTimeout(() => {
                dice.textContent = result;
                dice.classList.remove('rolling');
            }, 1000);
        });

        this.showNotification('Rolling dice!', 'info');
    }

    addDice() {
        const container = document.getElementById('dice-container');
        const diceTypeSelect = document.getElementById('dice-type');
        
        if (!container || !diceTypeSelect) return;

        const diceType = diceTypeSelect.value;
        const sides = parseInt(diceType.substring(1));
        
        const dice = document.createElement('div');
        dice.className = 'dice music-reactive';
        dice.dataset.sides = sides;
        dice.textContent = Math.floor(Math.random() * sides) + 1;
        dice.addEventListener('click', () => {
            this.rollSingleDice(dice);
        });

        container.appendChild(dice);
        this.showNotification(`Added ${diceType} to the collection!`, 'success');
    }

    rollSingleDice(diceElement) {
        diceElement.classList.add('rolling');
        const sides = parseInt(diceElement.dataset.sides) || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        
        setTimeout(() => {
            diceElement.textContent = result;
            diceElement.classList.remove('rolling');
        }, 1000);
    }

    initializeDiceContainer() {
        const container = document.getElementById('dice-container');
        if (!container) return;

        // Clear and add initial dice
        container.innerHTML = '';
        
        // Add a few default dice
        ['d6', 'd20', 'd12'].forEach(diceType => {
            const sides = parseInt(diceType.substring(1));
            const dice = document.createElement('div');
            dice.className = 'dice music-reactive';
            dice.dataset.sides = sides;
            dice.textContent = Math.floor(Math.random() * sides) + 1;
            dice.addEventListener('click', () => this.rollSingleDice(dice));
            container.appendChild(dice);
        });
    }

    // Board Game Piece Tableau
    shuffleGamePieces() {
        const surface = document.getElementById('tableau-surface');
        if (!surface) return;

        const pieces = surface.querySelectorAll('.game-piece');
        pieces.forEach(piece => {
            piece.style.transform = `
                translateX(${(Math.random() - 0.5) * 200}px) 
                translateY(${(Math.random() - 0.5) * 100}px) 
                rotate(${Math.random() * 360}deg)
            `;
        });

        this.showNotification('Game pieces shuffled!', 'success');
    }

    generateGameCards() {
        const surface = document.getElementById('tableau-surface');
        const styleSelect = document.getElementById('game-style');
        
        if (!surface || !styleSelect) return;

        const style = styleSelect.value;
        const pieces = this.getGamePiecesByStyle(style);
        
        // Clear existing pieces
        surface.innerHTML = '';

        pieces.forEach((piece, index) => {
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'game-piece music-reactive';
            pieceDiv.innerHTML = piece;
            pieceDiv.style.animationDelay = `${index * 0.1}s`;
            pieceDiv.addEventListener('click', () => {
                pieceDiv.style.transform = `scale(1.2) rotate(${Math.random() * 360}deg)`;
                setTimeout(() => {
                    pieceDiv.style.transform = '';
                }, 500);
            });
            surface.appendChild(pieceDiv);
        });

        this.showNotification(`Generated ${style} game pieces!`, 'success');
    }

    getGamePiecesByStyle(style) {
        const styles = {
            eurogame: ['🎯', '⚙️', '🏭', '📊', '💰', '🔧', '📈', '⚖️', '🏪', '🎪'],
            ameritrash: ['⚔️', '🛡️', '💥', '🔥', '👹', '🏰', '🗡️', '🏹', '💀', '⚡'],
            abstract: ['⚫', '⚪', '🔴', '🔵', '🟡', '🟢', '🟣', '🟤', '🔶', '🔷'],
            party: ['🎉', '🎊', '🎈', '🎁', '🎭', '🎪', '🎨', '🎵', '💃', '🕺']
        };

        return styles[style] || styles.eurogame;
    }

    initializeGamePieces() {
        this.generateGameCards();
    }

    // TV Projection and Voice Control Features
    projectToTV() {
        const statusElement = document.getElementById('tv-status');
        
        // Open display mode in new window/tab for casting
        const currentGame = this.currentGame?.name || 'default';
        const currentTheme = this.getCurrentVisualizationTheme();
        const displayUrl = `display.html?theme=${currentTheme}&game=${encodeURIComponent(currentGame)}`;
        
        // Try to open in new window for casting
        const displayWindow = window.open(displayUrl, 'TabletopTunesDisplay', 
            'width=1920,height=1080,fullscreen=yes,menubar=no,toolbar=no,location=no,status=no,scrollbars=no');
        
        if (displayWindow) {
            if (statusElement) {
                statusElement.textContent = 'Connecting...';
                statusElement.style.color = 'var(--warning-color)';
                
                setTimeout(() => {
                    statusElement.textContent = 'Display Active';
                    statusElement.style.color = 'var(--success-color)';
                    this.showNotification('Display mode opened! Cast this tab to your TV or use fullscreen mode.', 'success');
                    this.showCastingInstructions();
                }, 1000);
            }
            
            // Store reference for communication
            this.displayWindow = displayWindow;
            
            // Listen for window close
            const checkClosed = setInterval(() => {
                if (displayWindow.closed) {
                    clearInterval(checkClosed);
                    if (statusElement) {
                        statusElement.textContent = 'Disconnected';
                        statusElement.style.color = 'var(--text-muted)';
                    }
                    this.displayWindow = null;
                }
            }, 1000);
        } else {
            this.showNotification('Pop-up blocked! Please allow pop-ups and try again.', 'warning');
        }
    }

    getCurrentVisualizationTheme() {
        // Get current active visualization theme
        const landscapeSelect = document.getElementById('landscape-theme');
        if (landscapeSelect) {
            return landscapeSelect.value;
        }
        
        // Fallback based on current game category
        if (this.currentGame) {
            const category = this.currentGame.category || 'fantasy';
            const themeMap = {
                'fantasy': 'fantasy',
                'scifi': 'scifi', 
                'horror': 'horror',
                'tavern': 'tavern',
                'adventure': 'fantasy',
                'ambient': 'fantasy'
            };
            return themeMap[category] || 'fantasy';
        }
        
        return 'fantasy';
    }

    showCastingInstructions() {
        const instructions = `
            <div style="background: var(--bg-card); border: 1px solid var(--terminal-border); border-radius: 8px; padding: 20px; margin-top: 10px;">
                <h4 style="color: var(--terminal-green); margin-bottom: 15px;">
                    <i class="fas fa-tv"></i> How to Cast to Your TV
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <div>
                        <h5 style="color: var(--accent-color); margin-bottom: 8px;">
                            <i class="fab fa-chrome"></i> Chrome/Edge
                        </h5>
                        <p style="font-size: 0.9rem; line-height: 1.4;">
                            Click the <strong>⋮</strong> menu → <strong>Cast</strong> → Select your TV
                        </p>
                    </div>
                    <div>
                        <h5 style="color: var(--accent-color); margin-bottom: 8px;">
                            <i class="fab fa-apple"></i> Safari/iOS
                        </h5>
                        <p style="font-size: 0.9rem; line-height: 1.4;">
                            Use <strong>AirPlay</strong> icon or Screen Mirroring from Control Center
                        </p>
                    </div>
                    <div>
                        <h5 style="color: var(--accent-color); margin-bottom: 8px;">
                            <i class="fas fa-hdmi-port"></i> HDMI
                        </h5>
                        <p style="font-size: 0.9rem; line-height: 1.4;">
                            Connect laptop to TV, press <strong>F</strong> for fullscreen
                        </p>
                    </div>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--terminal-border); font-size: 0.8rem; color: var(--text-muted);">
                    <strong>Tip:</strong> Use your phone/tablet to control music while visuals play on TV!
                </div>
            </div>
        `;
        
        // Find a good place to show instructions (in the projection controls area)
        const projectionControls = document.querySelector('.projection-controls');
        if (projectionControls) {
            let instructionsDiv = projectionControls.querySelector('.casting-instructions');
            if (!instructionsDiv) {
                instructionsDiv = document.createElement('div');
                instructionsDiv.className = 'casting-instructions';
                projectionControls.appendChild(instructionsDiv);
            }
            instructionsDiv.innerHTML = instructions;
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (instructionsDiv) {
                    instructionsDiv.style.opacity = '0';
                    instructionsDiv.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => {
                        if (instructionsDiv && instructionsDiv.parentNode) {
                            instructionsDiv.parentNode.removeChild(instructionsDiv);
                        }
                    }, 500);
                }
            }, 10000);
        }
    }

    /**
     * Open display mode directly (simpler than projectToTV)
     */
    openDisplayMode() {
        const currentGame = this.currentGame?.name || 'default';
        const currentTheme = this.getCurrentVisualizationTheme();
        const displayUrl = `display.html?theme=${currentTheme}&game=${encodeURIComponent(currentGame)}`;
        
        // Open display mode in new tab
        const displayWindow = window.open(displayUrl, '_blank');
        
        // Also offer remote control
        setTimeout(() => {
            const remoteUrl = `remote-control.html?theme=${currentTheme}&game=${encodeURIComponent(currentGame)}`;
            const useRemote = confirm('Display mode opened! Would you like to open the mobile remote control as well?');
            if (useRemote) {
                window.open(remoteUrl, '_blank');
            }
        }, 1000);
        
        this.showNotification('Display mode opened in new tab! Drag to TV browser or use fullscreen (F key).', 'success');
    }

    enableVoiceControl() {
        const statusElement = document.getElementById('voice-status');
        
        // Check for voice recognition support
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            if (statusElement) {
                statusElement.textContent = 'Listening...';
                statusElement.style.color = 'var(--success-color)';
            }
            
            this.initializeVoiceCommands();
            this.showNotification('Voice control activated! Try saying "project to TV" or "start meeple parade"', 'success');
        } else {
            this.showNotification('Voice recognition not supported in this browser', 'warning');
        }
    }

    initializeVoiceCommands() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            this.handleVoiceCommand(transcript);
        };

        recognition.start();
    }

    handleVoiceCommand(command) {
        console.log('Voice command:', command);
        
        if (command.includes('project to tv')) {
            this.projectToTV();
        } else if (command.includes('start parade') || command.includes('meeple parade')) {
            this.startMeepleParade();
        } else if (command.includes('roll dice')) {
            this.rollDice();
        } else if (command.includes('generate landscape')) {
            this.generateLandscape();
        } else if (command.includes('shuffle pieces')) {
            this.shuffleGamePieces();
        }
    }

    connectSpotifyMini() {
        const statusElement = document.getElementById('spotify-mini-status');
        
        // Simulate Google Mini + Spotify connection
        if (statusElement) {
            statusElement.textContent = 'Connecting...';
            statusElement.style.color = 'var(--warning-color)';
            
            setTimeout(() => {
                statusElement.textContent = 'Connected';
                statusElement.style.color = 'var(--success-color)';
                this.showNotification('Connected to Google Mini! Audio can now be controlled via voice.', 'success');
            }, 2000);
        }
    }
}

// Initialize the application when the page loads
let tabletopTunes;

// Initialize Spotify Web Playback SDK when available
window.onSpotifyWebPlaybackSDKReady = () => {
    console.log('Spotify SDK Ready');
    if (window.tabletopTunes) {
        tabletopTunes.setupSpotifyPlayer();
    }
};

// Save preferences before page unload
window.addEventListener('beforeunload', () => {
    if (window.tabletopTunes) {
        window.tabletopTunes.saveUserPreferences();
    }
});