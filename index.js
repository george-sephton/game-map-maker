/* Load in node modules */
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
var PNG = require("pngjs").PNG;

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
		} catch( e ) {
			/* Error with bitmap decoding */
		}
	}
}

async function load_projects() {
	
	/* See if the projects director exists */
	if( !fs.existsSync( path.join( __dirname, "projects" ) ) ) {

		/* Projects folder doesn't exist, let's create it and return an empty array, since we don't have any available projects to load */
		try {

			fs.mkdirSync( path.join( __dirname, "projects" ) );
		} catch ( e ) {
		
			/* Error creating projects directory */
			return false;
		}
	}

	/* Now load projects */
	try {

		/* Read projects directory */
		var dir_list = fs.readdirSync( path.join( __dirname, "projects" ), { withFileTypes: true } );

		/* Get more information on each of the listings */
		try {

			var dir_list_extended = dir_list.map( function( val ) {

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
						try {
							
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

								} catch( e ) {

									/* Error parsing project.json */
									val.project = false;
								}
							} else {

								/* no data in project.json */
								val.project = false;
							}
						} catch( e ) {

							/* Error reading project.json */
							return false;
						}
					} else {

						/* Not a directory or a JSON error */
						val.project = false;
					}

					/* Return the project to be mapped into the array */
					return val;

				} catch( e ) {
					
					/* lstatSync Error */
					return false;
				}

			} );
		} catch( e ) {

			/* Couldn't map a directory list with extra info */
			return false;
		}
	} catch( e ) {

		/* Error reading proejcts directory */
		return false;
	}

	/* Only return the projects */
	return dir_list_extended.filter( obj => obj.project != false );
}

const createWindow = ( _width, _height ) => {
	
	/* Create the browser window */
	mainWindow = new BrowserWindow( {
		width: _width,
		height: _height,
		show: false,
		icon: path.join( __dirname, 'src/images/favicon.ico' ),
		webPreferences: {
			preload: path.join( __dirname, 'preload.js' )
		}
	} );

	// and load the index.html of the app.
	mainWindow.loadFile( "src/index.htm" );
	mainWindow.webContents.openDevTools();

	mainWindow.once( "ready-to-show", () => {
		mainWindow.webContents.setZoomFactor( 0.8 );
		mainWindow.maximize();
		mainWindow.show();
	} );
}

app.whenReady().then( () => {

	const { screen } = require( "electron" );

	/* Get the work are size so we can create a window that's maximised */
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.workAreaSize;

	ipcMain.handle( 'texture_load_image', texture_load_image );
	ipcMain.handle( 'load_projects', load_projects );

	/* Create the window */
	createWindow( width, height );

	app.on( "activate", () => {
		
		/* Fix MacOS multi window bug */
		if( BrowserWindow.getAllWindows().length === 0 ) createWindow();
	} );
} );

/* Quit the app on window close, unless we're on macOS */
app.on( "window-all-closed", () => {
	
	if( process.platform !== "darwin" ) app.quit();
} );