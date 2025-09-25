/**
 * End-to-End tests for TabletopTunes application
 * Tests the complete user workflows using Playwright
 */

const { test, expect } = require('@playwright/test');

test.describe('TabletopTunes E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start the development server and navigate to the app
    await page.goto('http://localhost:8000');
    
    // Wait for the app to load
    await page.waitForSelector('h1:has-text("TabletopTunes")');
  });

  test.describe('Application Loading', () => {
    test('should load the main page correctly', async ({ page }) => {
      // Check page title
      await expect(page).toHaveTitle(/TabletopTunes/);
      
      // Check main heading
      await expect(page.locator('h1')).toContainText('TabletopTunes');
      
      // Check tagline
      await expect(page.locator('p')).toContainText('Where Board Games Meet Cinematic Soundscapes');
      
      // Check navigation tabs
      await expect(page.locator('.nav-btn')).toHaveCount(4);
    });

    test('should display all soundtrack categories', async ({ page }) => {
      const categories = page.locator('.category-card');
      await expect(categories).toHaveCount(6);
      
      // Check specific categories exist
      await expect(page.locator('.category-card:has-text("Fantasy")')).toBeVisible();
      await expect(page.locator('.category-card:has-text("Horror")')).toBeVisible();
      await expect(page.locator('.category-card:has-text("Sci-Fi")')).toBeVisible();
      await expect(page.locator('.category-card:has-text("Ambient")')).toBeVisible();
      await expect(page.locator('.category-card:has-text("Adventure")')).toBeVisible();
      await expect(page.locator('.category-card:has-text("Tavern")')).toBeVisible();
    });

    test('should have audio player controls', async ({ page }) => {
      await expect(page.locator('#play-pause-btn')).toBeVisible();
      await expect(page.locator('#prev-btn')).toBeVisible();
      await expect(page.locator('#next-btn')).toBeVisible();
      await expect(page.locator('#shuffle-btn')).toBeVisible();
      await expect(page.locator('#loop-btn')).toBeVisible();
      await expect(page.locator('#volume-slider')).toBeVisible();
    });
  });

  test.describe('Game Search Functionality', () => {
    test('should search for a known board game', async ({ page }) => {
      // Enter a game name
      await page.fill('#game-search', 'Gloomhaven');
      
      // Click search button
      await page.click('#search-game-btn');
      
      // Wait for results
      await page.waitForTimeout(1000);
      
      // Check that recommendations appear
      await expect(page.locator('h2')).toContainText('Recommendations for Gloomhaven');
      
      // Check that movie suggestions are displayed
      const movieSuggestions = page.locator('.movie-suggestion');
      await expect(movieSuggestions.first()).toBeVisible();
    });

    test('should handle Enter key in search input', async ({ page }) => {
      await page.fill('#game-search', 'Pandemic');
      await page.press('#game-search', 'Enter');
      
      await page.waitForTimeout(1000);
      
      // Should show recommendations
      await expect(page.locator('h2')).toContainText('Recommendations for Pandemic');
    });

    test('should handle unknown game gracefully', async ({ page }) => {
      await page.fill('#game-search', 'UnknownGame12345');
      await page.click('#search-game-btn');
      
      await page.waitForTimeout(1000);
      
      // Should show a fallback message or default category
      const currentTrack = page.locator('#current-track');
      await expect(currentTrack).toBeVisible();
    });

    test('should use popular game buttons', async ({ page }) => {
      // Click on a popular game
      await page.click('.popular-game:has-text("Gloomhaven")');
      
      await page.waitForTimeout(1000);
      
      // Should show recommendations for that game
      await expect(page.locator('h2')).toContainText('Gloomhaven');
    });

    test('should use Surprise Me button', async ({ page }) => {
      await page.click('button:has-text("Surprise Me!")');
      
      await page.waitForTimeout(1000);
      
      // Should select a random category or game
      const currentTrack = page.locator('#current-track');
      await expect(currentTrack).not.toContainText('No track selected');
    });
  });

  test.describe('Category Selection', () => {
    test('should select Fantasy category', async ({ page }) => {
      await page.click('.category-card[data-category="fantasy"]');
      
      await page.waitForTimeout(500);
      
      // Check that fantasy music is loaded
      await expect(page.locator('#current-track')).toContainText("Dragon's Lair");
      await expect(page.locator('#current-category')).toContainText('Track 1 of 4');
      
      // Check playlist is populated
      const trackList = page.locator('#track-list .track-item');
      await expect(trackList.first()).toBeVisible();
    });

    test('should select Horror category', async ({ page }) => {
      await page.click('.category-card[data-category="horror"]');
      
      await page.waitForTimeout(500);
      
      // Check horror music is loaded
      await expect(page.locator('#current-track')).toContainText('Haunted Manor');
    });

    test('should switch between categories', async ({ page }) => {
      // Start with Fantasy
      await page.click('.category-card[data-category="fantasy"]');
      await page.waitForTimeout(500);
      await expect(page.locator('#current-track')).toContainText("Dragon's Lair");
      
      // Switch to Horror
      await page.click('.category-card[data-category="horror"]');
      await page.waitForTimeout(500);
      await expect(page.locator('#current-track')).toContainText('Haunted Manor');
    });
  });

  test.describe('Audio Player Controls', () => {
    test.beforeEach(async ({ page }) => {
      // Select a category to load music
      await page.click('.category-card[data-category="fantasy"]');
      await page.waitForTimeout(500);
    });

    test('should play and pause music', async ({ page }) => {
      // Initially should not be playing
      await expect(page.locator('#current-track')).toContainText("Dragon's Lair");
      
      // Click play
      await page.click('#play-pause-btn');
      await page.waitForTimeout(500);
      
      // Should show playing state
      await expect(page.locator('.player-status')).toContainText('Now playing');
      
      // Click pause
      await page.click('#play-pause-btn');
      await page.waitForTimeout(500);
    });

    test('should navigate between tracks', async ({ page }) => {
      // Check initial track
      await expect(page.locator('#current-track')).toContainText("Dragon's Lair");
      
      // Go to next track
      await page.click('#next-btn');
      await page.waitForTimeout(500);
      
      // Should change to next track
      await expect(page.locator('#current-track')).toContainText('Enchanted Forest');
      
      // Go to previous track
      await page.click('#prev-btn');
      await page.waitForTimeout(500);
      
      // Should go back to first track
      await expect(page.locator('#current-track')).toContainText("Dragon's Lair");
    });

    test('should toggle shuffle mode', async ({ page }) => {
      // Click shuffle button
      await page.click('#shuffle-btn');
      
      // Button should show active state (you may need to check CSS classes)
      const shuffleBtn = page.locator('#shuffle-btn');
      await expect(shuffleBtn).toHaveClass(/active/);
      
      // Click again to turn off
      await page.click('#shuffle-btn');
      await expect(shuffleBtn).not.toHaveClass(/active/);
    });

    test('should toggle loop mode', async ({ page }) => {
      await page.click('#loop-btn');
      
      const loopBtn = page.locator('#loop-btn');
      await expect(loopBtn).toHaveClass(/active/);
      
      await page.click('#loop-btn');
      await expect(loopBtn).not.toHaveClass(/active/);
    });

    test('should adjust volume', async ({ page }) => {
      const volumeSlider = page.locator('#volume-slider');
      
      // Change volume
      await volumeSlider.fill('50');
      
      // Check volume display updates
      await expect(page.locator('.volume-display')).toContainText('50%');
    });

    test('should clear playlist', async ({ page }) => {
      // Clear the current playlist
      await page.click('button:has-text("Clear current playlist")');
      
      await page.waitForTimeout(500);
      
      // Should show no track selected
      await expect(page.locator('#current-track')).toContainText('No track selected');
    });
  });

  test.describe('Playlist Management', () => {
    test.beforeEach(async ({ page }) => {
      // Load a category first
      await page.click('.category-card[data-category="fantasy"]');
      await page.waitForTimeout(500);
    });

    test('should save and load playlists', async ({ page }) => {
      // Enter playlist name
      await page.fill('#playlist-name', 'My Epic Fantasy Mix');
      
      // Save playlist
      await page.click('#save-playlist');
      
      await page.waitForTimeout(500);
      
      // Clear current playlist
      await page.click('button:has-text("Clear current playlist")');
      await page.waitForTimeout(500);
      
      // Load the saved playlist
      await page.fill('#playlist-name', 'My Epic Fantasy Mix');
      await page.click('#load-playlist');
      
      await page.waitForTimeout(500);
      
      // Should reload the fantasy tracks
      await expect(page.locator('#current-track')).toContainText("Dragon's Lair");
    });

    test('should display track list', async ({ page }) => {
      const trackItems = page.locator('#track-list .track-item');
      
      // Should have multiple tracks
      await expect(trackItems).toHaveCount(4); // Fantasy category has 4 tracks
      
      // Check first track details
      await expect(trackItems.first()).toContainText("Dragon's Lair");
      await expect(trackItems.first()).toContainText('Lord of the Rings');
    });
  });

  test.describe('Tab Navigation', () => {
    test('should switch to Spotify tab', async ({ page }) => {
      await page.click('button[data-tab="spotify"]');
      
      await page.waitForTimeout(500);
      
      // Should show Spotify content
      await expect(page.locator('#spotify-tab')).toBeVisible();
      await expect(page.locator('h2')).toContainText('Connect to Spotify');
    });

    test('should switch to How It Works tab', async ({ page }) => {
      await page.click('button[data-tab="how-it-works"]');
      
      await page.waitForTimeout(500);
      
      // Should show How It Works content
      await expect(page.locator('#how-it-works-tab')).toBeVisible();
      await expect(page.locator('h2')).toContainText('How TabletopTunes Works');
    });

    test('should switch to Live Insights tab', async ({ page }) => {
      await page.click('button[data-tab="visualization"]');
      
      await page.waitForTimeout(500);
      
      // Should show visualization content
      await expect(page.locator('#visualization-tab')).toBeVisible();
      await expect(page.locator('h2')).toContainText('Live Recommendation Insights');
    });

    test('should return to main tab', async ({ page }) => {
      // Go to another tab first
      await page.click('button[data-tab="spotify"]');
      await page.waitForTimeout(500);
      
      // Return to main
      await page.click('button[data-tab="main"]');
      await page.waitForTimeout(500);
      
      // Should show main content
      await expect(page.locator('#main-tab')).toBeVisible();
      await expect(page.locator('h2')).toContainText('Find Soundtracks for Your Board Game');
    });
  });

  test.describe('Quick Actions', () => {
    test('should use Start Ambient quick action', async ({ page }) => {
      await page.click('button:has-text("Start Ambient")');
      
      await page.waitForTimeout(500);
      
      // Should load ambient music
      await expect(page.locator('#current-track')).toContainText('Forest Whispers');
    });

    test('should use Epic Fantasy quick action', async ({ page }) => {
      await page.click('button:has-text("Epic Fantasy")');
      
      await page.waitForTimeout(500);
      
      // Should load fantasy music
      await expect(page.locator('#current-track')).toContainText("Dragon's Lair");
    });

    test('should use Horror Night quick action', async ({ page }) => {
      await page.click('button:has-text("Horror Night")');
      
      await page.waitForTimeout(500);
      
      // Should load horror music
      await expect(page.locator('#current-track')).toContainText('Haunted Manor');
    });

    test('should use Custom Mix quick action', async ({ page }) => {
      await page.click('button:has-text("Custom Mix")');
      
      await page.waitForTimeout(500);
      
      // Should trigger custom playlist creation
      const currentTrack = page.locator('#current-track');
      await expect(currentTrack).not.toContainText('No track selected');
    });
  });

  test.describe('Progressive Web App Features', () => {
    test('should show install prompt', async ({ page }) => {
      // Check if install prompt appears (this may be environment dependent)
      const installPrompt = page.locator('.install-prompt');
      if (await installPrompt.isVisible()) {
        await expect(installPrompt).toContainText('Install TabletopTunes');
        
        // Test dismiss functionality
        await page.click('button:has-text("Maybe Later")');
        await expect(installPrompt).not.toBeVisible();
      }
    });

    test('should work offline (basic check)', async ({ page, context }) => {
      // This is a basic check - full offline testing requires more setup
      await expect(page.locator('h1')).toContainText('TabletopTunes');
      
      // The service worker should be registered
      const serviceWorkerRegistration = await page.evaluate(() => {
        return navigator.serviceWorker.getRegistration();
      });
      
      expect(serviceWorkerRegistration).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check that main elements are still visible and functional
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#game-search')).toBeVisible();
      await expect(page.locator('.category-card').first()).toBeVisible();
      
      // Test category selection on mobile
      await page.click('.category-card[data-category="fantasy"]');
      await page.waitForTimeout(500);
      
      await expect(page.locator('#current-track')).toContainText("Dragon's Lair");
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.category-card')).toHaveCount(6);
      
      // Test functionality
      await page.click('.category-card[data-category="adventure"]');
      await page.waitForTimeout(500);
      
      await expect(page.locator('#current-track')).toContainText('Epic Quest');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle empty search gracefully', async ({ page }) => {
      // Try to search with empty input
      await page.click('#search-game-btn');
      
      await page.waitForTimeout(500);
      
      // Should show some kind of message or maintain current state
      const currentTrack = page.locator('#current-track');
      await expect(currentTrack).toBeVisible();
    });

    test('should handle invalid playlist names', async ({ page }) => {
      // Load a category first
      await page.click('.category-card[data-category="fantasy"]');
      await page.waitForTimeout(500);
      
      // Try to save with empty name
      await page.click('#save-playlist');
      
      // Should handle gracefully (may show message or do nothing)
      await expect(page.locator('#current-track')).toContainText("Dragon's Lair");
    });
  });
});