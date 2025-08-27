const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  windowControls: (action) => ipcRenderer.invoke('window-controls', action),

  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Event listeners
  onAlwaysOnTopChanged: (callback) => {
    ipcRenderer.on('always-on-top-changed', callback);
    return () => ipcRenderer.removeListener('always-on-top-changed', callback);
  },

  onTimerToggle: (callback) => {
    ipcRenderer.on('timer-toggle', callback);
    return () => ipcRenderer.removeListener('timer-toggle', callback);
  },

  onTimerReset: (callback) => {
    ipcRenderer.on('timer-reset', callback);
    return () => ipcRenderer.removeListener('timer-reset', callback);
  },

  onToggleView: (callback) => {
    ipcRenderer.on('toggle-view', callback);
    return () => ipcRenderer.removeListener('toggle-view', callback);
  }
});
