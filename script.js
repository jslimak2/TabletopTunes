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
        this.loadUserPreferences();
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

    // Board Game Matching Functions
    async performGameSearch() {
        const gameInput = document.getElementById('game-search').value.trim();
        if (!gameInput) {
            this.showNotification('Please enter a board game name');
            return;
        }
        
        try {
            const result = await this.searchBoardGame(gameInput);
            if (!result) {
                this.showNotification(`No specific suggestions found for "${gameInput}". Try browsing categories or popular games.`);
                // Reset to category browsing
                this.matchingMode = 'category';
                this.currentBoardGame = null;
                document.querySelector('.playlist-section h2').textContent = 'Current Playlist';
            } else if (result.category) {
                // Handle theme-based results
                this.currentBoardGame = gameInput;
                this.matchingMode = 'boardgame';
                this.displayThemeBasedSuggestions(result, gameInput);
            }
        } catch (error) {
            console.error('Game search error:', error);
            this.showNotification('Error searching for game. Please try again.');
        }
    }

    async searchBoardGame(gameName) {
        // First, check local database for exact match
        if (typeof BOARD_GAMES_DATABASE !== 'undefined') {
            const game = BOARD_GAMES_DATABASE[gameName];
            if (game) {
                this.currentBoardGame = gameName;
                this.matchingMode = 'boardgame';
                this.displayGameSuggestions(game);
                return game;
            }
        }
        
        // Check for partial matches in local database
        const localGame = this.getGameFromDatabase(gameName.toLowerCase());
        if (localGame) {
            this.currentBoardGame = gameName;
            this.matchingMode = 'boardgame';
            this.displayGameSuggestions(localGame);
            return localGame;
        }
        
        // Try BoardGameGeek API as fallback
        this.showNotification('Searching BoardGameGeek database...', 'info');
        try {
            const bggGame = await this.bggService.getGameByName(gameName);
            if (bggGame) {
                this.currentBoardGame = gameName;
                this.matchingMode = 'boardgame';
                this.displayBGGGameSuggestions(bggGame);
                return bggGame;
            }
        } catch (error) {
            console.warn('BGG API search failed:', error);
        }
        
        // Final fallback to theme-based matching
        return this.suggestByTheme(gameName);
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
        const categoryTitle = document.querySelector('.playlist-section h2');
        
        categoryTitle.textContent = `Recommendations for ${this.currentBoardGame}`;
        
        let html = `<div class="game-suggestions">`;
        
        // Check if this is our enhanced recommendation system
        if (game.suggestedSoundtracks) {
            // Original game data format
            game.suggestedSoundtracks.forEach((suggestion, index) => {
                html += `
                    <div class="movie-suggestion enhanced-suggestion" onclick="tabletopTunes.loadMovieSoundtrack('${suggestion.movie}', ${index})">
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
        const categoryTitle = document.querySelector('.playlist-section h2');
        
        categoryTitle.textContent = `Recommendations for ${bggGame.name}`;
        
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
                            ${suggestion.tracks.map((track, trackIndex) => `
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

    displayThemeBasedSuggestions(result, gameName) {
        const trackList = document.getElementById('track-list');
        const categoryTitle = document.querySelector('.playlist-section h2');
        
        categoryTitle.textContent = `Theme-Based Suggestions for ${gameName}`;
        
        let html = `<div class="game-suggestions theme-suggestions">`;
        
        // Add theme analysis info
        html += `
            <div class="theme-analysis-info">
                <div class="analysis-header">
                    <h3><i class="fas fa-search"></i> ${gameName}</h3>
                    <div class="analysis-badge">
                        <i class="fas fa-lightbulb"></i> Theme Analysis
                    </div>
                </div>
                
                <div class="analysis-details">
                    <p class="analysis-reason">${result.reason}</p>
                    <div class="confidence-meter">
                        <span class="confidence-label">Confidence: ${result.confidence}%</span>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${result.confidence}%"></div>
                        </div>
                    </div>
                </div>
                
                ${result.detectedKeywords && result.detectedKeywords.length > 0 ? `
                    <div class="detected-keywords">
                        <strong>Detected Keywords:</strong> 
                        ${result.detectedKeywords.slice(0, 5).map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add category-based soundtrack suggestions
        html += `
            <div class="category-suggestion theme-category-suggestion" onclick="tabletopTunes.selectCategory('${result.category}')">
                <div class="category-header">
                    <h4><i class="fas fa-${this.getCategoryIcon(result.category)}"></i> ${result.category.charAt(0).toUpperCase() + result.category.slice(1)} Soundtracks</h4>
                    <div class="suggested-badge">
                        <i class="fas fa-magic"></i> Suggested
                    </div>
                </div>
                <p class="category-description">Based on theme analysis, we suggest ${result.category} soundtracks</p>
                <div class="sample-tracks">
                    ${result.tracks.slice(0, 3).map(track => `
                        <div class="sample-track">
                            <span class="track-name">${track.name}</span>
                            <span class="track-duration">${track.duration}</span>
                        </div>
                    `).join('')}
                    ${result.tracks.length > 3 ? `<div class="more-tracks">+${result.tracks.length - 3} more tracks</div>` : ''}
                </div>
            </div>
        `;
        
        html += `</div>`;
        trackList.innerHTML = html;
        
        this.showNotification(`Theme analysis complete for "${gameName}"!`, 'success');
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
        document.querySelector('.playlist-section h2').textContent = 'Custom Mixed Playlist';
        
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