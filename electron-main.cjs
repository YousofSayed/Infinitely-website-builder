const { app, BrowserWindow } = require('electron');
const path = require('path');
// import {app , BrowserWindow} from 'electron'
// import path from 'path'

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'public', 'icons', 'favicon.ico'),// process.platform === 'darwin' ? 'icon.icns' : 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      
      preload: path.join(__dirname, 'preload.js'), // Optional, for IPC
    },
  });

  // In development, load Vite's dev server
  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173'); // Vite's default port
  } else {
    // In production, load the built index.html
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

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