// main.js

// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
const fs = require('fs')
var bmp = require("bmp-js")

/*
const dialog = require('electron').dialog;
dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory', 'multiSelections' ]})
*/

var mainWindow;

async function loadImage() {
	
	const { canceled, filePaths } = await dialog.showOpenDialog( {
		properties: [ 'openFile' ],
		filters: [
		    { name: 'Images', extensions: [ 'bmp' ] },
		    { name: 'All Files', extensions: ['*'] }
		  ],
	} );

	if( filePaths[0] != undefined ) { 

		try {
			var bmpBuffer = fs.readFileSync( filePaths[0] );
			var bmpData = bmp.decode(bmpBuffer);
		
			return bmpData;
		} catch (e) {
			/* Error with bitmap decoding */
		}
	}
}

const createWindow = ( _width, _height ) => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: _width,
		height: _height,
		webPreferences: {
			preload: path.join(__dirname, 'src/preload.js')
		}
	})

	// and load the index.html of the app.
	mainWindow.loadFile('src/index.htm')
	mainWindow.webContents.openDevTools()

	mainWindow.once('ready-to-show', () => {
		mainWindow.webContents.setZoomFactor(0.8);
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

	const { screen } = require('electron')

	const primaryDisplay = screen.getPrimaryDisplay()
	const { width, height } = primaryDisplay.workAreaSize

	ipcMain.handle('loadImage', loadImage)

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