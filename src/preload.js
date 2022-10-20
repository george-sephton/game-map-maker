const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {

	loadImage: () => ipcRenderer.invoke( 'loadImage' )
})