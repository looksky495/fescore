const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("cBridge", {
  submitScoreData: data => ipcRenderer.invoke("submitScoreData", data),
  readScoreData: () => ipcRenderer.invoke("readScoreData")
});