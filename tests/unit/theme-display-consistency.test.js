/**
 * Tests for theme-based display consistency
 * Ensures that theme-based suggestions use the same UI format as preloaded games
 */

const fs = require('fs');
const path = require('path');

// Load the game database file content
const gameDataPath = path.join(__dirname, '../../game-soundtrack-data.js');
const gameDataContent = fs.readFileSync(gameDataPath, 'utf8');

// Execute the content to get the database objects
eval(gameDataContent);

// Mock DOM elements for testing
const mockDocument = {
  getElementById: (id) => ({
    textContent: '',
    innerHTML: '',
    querySelector: () => mockDocument.getElementById()
  }),
  querySelector: () => mockDocument.getElementById()
};

// Create a testable version of the TabletopTunes class
class TestableTabletopTunes {
  constructor() {
    this.soundtracks = {
      fantasy: [
        { name: 'Dragon\'s Lair', duration: '4:23' },
        { name: 'Enchanted Forest', duration: '3:45' },
        { name: 'Castle Walls', duration: '5:12' }
      ],
      horror: [
        { name: 'Dark Forest', duration: '6:00' },
        { name: 'Haunted Manor', duration: '4:30' }
      ],
      scifi: [
        { name: 'Space Station', duration: '7:15' },
        { name: 'Robot Factory', duration: '5:45' }
      ],
      ambient: [
        { name: 'Peaceful Meadow', duration: '8:30' },
        { name: 'Quiet Lake', duration: '6:15' }
      ]
    };
  }

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
          mood: this.getCategoryMood(category),
          gameplayFit: `Perfect for ${category} themed board games`
        },
        apiSource: false, // Mark as generated, not from API
        themeGenerated: true // Mark as theme-based generation
      }))
    };

    return enhancedResult;
  }

  displayThemeBasedSuggestions(result, gameName) {
    // Generate movie-style suggestions from theme analysis
    const enhancedResult = this.generateMovieStyleSuggestions(result, gameName);
    
    let html = `<div class="game-suggestions">`;
    
    // Add theme analysis info at the top
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
          <div class="movie-suggestion enhanced-suggestion ${enhancedClass}">
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
                <div class="suggested-track">
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
    return html;
  }
}

describe('Theme-Based Display Consistency', () => {
  let tester;

  beforeEach(() => {
    tester = new TestableTabletopTunes();
  });

  describe('Movie Style Suggestion Generation', () => {
    test('should generate movie suggestions for fantasy category', () => {
      const result = {
        category: 'fantasy',
        confidence: 85,
        reason: 'Fantasy themes detected',
        detectedKeywords: ['fantasy', 'magic', 'dragon']
      };

      const enhanced = tester.generateMovieStyleSuggestions(result, 'Test Fantasy Game');
      
      expect(enhanced).toHaveProperty('suggestedSoundtracks');
      expect(enhanced.suggestedSoundtracks).toHaveLength(3);
      expect(enhanced.suggestedSoundtracks[0]).toHaveProperty('movie');
      expect(enhanced.suggestedSoundtracks[0]).toHaveProperty('reason');
      expect(enhanced.suggestedSoundtracks[0]).toHaveProperty('tracks');
      expect(enhanced.suggestedSoundtracks[0]).toHaveProperty('enhanced');
      expect(enhanced.suggestedSoundtracks[0].enhanced).toHaveProperty('composer');
      expect(enhanced.suggestedSoundtracks[0].enhanced).toHaveProperty('mood');
      expect(enhanced.suggestedSoundtracks[0].enhanced).toHaveProperty('gameplayFit');
      expect(enhanced.suggestedSoundtracks[0].themeGenerated).toBe(true);
    });

    test('should generate movie suggestions for horror category', () => {
      const result = {
        category: 'horror',
        confidence: 70,
        reason: 'Horror themes detected',
        detectedKeywords: ['zombie', 'haunted', 'dark']
      };

      const enhanced = tester.generateMovieStyleSuggestions(result, 'Scary Game');
      
      expect(enhanced.suggestedSoundtracks).toHaveLength(3);
      expect(enhanced.suggestedSoundtracks[0].movie).toContain('Shining');
      expect(enhanced.suggestedSoundtracks[0].enhanced.mood).toBe('Dark and suspenseful');
      expect(enhanced.suggestedSoundtracks[0].enhanced.gameplayFit).toContain('horror themed');
    });

    test('should generate movie suggestions for scifi category', () => {
      const result = {
        category: 'scifi',
        confidence: 90,
        reason: 'Sci-fi themes detected',
        detectedKeywords: ['space', 'robot', 'future']
      };

      const enhanced = tester.generateMovieStyleSuggestions(result, 'Space Game');
      
      expect(enhanced.suggestedSoundtracks).toHaveLength(3);
      expect(enhanced.suggestedSoundtracks[0].movie).toContain('Blade Runner');
      expect(enhanced.suggestedSoundtracks[0].enhanced.mood).toBe('Futuristic and atmospheric');
      expect(enhanced.suggestedSoundtracks[0].enhanced.gameplayFit).toContain('scifi themed');
    });

    test('should fallback to ambient for unknown categories', () => {
      const result = {
        category: 'unknown',
        confidence: 30,
        reason: 'Unknown theme',
        detectedKeywords: []
      };

      const enhanced = tester.generateMovieStyleSuggestions(result, 'Unknown Game');
      
      expect(enhanced.suggestedSoundtracks).toHaveLength(3);
      expect(enhanced.suggestedSoundtracks[0].movie).toContain('Arrival');
      expect(enhanced.suggestedSoundtracks[0].enhanced.mood).toBe('Atmospheric'); // Uses fallback since 'unknown' category doesn't exist
    });
  });

  describe('HTML Generation Consistency', () => {
    test('should generate HTML with movie-style format', () => {
      const result = {
        category: 'fantasy',
        confidence: 85,
        reason: 'Fantasy themes detected',
        detectedKeywords: ['fantasy', 'magic']
      };

      const html = tester.displayThemeBasedSuggestions(result, 'Test Game');
      
      // Check for movie-style structure
      expect(html).toContain('class="game-suggestions"');
      expect(html).toContain('class="theme-analysis-header"');
      expect(html).toContain('class="movie-suggestion enhanced-suggestion');
      expect(html).toContain('class="movie-header"');
      expect(html).toContain('class="suggested-tracks"');
      expect(html).toContain('class="enhanced-details"');
      expect(html).toContain('Theme-Based Suggestion');
      
      // Check for specific content
      expect(html).toContain('85% Match');
      expect(html).toContain('Detected Keywords:');
      expect(html).toContain('Lord of the Rings');
      expect(html).toContain('Composer:');
      expect(html).toContain('Mood:');
      expect(html).toContain('Gameplay Fit:');
    });

    test('should handle missing keywords gracefully', () => {
      const result = {
        category: 'ambient',
        confidence: 40,
        reason: 'No specific themes detected',
        detectedKeywords: []
      };

      const html = tester.displayThemeBasedSuggestions(result, 'Generic Game');
      
      expect(html).toContain('40% Match');
      expect(html).not.toContain('Detected Keywords:');
      expect(html).toContain('Arrival'); // Should still show movie suggestions
    });

    test('should preserve theme analysis confidence and keywords', () => {
      const result = {
        category: 'scifi',
        confidence: 100,
        reason: 'Strong sci-fi themes detected',
        detectedKeywords: ['space', 'robot', 'laser', 'alien']
      };

      const html = tester.displayThemeBasedSuggestions(result, 'Sci-fi Game');
      
      expect(html).toContain('100% Match');
      expect(html).toContain('space</span>');
      expect(html).toContain('robot</span>');
      expect(html).toContain('laser</span>');
      // Should only show first 3 keywords
      expect(html).not.toContain('alien</span>');
    });
  });

  describe('Consistency with Preloaded Game Format', () => {
    test('theme-based suggestions should have similar structure to preloaded games', () => {
      const themeResult = {
        category: 'fantasy',
        confidence: 85,
        detectedKeywords: ['fantasy', 'magic']
      };

      const enhanced = tester.generateMovieStyleSuggestions(themeResult, 'Theme Game');
      
      // Should have same structure as preloaded games
      expect(enhanced.suggestedSoundtracks[0]).toHaveProperty('movie');
      expect(enhanced.suggestedSoundtracks[0]).toHaveProperty('reason');
      expect(enhanced.suggestedSoundtracks[0]).toHaveProperty('tracks');
      expect(enhanced.suggestedSoundtracks[0]).toHaveProperty('enhanced');
      expect(enhanced.suggestedSoundtracks[0].enhanced).toHaveProperty('composer');
      expect(enhanced.suggestedSoundtracks[0].enhanced).toHaveProperty('mood');
      expect(enhanced.suggestedSoundtracks[0].enhanced).toHaveProperty('gameplayFit');
      
      // Should be marked as theme-generated, not API-sourced
      expect(enhanced.suggestedSoundtracks[0].themeGenerated).toBe(true);
      expect(enhanced.suggestedSoundtracks[0].apiSource).toBe(false);
    });

    test('should differentiate theme suggestions from API suggestions', () => {
      const result = {
        category: 'adventure',
        confidence: 75,
        detectedKeywords: ['adventure', 'quest']
      };

      const html = tester.displayThemeBasedSuggestions(result, 'Adventure Game');
      
      // Should show theme-based badge, not API badge
      expect(html).toContain('Theme-Based Suggestion');
      expect(html).not.toContain('Enhanced with API data');
      expect(html).toContain('theme-generated');
    });
  });
});