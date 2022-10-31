const { contextBridge, ipcRenderer } = require( "electron" );

contextBridge.exposeInMainWorld( "electronAPI", {

	load_image_dialog: () => ipcRenderer.invoke( "load_image_dialog" ),
	save_file_dialog: ( filter ) => ipcRenderer.invoke( "save_file_dialog", filter ),
	save_data: ( file_name, data ) => ipcRenderer.invoke( "save_data", file_name, data ),

	load_projects: () => ipcRenderer.invoke( "load_projects" ),
	
	load_project_data: ( project_name ) => ipcRenderer.invoke( "load_project_data", project_name ),
	save_project: ( project_name, data ) => ipcRenderer.invoke( "save_project", project_name, data ),
	delete_project: ( project_name ) => ipcRenderer.invoke( "delete_project", project_name ),
	rename_project: ( project_name, f_new_project_name ) => ipcRenderer.invoke( "rename_project", project_name, f_new_project_name ),
	import_project: () => ipcRenderer.invoke( "import_project" ),

	update_cached_image: ( project_name, image_type, image_size, image_name, image_data ) => ipcRenderer.invoke( "update_cached_image", project_name, image_type, image_size, image_name, image_data )
} );