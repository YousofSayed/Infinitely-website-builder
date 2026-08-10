const { contextBridge, ipcRenderer } = require("electron");
console.log("🔥 PRELOAD LOADED");
const api = {
  isDesktop: true,

  helloDesktop(name) {
    return `Hello ${name}`;
  },

  minimize: () => ipcRenderer.send("window:minimize"),

  maximize: () => ipcRenderer.send("window:maximize"),

  close: () => ipcRenderer.send("window:close"),
};

contextBridge.exposeInMainWorld("electron", api);

module.exports = { api };
