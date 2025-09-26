// // This section imports necessary modules and sets up initial state for the Electron app.

// // Import Electron modules: app (controls app lifecycle), BrowserWindow (creates windows), 
// // ipcMain (handles inter-process communication), globalShortcut (registers keyboard shortcuts), Menu (manages app menus)
// const { app, BrowserWindow, ipcMain, globalShortcut, Menu } = require('electron');
// const path = require('path');
// const isDev = require('electron-is-dev');

// let mainWindow;
// let isAlwaysOnTop = false;

// // Widget size constants
// const COLLAPSED_SIZE = { width: 240, height: 100 }; // Only timer visible
// const EXPANDED_SIZE = { width: 360, height: 220 };  // Expanded for settings, etc.

// let isExpanded = false;

// function createWindow() {
//   // Get screen dimensions
//   const { screen } = require('electron');
//   const primaryDisplay = screen.getPrimaryDisplay();
//   const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
//   // Calculate position for top right corner
//   const windowX = screenWidth - COLLAPSED_SIZE.width - 20; // 20px margin from right edge
//   const windowY = 20; // 20px margin from top edge

//   // Create the browser window
//   mainWindow = new BrowserWindow({
//     width: COLLAPSED_SIZE.width,
//     height: COLLAPSED_SIZE.height,
//     x: windowX,
//     y: windowY,
//     minWidth: 200,
//     minHeight: 80,
//     frame: false, // Frameless for widget-like appearance
//     transparent: true,
//     alwaysOnTop: false,
//     skipTaskbar: true,
//     resizable: true,
//     movable: true,
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//       enableRemoteModule: false,
//       preload: path.join(__dirname, 'preload.js'),
//       webSecurity: true
//     },
//     titleBarStyle: 'hidden',
//     icon: path.join(__dirname, 'icon.png')
//   });

//   // Load the app
//   const startUrl = isDev 
//     ? 'http://localhost:3000' 
//     : `file://${path.join(__dirname, '../build/index.html')}`;

//   mainWindow.loadURL(startUrl);

//   // DevTools disabled by default. Uncomment to enable during development
//   // if (isDev) {
//   //   mainWindow.webContents.openDevTools();
//   // }

//   // Handle window closed
//   mainWindow.on('closed', () => {
//     mainWindow = null;
//   });

//   // Hide the default application menu for a true widget feel
//   Menu.setApplicationMenu(null);
// }

// function createMenu() {
//   const template = [
//     {
//       label: 'Death Clock',
//       submenu: [
//         {
//           label: 'Toggle Always on Top',
//           accelerator: 'CmdOrCtrl+T',
//           click: () => {
//             isAlwaysOnTop = !isAlwaysOnTop;
//             mainWindow.setAlwaysOnTop(isAlwaysOnTop, 'floating');
//             mainWindow.webContents.send('always-on-top-changed', isAlwaysOnTop);
//           }
//         },
//         {
//           label: 'Toggle Minimize to Tray',
//           accelerator: 'CmdOrCtrl+M',
//           click: () => {
//             mainWindow.minimize();
//           }
//         },
//         { type: 'separator' },
//         {
//           label: 'Quit',
//           accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
//           click: () => {
//             app.quit();
//           }
//         }
//       ]
//     },
//     {
//       label: 'Timer',
//       submenu: [
//         {
//           label: 'Start/Stop Timer',
//           accelerator: 'Space',
//           click: () => {
//             mainWindow.webContents.send('timer-toggle');
//           }
//         },
//         {
//           label: 'Reset Timer',
//           accelerator: 'CmdOrCtrl+R',
//           click: () => {
//             mainWindow.webContents.send('timer-reset');
//           }
//         }
//       ]
//     },
//     {
//       label: 'View',
//       submenu: [
//         {
//           label: 'Toggle Expanded View',
//           accelerator: 'CmdOrCtrl+E',
//           click: () => {
//             mainWindow.webContents.send('toggle-view');
//           }
//         },
//         {
//           label: 'Reload',
//           accelerator: 'CmdOrCtrl+F5',
//           click: () => {
//             mainWindow.reload();
//           }
//         }
//       ]
//     }
//   ];

//   const menu = Menu.buildFromTemplate(template);
//   Menu.setApplicationMenu(menu);
// }

// // IPC handlers

// // Handle window controls (minimize, close, always on top)
// ipcMain.handle('window-controls', (event, action) => {
//   switch (action) {
//     case 'minimize':
//       mainWindow.minimize();
//       break;
//     case 'close':
//       mainWindow.close();
//       break;
//     case 'toggle-always-on-top':
//       isAlwaysOnTop = !isAlwaysOnTop;
//       mainWindow.setAlwaysOnTop(isAlwaysOnTop, 'floating');
//       return isAlwaysOnTop;
//   }
// });

// ipcMain.handle('get-app-version', () => {
//   return app.getVersion();
// });

// // ---
// // Widget expand/collapse logic for 3-dots button:
// // When renderer sends 'toggle-widget-expand', toggle between expanded and collapsed sizes.
// // This will automatically resize the window when the 3-dots is pressed, no manual resizing needed.
// // ---

// ipcMain.on('toggle-widget-expand', () => {
//   if (!mainWindow) return;
//   isExpanded = !isExpanded;
//   if (isExpanded) {
//     mainWindow.setSize(EXPANDED_SIZE.width, EXPANDED_SIZE.height, true);
//   } else {
//     mainWindow.setSize(COLLAPSED_SIZE.width, COLLAPSED_SIZE.height, true);
//   }
//   // Optionally, inform renderer of the new state
//   mainWindow.webContents.send('widget-expand-state', isExpanded);
// });

// // Optionally, allow renderer to force collapse (e.g. after timer set)
// ipcMain.on('collapse-widget', () => {
//   if (!mainWindow) return;
//   isExpanded = false;
//   mainWindow.setSize(COLLAPSED_SIZE.width, COLLAPSED_SIZE.height, true);
//   mainWindow.webContents.send('widget-expand-state', isExpanded);
// });

// // Handle time and date setting
// ipcMain.handle('set-time', (event, timeString) => {
//   console.log('set-time handler called with:', timeString);
  
//   // Validate time format (HH:MM)
//   const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
//   if (!timeRegex.test(timeString)) {
//     console.log('Invalid time format:', timeString);
//     throw new Error('Invalid time format. Use HH:MM format.');
//   }
  
//   console.log('Time validation passed, sending to renderer:', timeString);
//   // Send the time to renderer process
//   mainWindow.webContents.send('time-set', timeString);
//   return { success: true, time: timeString };
// });

// ipcMain.handle('set-date', (event, dateString) => {
//   console.log('set-date handler called with:', dateString);
  
//   // Validate date format (YYYY-MM-DD)
//   const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//   if (!dateRegex.test(dateString)) {
//     console.log('Invalid date format:', dateString);
//     throw new Error('Invalid date format. Use YYYY-MM-DD format.');
//   }
  
//   // Validate that the date is valid
//   const date = new Date(dateString);
//   if (isNaN(date.getTime())) {
//     console.log('Invalid date object:', dateString);
//     throw new Error('Invalid date.');
//   }
  
//   console.log('Date validation passed, sending to renderer:', dateString);
//   // Send the date to renderer process
//   mainWindow.webContents.send('date-set', dateString);
//   return { success: true, date: dateString };
// });


// // App event listeners
// app.whenReady().then(() => {

//   createWindow();

//   // Register global shortcuts
//   globalShortcut.register('CommandOrControl+Alt+D', () => {
//     if (mainWindow) {
//       if (mainWindow.isVisible()) {
//         mainWindow.hide();
//       } else {
//         mainWindow.show();
//         mainWindow.focus();
//       }
//     }
//   });

//   // Removed auto-startup functionality - app will not start automatically when laptop opens
//   // app.on('activate', () => {
//   //   if (BrowserWindow.getAllWindows().length === 0) {
//   //     createWindow();
//   //   }
//   // });
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }

// });

// app.on('will-quit', () => {
//   // Unregister all shortcuts
//   globalShortcut.unregisterAll();
// });
