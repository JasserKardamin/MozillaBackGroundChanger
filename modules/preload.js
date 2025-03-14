const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electron', {
  getImages: async (directory) => ipcRenderer.invoke('get-images', directory),
  getFirefoxProfile: () => ipcRenderer.invoke('get-firefox-profile'),
  saveBackground: (fileName , fileData ,distination) => ipcRenderer.invoke('save-background', fileName,fileData, distination),
  changeBackground : (imageName , workingDir)=> ipcRenderer.invoke('change-background',imageName , workingDir),
  photoFingerprint : (fileData)=> ipcRenderer.invoke('photo-fingerprint',fileData),
  mozillaConfigChange : (profilePath) => ipcRenderer.invoke('change-about-config',profilePath),

  

  on: (channel, callback) => ipcRenderer.on(channel, callback),
  removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback),
});
