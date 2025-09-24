const { contextBridge, ipcRenderer } = require('electron');

// Expose Electron APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  getAppName: () => ipcRenderer.invoke('app-name'),
  
  // Menu actions
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-playlist', callback);
    ipcRenderer.on('menu-open-playlist', callback);
    ipcRenderer.on('menu-save-playlist', callback);
    ipcRenderer.on('menu-play-pause', callback);
    ipcRenderer.on('menu-previous', callback);
    ipcRenderer.on('menu-next', callback);
    ipcRenderer.on('menu-shuffle', callback);
    ipcRenderer.on('menu-loop', callback);
  },
  
  // Remove listeners
  removeMenuListeners: () => {
    ipcRenderer.removeAllListeners('menu-new-playlist');
    ipcRenderer.removeAllListeners('menu-open-playlist');
    ipcRenderer.removeAllListeners('menu-save-playlist');
    ipcRenderer.removeAllListeners('menu-play-pause');
    ipcRenderer.removeAllListeners('menu-previous');
    ipcRenderer.removeAllListeners('menu-next');
    ipcRenderer.removeAllListeners('menu-shuffle');
    ipcRenderer.removeAllListeners('menu-loop');
  }
});

// Set up electron-specific functionality when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  // Add electron class to body for styling
  document.body.classList.add('electron-app');
  
  // Hide PWA install prompt in Electron
  const installPrompt = document.getElementById('install-prompt');
  if (installPrompt) {
    installPrompt.style.display = 'none';
  }
});