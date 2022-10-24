// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
var PNG = require("pngjs").PNG;

/*
const dialog = require('electron').dialog;
dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory', 'multiSelections' ]})
*/

var mainWindow;

async function texture_load_image() {
	
	const { canceled, filePaths } = await dialog.showOpenDialog( {
		properties: [ 'openFile' ],
		filters: [
		    { name: 'Images', extensions: [ 'png' ] },
		    { name: 'All Files', extensions: ['*'] }
		  ],
	} );

	if( filePaths[0] != undefined ) { 

		try {

			var data = fs.readFileSync( filePaths[0] )
			var png = PNG.sync.read(data);

			return png;
		} catch (e) {
			/* Error with bitmap decoding */
		}
	}
}

async function load_projects() {
	
	/* Load the projects directory */
	var dir_list = fs.readdirSync( path.join( __dirname, "projects" ), { withFileTypes: true } );

	/* Get more information on each of the listings */
	var check_array = dir_list.map( function( val ) {

		/* Try and get the statistics of the directory listing */
		try {

			var stat = fs.lstatSync( path.join( __dirname, "projects", val.name ) );
			var isDir = stat.isDirectory();

			/* See if we have a project.json file */
			if( isDir )
				var project_json = fs.existsSync( path.join( __dirname, "projects", val.name, "project.json" ) );
			else
				var project_json = false;

			/* Let's now see if we have a valid project */
			if( project_json ) {

				/* Load our project.json file */
				const data = fs.readFileSync( path.join( __dirname, "projects", val.name, "project.json" ), { encoding:'utf8', flag:'r' } );

				if( ( data != false ) && ( data != undefined ) ) {

					/* Try and parse project.json */
					try {

						var project_data = JSON.parse( data );

						/* See if we have a project name */
						if( ( project_data.name != false ) && ( project_data.name != undefined ) )
							val.project = project_data.name;
						else 
							val.project = false;

					} catch (e) {

						/* Error parsing project.json */
						val.project = false;
					}
				} else {

					/* Error opening project.json */
					val.project = false;
				}
			} else {

				/* Not a directory */
				val.project = false;
			}

			/* Return the project */
			return val;

		} catch (e) {
			
			/* lstatSync threw an error - possibly the file/directory didn't exist */
			return false;
		}

	} );

	/* Only return the projects */
	return check_array.filter( obj => obj.project != false );
}

const createWindow = ( _width, _height ) => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: _width,
		height: _height,
		show: false,
		icon: path.join(__dirname, 'src/images/favicon.ico'),
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	})

	// and load the index.html of the app.
	mainWindow.loadFile('src/index.htm')
	mainWindow.webContents.openDevTools()

	mainWindow.once('ready-to-show', () => {
		mainWindow.webContents.setZoomFactor(0.8);
		mainWindow.maximize();
		mainWindow.show();
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

	const { screen } = require('electron')

	const primaryDisplay = screen.getPrimaryDisplay()
	const { width, height } = primaryDisplay.workAreaSize

	ipcMain.handle('texture_load_image', texture_load_image)
	ipcMain.handle('load_projects', load_projects)

	createWindow( width, height )

	app.on('activate', () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.