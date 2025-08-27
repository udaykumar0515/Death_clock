const { app, BrowserWindow, ipcMain, globalShortcut, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let isAlwaysOnTop = false;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 240,
    height: 100,
    minWidth: 200,
    minHeight: 80,
    frame: false, // Frameless for widget-like appearance
    transparent: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    resizable: true,
    movable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, 'icon.png')
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set up the menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'Death Clock',
      submenu: [
        {
          label: 'Toggle Always on Top',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            isAlwaysOnTop = !isAlwaysOnTop;
            mainWindow.setAlwaysOnTop(isAlwaysOnTop, 'floating');
            mainWindow.webContents.send('always-on-top-changed', isAlwaysOnTop);
          }
        },
        {
          label: 'Toggle Minimize to Tray',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.minimize();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Timer',
      submenu: [
        {
          label: 'Start/Stop Timer',
          accelerator: 'Space',
          click: () => {
            mainWindow.webContents.send('timer-toggle');
          }
        },
        {
          label: 'Reset Timer',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('timer-reset');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Expanded View',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('toggle-view');
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+F5',
          click: () => {
            mainWindow.reload();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('window-controls', (event, action) => {
  switch (action) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'close':
      mainWindow.close();
      break;
    case 'toggle-always-on-top':
      isAlwaysOnTop = !isAlwaysOnTop;
      mainWindow.setAlwaysOnTop(isAlwaysOnTop, 'floating');
      return isAlwaysOnTop;
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// App event listeners
app.whenReady().then(() => {
  createWindow();

  // Register global shortcuts
  globalShortcut.register('CommandOrControl+Alt+D', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});
