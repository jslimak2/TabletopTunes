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
            
            // Special handling for Games Closet tab
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
        
        // Initialize Spotify Web Playback SDK when available
        window.onSpotifyWebPlaybackSDKReady = () => {
            console.log('Spotify SDK Ready');
            this.setupSpotifyPlayer();
        };
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
        
        recommendationsDiv.innerHTML = `
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border-left: 4px solid var(--spotify-green);">
                <h4 style="color: var(--spotify-green); margin-bottom: 1rem;">
                    <i class="fas fa-magic"></i> AI-Powered Recommendations for ${currentGame}
                </h4>
                <div class="spotify-recommendations-list">
                    <div class="recommendation-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-card); border-radius: var(--radius-md); margin-bottom: 0.5rem;">
                        <img src="data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%234ecdc4'/%3E%3C/svg%3E" style="width: 40px; height: 40px; border-radius: var(--radius-sm);" alt="Album">
                        <div style="flex: 1;">
                            <div style="color: var(--text-primary); font-weight: 500;">Epic Orchestral Mix</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Based on your game theme • 94% match</div>
                        </div>
                        <button onclick="tabletopTunes.playRecommendation('epic-mix')" style="padding: 0.5rem 1rem; background: var(--spotify-green); border: none; border-radius: var(--radius-md); color: white; cursor: pointer;">
                            <i class="fas fa-play"></i> Play
                        </button>
                    </div>
                    <div class="recommendation-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-card); border-radius: var(--radius-md); margin-bottom: 0.5rem;">
                        <img src="data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%23ff6b6b'/%3E%3C/svg%3E" style="width: 40px; height: 40px; border-radius: var(--radius-sm);" alt="Album">
                        <div style="flex: 1;">
                            <div style="color: var(--text-primary); font-weight: 500;">Cinematic Soundscapes</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Curated movie themes • 89% match</div>
                        </div>
                        <button onclick="tabletopTunes.playRecommendation('cinematic')" style="padding: 0.5rem 1rem; background: var(--spotify-green); border: none; border-radius: var(--radius-md); color: white; cursor: pointer;">
                            <i class="fas fa-play"></i> Play
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    playRecommendation(type) {
        this.showNotification(`Playing ${type} recommendation from Spotify!`);
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
                <div class="recommendation-card">
                    <h4>${result.category.charAt(0).toUpperCase() + result.category.slice(1)} Category Selected</h4>
                    <p>${result.reason}</p>
                    <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-muted);">
                        ${result.tracks.length} tracks available in this category
                    </div>
                </div>
            `;
        } else {
            resultDisplay.innerHTML = `
                <div class="recommendation-card">
                    <h4>No Specific Match Found</h4>
                    <p>Try browsing categories or popular games for suggestions.</p>
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
        this.displayPlaylist();
        this.updateCurrentTrackInfo();
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
    
    // Games Closet functionality
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
        
        this.showNotification(`"${gameName}" added to Games Closet!`);
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
            
            this.showNotification(`"${gameName}" removed from Games Closet`);
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
                    <p>Your games closet is waiting for its first adventure! When you search for board games and find soundtracks, they'll automatically be saved here.</p>
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
        this.showNotification('Added sample games to your closet!', 'success');
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
        if (confirm('Are you sure you want to remove all games from your closet? This action cannot be undone.')) {
            this.savedGames = {};
            this.gamePlaylistHistory = {};
            this.saveUserData();
            this.displayGamesCloset();
            this.showNotification('All games cleared from closet', 'success');
        }
    }
    
    loadGameFromCloset(gameName) {
        // Switch to main tab and perform search
        this.switchTab('main');
        document.getElementById('game-search').value = gameName;
        this.performGameSearch();
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
            
            this.displayPlaylist();
            this.updateCurrentTrackInfo();
            
            this.showNotification(`Loaded "${playlistName}" for ${gameName}`);
            
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
        
        // First, check games closet for matches (prioritize user's saved games)
        Object.keys(this.savedGames).forEach(gameName => {
            if (gameName.toLowerCase().includes(normalizedQuery)) {
                suggestions.push({
                    name: gameName,
                    source: 'closet',
                    category: this.savedGames[gameName].detectedCategory || 'adventure',
                    themes: this.savedGames[gameName].themes || []
                });
            }
        });
        
        // Check local database for matches
        if (typeof BOARD_GAMES_DATABASE !== 'undefined') {
            Object.keys(BOARD_GAMES_DATABASE).forEach(gameName => {
                // Avoid duplicates if game is already in closet
                if (gameName.toLowerCase().includes(normalizedQuery) && !this.savedGames[gameName]) {
                    suggestions.push({
                        name: gameName,
                        source: 'database',
                        category: BOARD_GAMES_DATABASE[gameName].category,
                        themes: BOARD_GAMES_DATABASE[gameName].themes
                    });
                }
            });
        }
        
        // Add theme-based suggestions
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
                
                const iconClass = suggestion.isCategory 
                    ? 'fa-layer-group' 
                    : suggestion.source === 'closet' 
                        ? 'fa-archive' 
                        : 'fa-dice';
                
                return `
                    <div class="live-search-item" onclick="tabletopTunes.selectLiveSearchResult('${escapedName}', '${escapedSource}')">
                        <i class="fas ${iconClass}" style="margin-right: 8px; color: var(--primary-color);"></i>
                        <div class="suggestion-content">
                            <span class="suggestion-name">${escapedName}</span>
                            ${escapedThemes ? `<span class="suggestion-themes">${escapedThemes}</span>` : ''}
                        </div>
                        <span class="suggestion-source">${escapedSource}</span>
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

    async searchBoardGame(gameName) {
        console.log('searchBoardGame called with:', gameName);
        // First, check local database for exact match
        if (typeof BOARD_GAMES_DATABASE !== 'undefined') {
            const game = BOARD_GAMES_DATABASE[gameName];
            if (game) {
                console.log('Found exact match in database:', game);
                this.currentBoardGame = gameName;
                this.matchingMode = 'boardgame';
                
                // Enhance with movie API data before displaying
                const enhancedGame = await this.enhanceWithMovieData(game);
                this.displayGameSuggestions(enhancedGame);
                
                // Automatically save to games closet
                this.saveToGamesCloset(gameName, { source: 'local_database' });
                
                console.log('Returning game object with suggestedSoundtracks:', !!enhancedGame.suggestedSoundtracks);
                return enhancedGame;
            }
        }
        
        // Check for partial matches in local database
        const localGame = this.getGameFromDatabase(gameName.toLowerCase());
        if (localGame) {
            this.currentBoardGame = gameName;
            this.matchingMode = 'boardgame';
            
            // Enhance with movie API data before displaying
            const enhancedLocalGame = await this.enhanceWithMovieData(localGame);
            this.displayGameSuggestions(enhancedLocalGame);
            
            // Automatically save to games closet
            this.saveToGamesCloset(gameName, { source: 'local_database' });
            
            return enhancedLocalGame;
        }
        
        // Try BoardGameGeek API as fallback
        this.showNotification('Searching BoardGameGeek database...', 'info');
        try {
            const bggGame = await this.bggService.getGameByName(gameName);
            if (bggGame) {
                this.currentBoardGame = gameName;
                this.matchingMode = 'boardgame';
                this.displayBGGGameSuggestions(bggGame);
                
                // Automatically save to games closet with comprehensive BGG data
                this.saveToGamesCloset(gameName, { 
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
                        detectedCategory: bggGame.category
                    }
                });
                
                return bggGame;
            }
        } catch (error) {
            console.warn('BGG API search failed:', error);
        }
        
        // Final fallback to theme-based matching
        const themeResult = this.suggestByTheme(gameName);
        if (themeResult) {
            // Even theme-based matches get saved to closet
            this.saveToGamesCloset(gameName, { 
                source: 'theme_analysis',
                detectedCategory: themeResult.category 
            });
        }
        
        return themeResult;
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
        
        // First, check if we have specific game data
        const gameData = this.getGameFromDatabase(normalizedInput);
        if (gameData) {
            return this.processGameData(gameData, input);
        }
        
        // Fallback to advanced theme analysis
        return this.analyzeThemeKeywords(normalizedInput, input);
    }

    getGameFromDatabase(gameName) {
        // Check exact matches first
        if (window.BOARD_GAMES_DATABASE && window.BOARD_GAMES_DATABASE[gameName]) {
            return window.BOARD_GAMES_DATABASE[gameName];
        }
        
        // Check partial matches
        const gameKeys = Object.keys(window.BOARD_GAMES_DATABASE || {});
        const match = gameKeys.find(key => 
            key.toLowerCase().includes(gameName) || 
            gameName.includes(key.toLowerCase())
        );
        
        return match ? window.BOARD_GAMES_DATABASE[match] : null;
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
        
        let html = `<div class="game-suggestions bgg-suggestions">`;
        
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
        
        let html = `<div class="game-suggestions">`;
        
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
        if (this.currentBoardGame && typeof BOARD_GAMES_DATABASE !== 'undefined') {
            const game = BOARD_GAMES_DATABASE[this.currentBoardGame];
            const suggestion = game.suggestedSoundtracks[suggestionIndex];
            
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

    playMovieTrack(movieName, trackName, trackIndex) {
        this.showNotification(`Playing "${trackName}" from ${movieName}`);
        
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
            currentCategoryElement.textContent = `Track ${this.currentTrackIndex + 1} of ${this.currentPlaylist.length}`;
            
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
            currentCategoryElement.textContent = 'Select a soundtrack category';
            
            if (trackMovieElement) trackMovieElement.style.display = 'none';
            if (trackDescriptionElement) trackDescriptionElement.style.display = 'none';
            
            document.getElementById('duration').textContent = '0:00';
            this.updatePlaybackStatus('Ready to play your perfect soundtrack');
        }
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
        
        // For demo purposes, just show notification
        // In production, this would play the actual track
        this.showNotification(`Now playing: ${trackName} from ${movieTitle}`, 'info');
        
        // Update current track display
        const currentTrackElement = document.getElementById('current-track');
        const currentCategoryElement = document.getElementById('current-category');
        
        if (currentTrackElement) {
            currentTrackElement.textContent = trackName;
        }
        if (currentCategoryElement) {
            currentCategoryElement.textContent = `From ${movieTitle}`;
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
        const enableVoiceBtn = document.getElementById('enable-voice');
        const connectSpotifyBtn = document.getElementById('connect-spotify-mini');
        
        if (projectTvBtn) projectTvBtn.addEventListener('click', () => this.projectToTV());
        if (enableVoiceBtn) enableVoiceBtn.addEventListener('click', () => this.enableVoiceControl());
        if (connectSpotifyBtn) connectSpotifyBtn.addEventListener('click', () => this.connectSpotifyMini());

        // Start with initial visualizations
        this.generateLandscape();
        this.initializeDiceContainer();
        this.initializeGamePieces();
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

        // Generate landscape based on theme
        const landscapes = this.getLandscapeElements(theme);
        
        landscapes.forEach((element, index) => {
            const div = document.createElement('div');
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
        dice.className = 'dice';
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
            dice.className = 'dice';
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
            pieceDiv.className = 'game-piece';
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
        
        // Simulate TV connection
        if (statusElement) {
            statusElement.textContent = 'Connecting...';
            statusElement.style.color = 'var(--warning-color)';
            
            setTimeout(() => {
                statusElement.textContent = 'Connected';
                statusElement.style.color = 'var(--success-color)';
                this.showNotification('Connected to TV! Visualizations are now projecting.', 'success');
            }, 2000);
        }
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

document.addEventListener('DOMContentLoaded', () => {
    tabletopTunes = new TabletopTunes();
});

// Save preferences before page unload
window.addEventListener('beforeunload', () => {
    if (tabletopTunes) {
        tabletopTunes.saveUserPreferences();
    }
});