const { app, BrowserWindow, session } = require("electron");
const path = require("path");
const fs = require("fs");
// import {app , BrowserWindow} from 'electron'
// import path from 'path'

async function installOPFS_Ext() {
  if (app.isPackaged) return;

  try {
    const extPath = path.join(
      process.env.LOCALAPPDATA,
      "Microsoft",
      "Edge",
      "User Data",
      "Default",
      "Extensions",
      "odbpcdmkgeikdcmcdlfmdkbjiaeknnbd",
      "0.1.3_0",
    );

    const ext = await session.defaultSession.loadExtension(extPath, {
      allowFileAccess: true,
    });

    console.log("Loaded:", ext.name);
  } catch (err) {
    console.error(err);
  }
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: true,
    backgroundColor: "#020617",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  await win.loadFile(path.join(__dirname, "splash.html"));

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!app.isPackaged) {
    await win.loadURL("https://127.0.0.1:5173");
  } else {
    await win.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  await installOPFS_Ext();
  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
