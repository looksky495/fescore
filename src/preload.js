const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("cBridge", {
  submitScoreData: data => ipcRenderer.invoke("submitScoreData", data),
  readScoreData: () => ipcRenderer.invoke("readScoreData"),
  getActiveScoreFile: () => ipcRenderer.invoke("getActiveScoreFile"),
  getSelectedScoreFile: () => ipcRenderer.invoke("getSelectedScoreFile"),
  listScoreFiles: () => ipcRenderer.invoke("listScoreFiles"),
  createScoreFile: () => ipcRenderer.invoke("createScoreFile"),
  setActiveScoreFile: filePath => ipcRenderer.invoke("setActiveScoreFile", filePath),
  showActiveScoreFile: () => ipcRenderer.invoke("showActiveScoreFile"),
  showScoreFile: filePath => ipcRenderer.invoke("showScoreFile", filePath)
});