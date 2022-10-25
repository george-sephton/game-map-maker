const { contextBridge, ipcRenderer } = require( "electron" );

contextBridge.exposeInMainWorld( "electronAPI", {

	texture_load_image: () => ipcRenderer.invoke( 'texture_load_image' ),
	load_projects: () => ipcRenderer.invoke( 'load_projects' )
})