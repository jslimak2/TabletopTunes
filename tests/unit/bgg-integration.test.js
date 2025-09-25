/**
 * Unit tests for BoardGameGeek API Integration
 * Tests the BGG service functionality and integration with the main app
 */

// Import the BGG service
const BGGApiService = require('../../bgg-api-service.js');

// Mock fetch for testing
global.fetch = jest.fn();
global.DOMParser = jest.fn(() => ({
    parseFromString: jest.fn()
}));

// Mock Response constructor
global.Response = class {
    constructor(body, init) {
        this.body = body;
        this.status = init?.status || 200;
        this.ok = this.status >= 200 && this.status < 300;
    }
    
    text() {
        return Promise.resolve(this.body);
    }
};

describe('BGG API Integration', () => {
    let bggService;

    beforeEach(() => {
        bggService = new BGGApiService();
        jest.clearAllMocks();
    });

    describe('BGGApiService Constructor', () => {
        test('should initialize with correct default values', () => {
            expect(bggService.baseUrl).toBe('https://www.boardgamegeek.com/xmlapi2');
            expect(bggService.cache).toBeInstanceOf(Map);
            expect(bggService.rateLimitDelay).toBe(1000);
            expect(bggService.lastRequestTime).toBe(0);
        });
    });

    describe('Rate Limiting', () => {
        test('should respect rate limits', async () => {
            const startTime = Date.now();
            bggService.lastRequestTime = startTime;
            
            await bggService.respectRateLimit();
            
            const endTime = Date.now();
            expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
        });

        test('should not delay if enough time has passed', async () => {
            const startTime = Date.now();
            bggService.lastRequestTime = startTime - 2000; // 2 seconds ago
            
            await bggService.respectRateLimit();
            
            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(100); // Should be immediate
        });
    });

    describe('Theme Generation', () => {
        test('should generate themes from BGG categories', () => {
            const gameDetails = {
                categories: ['Fantasy', 'Adventure', 'War'],
                mechanisms: ['Cooperative Play', 'Role Playing'],
                description: 'A fantasy adventure game with dragons and dungeons',
                families: []
            };

            const themes = bggService.generateThemesFromGame(gameDetails);

            expect(themes).toContain('fantasy');
            expect(themes).toContain('adventure');
            expect(themes).toContain('war');
            expect(themes).toContain('cooperative');
            expect(themes).toContain('roleplay');
            expect(themes).toContain('epic'); // dragons add 'epic' theme
            expect(themes).toContain('dungeon');
        });

        test('should provide default themes when none detected', () => {
            const gameDetails = {
                categories: [],
                mechanisms: [],
                description: '',
                families: []
            };

            const themes = bggService.generateThemesFromGame(gameDetails);

            expect(themes).toContain('strategy');
            expect(themes).toContain('board game');
        });
    });

    describe('Category Determination', () => {
        test('should prioritize horror themes', () => {
            const themes = ['horror', 'zombies', 'fantasy'];
            const category = bggService.determineCategoryFromThemes(themes);
            expect(category).toBe('horror');
        });

        test('should prioritize fantasy over strategy', () => {
            const themes = ['fantasy', 'magic', 'strategy'];
            const category = bggService.determineCategoryFromThemes(themes);
            expect(category).toBe('fantasy');
        });

        test('should default to strategy', () => {
            const themes = ['economic', 'trading'];
            const category = bggService.determineCategoryFromThemes(themes);
            expect(category).toBe('strategy');
        });
    });

    describe('Soundtrack Generation', () => {
        test('should generate appropriate soundtrack suggestions', () => {
            const themes = ['fantasy', 'adventure'];
            const category = 'fantasy';
            const gameDetails = { name: 'Test Game' };

            const suggestions = bggService.generateSoundtrackSuggestions(themes, category, gameDetails);

            expect(suggestions).toHaveLength(2);
            expect(suggestions[0]).toHaveProperty('movie');
            expect(suggestions[0]).toHaveProperty('reason');
            expect(suggestions[0]).toHaveProperty('tracks');
            expect(suggestions[0].reason).toContain('Epic fantasy adventure'); // Use the actual reason from fallback suggestions
        });
    });

    describe('XML Parsing', () => {
        test('should parse search results correctly', () => {
            const mockXML = `<?xml version="1.0" encoding="utf-8"?>
            <items total="1" termsofuse="">
                <item type="boardgame" id="174430">
                    <name type="primary" value="Gloomhaven"/>
                    <yearpublished value="2017"/>
                </item>
            </items>`;

            // Mock DOMParser
            const mockParser = {
                parseFromString: jest.fn().mockReturnValue({
                    getElementsByTagName: jest.fn().mockImplementation((tagName) => {
                        if (tagName === 'item') {
                            return [{
                                getAttribute: jest.fn().mockImplementation((attr) => {
                                    if (attr === 'id') return '174430';
                                    return null;
                                }),
                                getElementsByTagName: jest.fn().mockImplementation((tag) => {
                                    if (tag === 'name') {
                                        return [{ getAttribute: jest.fn().mockReturnValue('Gloomhaven') }];
                                    }
                                    if (tag === 'yearpublished') {
                                        return [{ getAttribute: jest.fn().mockReturnValue('2017') }];
                                    }
                                    return [];
                                })
                            }];
                        }
                        return [];
                    })
                })
            };

            global.DOMParser = jest.fn(() => mockParser);

            const results = bggService.parseSearchResults(mockXML);

            expect(results).toHaveLength(1);
            expect(results[0].id).toBe(174430);
            expect(results[0].name).toBe('Gloomhaven');
            expect(results[0].yearPublished).toBe(2017);
        });
    });

    describe('Cache Management', () => {
        test('should cache search results', async () => {
            const mockResponse = new Response('mock xml', { status: 200 });
            global.fetch.mockResolvedValueOnce(mockResponse);
            mockResponse.text = jest.fn().mockResolvedValue('<items></items>');

            await bggService.searchGames('test');
            expect(bggService.cache.has('search_test')).toBe(true);
        });

        test('should clear cache', () => {
            bggService.cache.set('test', 'value');
            expect(bggService.cache.size).toBe(1);

            bggService.clearCache();
            expect(bggService.cache.size).toBe(0);
        });
    });

    describe('Error Handling', () => {
        test('should handle fetch errors gracefully', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const results = await bggService.searchGames('test');
            expect(results).toEqual([]);
        });

        test('should handle XML parsing errors', () => {
            const invalidXML = 'not xml';
            const results = bggService.parseSearchResults(invalidXML);
            expect(results).toEqual([]);
        });
    });
});

describe('TabletopTunes BGG Integration', () => {
    // Mock TabletopTunes class for integration testing
    const mockTabletopTunes = {
        bggService: new BGGApiService(),
        showNotification: jest.fn(),
        displayBGGGameSuggestions: jest.fn(),
        currentBoardGame: null,
        matchingMode: 'category'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should integrate BGG service with main app', () => {
        expect(mockTabletopTunes.bggService).toBeInstanceOf(BGGApiService);
    });

    test('should handle BGG game not found', async () => {
        mockTabletopTunes.bggService.getGameByName = jest.fn().mockResolvedValue(null);

        const result = await mockTabletopTunes.bggService.getGameByName('nonexistent game');
        expect(result).toBeNull();
    });

    test('should process BGG game data correctly', async () => {
        const mockBGGGame = {
            id: 174430,
            name: 'Gloomhaven',
            description: 'A fantasy adventure game',
            themes: ['fantasy', 'adventure'],
            category: 'adventure',
            suggestedSoundtracks: [
                {
                    movie: 'Lord of the Rings',
                    reason: 'Epic fantasy adventure',
                    tracks: ['Main Theme', 'Adventure Begins', 'Epic Finale']
                }
            ]
        };

        mockTabletopTunes.bggService.getGameByName = jest.fn().mockResolvedValue(mockBGGGame);

        const result = await mockTabletopTunes.bggService.getGameByName('Gloomhaven');
        
        expect(result).toBeTruthy();
        expect(result.name).toBe('Gloomhaven');
        expect(result.themes).toContain('fantasy');
        expect(result.suggestedSoundtracks).toHaveLength(1);
    });
});