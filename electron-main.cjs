const { app, BrowserWindow, session, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

require("./main-process.cjs");
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

    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#0f172a", // matches your bg-slate-900
      symbolColor: "#ffffff",
      height: 40,
    },
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (!app.isPackaged) {
    win.webContents.on("before-input-event", (event, input) => {
      if (
        // input.type === "keyDown" &&
        input.control &&
        input.key.toLowerCase() === "r"
      ) {
        win.reload();
        event.preventDefault();
      }

      if (input.type === "keyDown" && input.key === "F12") {
        win.webContents.toggleDevTools();
        event.preventDefault();
      }

      if (
        input.type === "keyDown" &&
        input.control &&
        input.shift &&
        input.key.toLowerCase() === "i"
      ) {
        win.webContents.toggleDevTools();
        event.preventDefault();
      }
    });
  }

  await win.loadFile(path.join(__dirname, "splash.html"));

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!app.isPackaged) {
    await win.loadURL("https://localhost:5173");
  } else {
    await win.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
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
