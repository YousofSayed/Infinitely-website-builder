const { app, BrowserWindow, session, Menu, ipcMain } = require("electron");
const path = require("path");

require("./desktop/main-process.cjs");

const {
  setupUpdater,
  checkForUpdates,
  downloadUpdate,
  installUpdate,
} = require("./desktop/utils/updater.cjs");

// ============================================================
// 1. CRITICAL FIX: CHROMIUM SANDBOX OVERRIDE
// Must be called BEFORE app.whenReady()
// ============================================================
app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");

// ============================================================
// UPDATER IPC
// ============================================================
ipcMain.handle("update:check", checkForUpdates);
ipcMain.handle("update:download", downloadUpdate);
ipcMain.handle("update:install", installUpdate);

let mainWindow = null;
let splashWindow = null;

// ============================================================
// OPFS EXTENSION
// ============================================================
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
      "0.2.0_0",
      "0.2.0_0"
    );

    const ext = await session.defaultSession.extensions.loadExtension(extPath, {
      allowFileAccess: true,
    });

    console.log("Loaded:", ext.name);
  } catch (err) {
    console.error("Failed to load OPFS extension:", err);
  }
}

// ============================================================
// WINDOW
// ============================================================
async function createWindow() {
  // ---------------------------------------------------------
  // A. CREATE SPLASH WINDOW (file:// origin)
  // ---------------------------------------------------------
  splashWindow = new BrowserWindow({
    width: 1400, // Adjust to your splash dimensions
    height: 900,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    show: false,
    // skipTaskbar: true,
    icon: path.join(__dirname, "public", "favicon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  await splashWindow.loadFile(path.join(__dirname, "desktop", "splash.html"));
  splashWindow.show();

  // ---------------------------------------------------------
  // B. CREATE MAIN WINDOW (hidden, https:// origin)
  // ---------------------------------------------------------
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false, // IMPORTANT: Keep hidden until loaded
    backgroundColor: "#020617",
    icon: path.join(__dirname, "public", "favicon.ico"),
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "desktop", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      focusOnNavigation: false,
      partition: "persist:infinitely",
    },
  });

  mainWindow = win;

  win.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.control && input.key.toLowerCase() === "r") {
      win.reload();
      event.preventDefault();
      return;
    }
    if (input.type === "keyDown" && input.key === "F12") {
      win.webContents.toggleDevTools();
      event.preventDefault();
      return;
    }
    if (input.type === "keyDown" && input.control && input.shift && input.key.toLowerCase() === "i") {
      win.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // ---------------------------------------------------------
  // C. LOAD HTTPS URL DIRECTLY IN MAIN WINDOW
  // This prevents cross-origin navigation (file:// -> https://)
  // which destroys the ServiceWorkerProvider in Chromium.
  // ---------------------------------------------------------
  const targetURL = app.isPackaged
    ? "https://infinitely.pages.dev/add-blocks"
    : "https://localhost:5173/add-blocks";

  try {
    await win.loadURL(targetURL);
  } catch (err) {
    console.error("Failed to load URL:", err);
  }

  // ---------------------------------------------------------
  // D. SWAP WINDOWS
  // Wait for the main window to render, then kill splash.
  // ---------------------------------------------------------
  win.once("ready-to-show", () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    win.show();
  });

  // Fallback: If ready-to-show takes too long, force close splash after 5 seconds
  setTimeout(() => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    if (win && !win.isVisible()) {
      win.show();
    }
  }, 5000);

  return win;
}

// ============================================================
// APP READY
// ============================================================
app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  await installOPFS_Ext();

  const win = await createWindow();
  setupUpdater(win);

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWindow = await createWindow();
      setupUpdater(newWindow);
    }
  });
});

// ============================================================
// WINDOWS CLOSED
// ============================================================
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});


// const { app, BrowserWindow, session, Menu, ipcMain } = require("electron");

// const path = require("path");

// require("./desktop/main-process.cjs");

// const {
//   setupUpdater,
//   checkForUpdates,
//   downloadUpdate,
//   installUpdate,
// } = require("./desktop/utils/updater.cjs");

// // ============================================================
// // UPDATER IPC
// // ============================================================

// ipcMain.handle("update:check", checkForUpdates);
// ipcMain.handle("update:download", downloadUpdate);
// ipcMain.handle("update:install", installUpdate);

// // ============================================================
// // GPU
// // ============================================================

// app.commandLine.appendSwitch("enable-gpu-rasterization");
// app.commandLine.appendSwitch("enable-zero-copy");

// let mainWindow = null;

// // ============================================================
// // OPFS EXTENSION
// // ============================================================

// async function installOPFS_Ext() {
//   if (app.isPackaged) return;

//   try {
//     const extPath = path.join(
//       process.env.LOCALAPPDATA,
//       "Microsoft",
//       "Edge",
//       "User Data",
//       "Default",
//       "Extensions",
//       "odbpcdmkgeikdcmcdlfmdkbjiaeknnbd",
//       "0.2.0_0",
//     );

//     const ext = await session.defaultSession.extensions.loadExtension(extPath, {
//       allowFileAccess: true,
//     });

//     console.log("Loaded:", ext.name);
//   } catch (err) {
//     console.error("Failed to load OPFS extension:", err);
//   }
// }

// // ============================================================
// // WINDOW
// // ============================================================

// async function createWindow() {
//   const win = new BrowserWindow({
//     width: 1400,
//     height: 900,
//     show: true,
//     backgroundColor: "#020617",
//     icon: path.join(__dirname, "public", "favicon.ico"),

//     titleBarStyle: "hidden",

//     webPreferences: {
//       preload: path.join(__dirname, "desktop", "preload.cjs"),
//       contextIsolation: true,
//       nodeIntegration: false,
//       sandbox: false,
//       focusOnNavigation: false,
//       partition: "persist:infinitely",
//     },
//   });

//   mainWindow = win;

//   // win.on("focus", () => {
//   //   if (!win.isDestroyed()) {
//   //     win.webContents.focus();
//   //   }
//   // });

//   // Development shortcuts
//   // if (!app.isPackaged) {
//     win.webContents.on("before-input-event", (event, input) => {
//       if (
//         input.type === "keyDown" &&
//         input.control &&
//         input.key.toLowerCase() === "r"
//       ) {
//         win.reload();
//         event.preventDefault();
//         return;
//       }

//       if (input.type === "keyDown" && input.key === "F12") {
//         win.webContents.toggleDevTools();
//         event.preventDefault();
//         return;
//       }

//       if (
//         input.type === "keyDown" &&
//         input.control &&
//         input.shift &&
//         input.key.toLowerCase() === "i"
//       ) {
//         win.webContents.toggleDevTools();
//         event.preventDefault();
//       }
//     });
//   // }

//   // Splash
//   await win.loadFile(path.join(__dirname, "desktop", "splash.html"));

//   await new Promise((resolve) => setTimeout(resolve, 1000));

//   // App
//   await win.loadURL(
//     app.isPackaged
//       ? "https://infinitely.pages.dev/add-blocks"
//       : "https://localhost:5173/add-blocks",
//   );

//   // win.show();
//   // win.focus();

//   return win;
// }
// // ============================================================
// // APP READY
// // ============================================================

// app.whenReady().then(async () => {
//   Menu.setApplicationMenu(null);

//   await installOPFS_Ext();

//   const win = await createWindow();

//   // Setup updater AFTER BrowserWindow exists
//   setupUpdater(win);

//   // ----------------------------------------------------------
//   // macOS
//   // ----------------------------------------------------------

//   app.on("activate", async () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//       const newWindow = await createWindow();

//       setupUpdater(newWindow);
//     }
//   });
// });

// // ============================================================
// // WINDOWS CLOSED
// // ============================================================

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });
