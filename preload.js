const { contextBridge, ipcRenderer } = require( "electron" );

contextBridge.exposeInMainWorld( "electronAPI", {

	texture_load_image: () => ipcRenderer.invoke( "texture_load_image" ),
	load_projects: () => ipcRenderer.invoke( "load_projects" ),
	load_project_data: ( project_name ) => ipcRenderer.invoke( "load_project_data", project_name ),
	save_project: ( project_name, data ) => ipcRenderer.invoke( "save_project", project_name, data ),
} );