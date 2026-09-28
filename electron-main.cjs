const { app, BrowserWindow, session, Menu } = require("electron");
const path = require("path");

require("./desktop/main-process.cjs");

// GPU settings must be configured before app is ready
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");

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
      "0.2.0_0"
    );

    const ext = await session.defaultSession.loadExtension(extPath, {
      allowFileAccess: true,
    });

    console.log("Loaded:", ext.name);
  } catch (err) {
    console.error("Failed to load OPFS extension:", err);
  }
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: true,
    backgroundColor: "#020617",
    icon: path.join(__dirname, "public", "favicon.ico"),

    titleBarStyle: "hidden",

    webPreferences: {
      preload: path.join(__dirname, "desktop", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (!app.isPackaged) {
    win.webContents.on("before-input-event", (event, input) => {
      if (
        input.type === "keyDown" &&
        input.control &&
        input.key.toLowerCase() === "r"
      ) {
        win.reload();
        event.preventDefault();
        return;
      }

      if (input.type === "keyDown" && input.key === "F12") {
        win.webContents.toggleDevTools();
        event.preventDefault();
        return;
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

  // Splash
  await win.loadFile(
    path.join(__dirname, "desktop", "splash.html")
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // App
  if (!app.isPackaged) {
    await win.loadURL(
      "https://localhost:5173/add-blocks"
    );
  } else {
    await win.loadURL(
      "https://infinitely.pages.dev/add-blocks"
    );
  }

  return win;
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);

  await installOPFS_Ext();
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});