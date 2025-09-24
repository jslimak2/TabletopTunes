import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tabletoptunes.app',
  appName: 'TabletopTunes',
  webDir: '.',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {
      launchUrl: 'index.html'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      androidSplashResourceName: 'splash',
      showSpinner: true,
      spinnerColor: '#4ecdc4'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a2e'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;