const { LLM } = require("@themaximalist/llm.js");
const { ipcMain, BrowserWindow, app, shell } = require("electron");
const { openDropboxAuth } = require("./utils/dropboxOAuth.cjs");



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

ipcMain.on('reload-electron-app', (event) => {
  // Get the window that sent the event
  const win = BrowserWindow.fromWebContents(event.sender);
  
  if (win) {
    // Normal reload:
    win.reload(); 
    
    // OR, if you want a HARD reload (clears cache):
    // win.webContents.reloadIgnoringCache(); 
  }
});

ipcMain.handle("app:version", () => {
  return app.getVersion();
});

ipcMain.handle(
  "dropbox:open-auth",
  async (event, authUrl) => {

    if (
      typeof authUrl !== "string" ||
      !authUrl
    ) {
      throw new Error(
        "Invalid Dropbox authorization URL"
      );
    }


    const mainWindow =
      BrowserWindow.fromWebContents(
        event.sender
      );


    if (!mainWindow) {
      throw new Error(
        "Could not find main Electron window"
      );
    }


    console.log(
      "[Dropbox OAuth] Opening authorization URL:",
      authUrl
    );


    openDropboxAuth(
      authUrl,
      mainWindow
    );


    return true;
  }
);