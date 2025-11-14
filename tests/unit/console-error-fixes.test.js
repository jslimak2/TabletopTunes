/**
 * Tests for console error fixes
 */

describe('Console Error Fixes', () => {
    let scriptContent;

    beforeAll(() => {
        const fs = require('fs');
        const path = require('path');
        scriptContent = fs.readFileSync(
            path.join(__dirname, '../../script.js'), 
            'utf-8'
        );
    });

    describe('Spotify SDK Callback', () => {
        test('should check for spotifySDKReady flag', () => {
            expect(scriptContent).toContain('window.spotifySDKReady = false');
            expect(scriptContent).toContain('window.spotifySDKReady = true');
        });

        test('should check if setupSpotifyPlayer is a function before calling', () => {
            expect(scriptContent).toContain("typeof window.tabletopTunes.setupSpotifyPlayer === 'function'");
        });

        test('should check if SDK is already ready in initializeSpotifyIntegration', () => {
            expect(scriptContent).toContain('window.spotifySDKReady');
        });
    });

    describe('Dynamic onclick handlers', () => {
        test('should use window.tabletopTunes for addGameFromThemeAnalysis', () => {
            expect(scriptContent).toContain('window.tabletopTunes.addGameFromThemeAnalysis');
            expect(scriptContent).not.toContain('onclick="tabletopTunes.addGameFromThemeAnalysis');
        });

        test('should use window.tabletopTunes for addGameFromBGG', () => {
            expect(scriptContent).toContain('window.tabletopTunes.addGameFromBGG');
            expect(scriptContent).not.toContain('onclick="tabletopTunes.addGameFromBGG');
        });
    });

    describe('Placeholder image generation', () => {
        test('should have generatePlaceholderImage method', () => {
            expect(scriptContent).toContain('generatePlaceholderImage(text, width, height, bgColor, textColor)');
        });

        test('should not use via.placeholder.com', () => {
            expect(scriptContent).not.toContain('via.placeholder.com');
        });

        test('should use canvas to generate placeholder images', () => {
            expect(scriptContent).toContain("document.createElement('canvas')");
            expect(scriptContent).toContain("canvas.toDataURL('image/png')");
        });
    });
});
