const { app } = require("electron");
const { autoUpdater } = require("electron-updater");
let mainWindow = null;
function send(channel, data = {}) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send(channel, data);
}
function setupUpdater(window) {
  mainWindow = window;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.on("checking-for-update", () => {
    console.log("[Updater] Checking for updates...");
    send("update:checking");
  });
  autoUpdater.on("update-available", (info) => {
    console.log("[Updater] Update available:", info.version);
    send("update:available", {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });
  autoUpdater.on("update-not-available", (info) => {
    console.log("[Updater] App is up to date:", info.version);
    send("update:not-available", { version: info.version });
  });
  autoUpdater.on("download-progress", (progress) => {
    send("update:progress", {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
      bytesPerSecond: progress.bytesPerSecond,
    });
  });
  autoUpdater.on("update-downloaded", (info) => {
    console.log("[Updater] Update downloaded:", info.version);
    send("update:downloaded", { version: info.version });
  });
  autoUpdater.on("error", (error) => {
    console.error("[Updater] Error:", error);
    send("update:error", { message: error?.message || String(error) });
  });
}
async function checkForUpdates() {
  if (!app.isPackaged) {
    console.log("[Updater] Update check skipped in development.");
    send("update:error", {
      message:
        "Automatic updates are only available in the packaged application.",
    });
    return { success: false, reason: "development" };
  }
  try {
    await autoUpdater.checkForUpdates();
    return { success: true };
  } catch (error) {
    console.error("[Updater] Check failed:", error);
    send("update:error", { message: error?.message || String(error) });
    return { success: false, error: error?.message || String(error) };
  }
}
async function downloadUpdate() {
  if (!app.isPackaged) {
    send("update:error", {
      message: "Updates cannot be downloaded in development mode.",
    });
    return { success: false, reason: "development" };
  }
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    console.error("[Updater] Download failed:", error);
    send("update:error", { message: error?.message || String(error) });
    return { success: false, error: error?.message || String(error) };
  }
}
function installUpdate() {
  if (!app.isPackaged) {
    send("update:error", {
      message: "Updates cannot be installed in development mode.",
    });
    return { success: false, reason: "development" };
  }
  autoUpdater.quitAndInstall();
  return { success: true };
}
module.exports = {
  setupUpdater,
  checkForUpdates,
  downloadUpdate,
  installUpdate,
};
