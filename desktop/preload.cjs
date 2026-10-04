const { contextBridge, ipcRenderer } = require("electron");
console.log("🔥 PRELOAD LOADED");



const electronUpdater = {
  check: () => ipcRenderer.invoke("update:check"),

  download: () => ipcRenderer.invoke("update:download"),

  install: () => ipcRenderer.invoke("update:install"),

  onChecking: (callback) => {
    const listener = () => callback();

    ipcRenderer.on("update:checking", listener);

    return () => {
      ipcRenderer.removeListener("update:checking", listener);
    };
  },

  onAvailable: (callback) => {
    const listener = (_, data) => callback(data);

    ipcRenderer.on("update:available", listener);

    return () => {
      ipcRenderer.removeListener("update:available", listener);
    };
  },

  onNotAvailable: (callback) => {
    const listener = (_, data) => callback(data);

    ipcRenderer.on("update:not-available", listener);

    return () => {
      ipcRenderer.removeListener("update:not-available", listener);
    };
  },

  onProgress: (callback) => {
    const listener = (_, data) => callback(data);

    ipcRenderer.on("update:progress", listener);

    return () => {
      ipcRenderer.removeListener("update:progress", listener);
    };
  },

  onDownloaded: (callback) => {
    const listener = (_, data) => callback(data);

    ipcRenderer.on("update:downloaded", listener);

    return () => {
      ipcRenderer.removeListener("update:downloaded", listener);
    };
  },

  onError: (callback) => {
    const listener = (_, data) => callback(data);

    ipcRenderer.on("update:error", listener);

    return () => {
      ipcRenderer.removeListener("update:error", listener);
    };
  },
};

// ============================================================
// Dropbox
// ============================================================

// Dropbox OAuth

let dropboxOAuthCallback = null;

const dropbox = {
  openAuth: (authUrl) => {
    return ipcRenderer.invoke(
      "dropbox:open-auth",
      authUrl
    );
  },

  onOAuthCallback: (callback) => {
    /*
     * Remove the previous listener first.
     */
    if (dropboxOAuthCallback) {
      ipcRenderer.removeListener(
        "dropbox:oauth-callback",
        dropboxOAuthCallback
      );

      dropboxOAuthCallback = null;
    }


    /*
     * Create the new listener.
     */
    dropboxOAuthCallback = (
      _event,
      callbackUrl
    ) => {
      callback(callbackUrl);
    };


    ipcRenderer.on(
      "dropbox:oauth-callback",
      dropboxOAuthCallback
    );


    /*
     * Return cleanup function.
     */
    return () => {
      if (dropboxOAuthCallback) {
        ipcRenderer.removeListener(
          "dropbox:oauth-callback",
          dropboxOAuthCallback
        );

        dropboxOAuthCallback = null;
      }
    };
  },
};
const api = {
  isDesktop: true,
  electronUpdater,
  version: () => ipcRenderer.invoke("app:version"),
  helloDesktop(name) {
    return `Hello ${name}`;
  },
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
  reloadApp: () => ipcRenderer.send("reload-electron-app"),
  dropbox,
  
};


contextBridge.exposeInMainWorld("electron", api);

module.exports = { api };
