const { ipcMain, BrowserWindow } = require("electron");

ipcMain.on("window:minimize", (event) => {
  BrowserWindow
    .fromWebContents(event.sender)
    ?.minimize();
});

ipcMain.on("window:maximize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);

  if (!win) return;

  win.isMaximized()
    ? win.unmaximize()
    : win.maximize();
});

ipcMain.on("window:close", (event) => {
  BrowserWindow
    .fromWebContents(event.sender)
    ?.close();
});