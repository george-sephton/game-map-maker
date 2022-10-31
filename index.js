/* Load in node modules */
const { app, BrowserWindow, ipcMain, dialog, Menu, screen } = require( "electron" );
const appConfig = require( "electron-settings" );
const path = require( "path" );
const fs = require( "fs" );
const PNG = require( "pngjs" ).PNG;
const Jimp = require('jimp');

var mainWindow;

/* https://medium.com/@hql287/persisting-windows-state-in-electron-using-javascript-closure-17fc0821d37 */
function windowStateKeeper( windowName ) {

	let window, windowState;

	function setBounds() {

		const obj = appConfig.getSync();

		if( appConfig.hasSync( `windowState.${windowName}` ) ) {
			
			windowState = appConfig.getSync( `windowState.${windowName}` );
			return;
		}

		/* Get the work are size so we can create a window that's maximised */
		const primaryDisplay = screen.getPrimaryDisplay();
		var { width, height } = primaryDisplay.workAreaSize;

		if( width > 1920 ) width = 1920;
		if( height > 1080 ) height = 1080;

		windowState = {
			x: undefined,
			y: undefined,
			width: width,
			height: height,
		};
	}

	function saveState() {
		
		if( !windowState.isMaximized ) {
			windowState = window.getBounds();
		}
		
		windowState.isMaximized = window.isMaximized();
		appConfig.setSync( `windowState.${windowName}`, windowState );
	}

	function track( win ) {

		window = win;
		
		[ "resize", "move", "close" ].forEach( event => {

			win.on( event, saveState );
		} );
	}

	setBounds(); 

	return( {
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height,
		isMaximized: windowState.isMaximized,
		track,
	} );
}

const createWindow = () => {

	const mainWindowStateKeeper = windowStateKeeper( "mainWindow" );

	/* Create the browser window */
	mainWindow = new BrowserWindow( {
		x: mainWindowStateKeeper.x,
		y: mainWindowStateKeeper.y,
		width: mainWindowStateKeeper.width,
		height: mainWindowStateKeeper.height,
		minWidth: 800,
		minHeight: 700,
		fullscreenable: false,
		menuBarVisible: false,
		autoHideMenuBar: true,
		show: false,
		devTools: false,
		icon: path.join( __dirname, 'src/images/favicon.ico' ),
		webPreferences: {
			preload: path.join( __dirname, 'preload.js' )
		}
	} );

	mainWindowStateKeeper.track( mainWindow );

	// and load the index.html of the app.
	mainWindow.loadFile( "src/index.htm" );
	mainWindow.webContents.openDevTools();

	mainWindow.once( "ready-to-show", () => {
		mainWindow.webContents.setZoomFactor( 1.0 );
		//mainWindow.maximize();
		mainWindow.show();
	} );

	/* Add the window menu */
	const menuTemplate = [
		{ label: 'File', submenu: [ { role: 'quit' } ] },
		{ label: 'View', submenu: [ { role: 'resetzoom' }, { role: 'zoomin' }, { role: 'zoomout' } ] }
	];

    const menu = Menu.buildFromTemplate( menuTemplate );
    //Menu.setApplicationMenu( menu );
}

app.whenReady().then( () => {

	ipcMain.handle( "load_image_dialog", load_image_dialog );
	ipcMain.handle( "save_file_dialog", save_file_dialog );
	ipcMain.handle( "save_data", save_data );

	ipcMain.handle( "load_projects", load_projects );

	ipcMain.handle( "load_project_data", load_project_data );
	ipcMain.handle( "save_project", save_project );
	ipcMain.handle( "delete_project", delete_project );
	ipcMain.handle( "rename_project", rename_project );
	ipcMain.handle( "import_project", import_project );

	ipcMain.handle( "update_cached_image", update_cached_image );

	/* Create the window */
	createWindow();

	app.on( "activate", () => {
		
		/* Fix MacOS multi window bug */
		if( BrowserWindow.getAllWindows().length === 0 ) createWindow();
	} );
} );

/* Quit the app on window close, unless we're on macOS */
app.on( "window-all-closed", () => {
	
	if( process.platform !== "darwin" ) app.quit();
} );

async function load_image_dialog() {
	
	const { canceled, filePaths } = await dialog.showOpenDialog( {
		properties: [ "openFile" ],
		filters: [
		    { name: "Images", extensions: [ "png" ] },
		    { name: "All Files", extensions: [ "*" ] }
		  ],
	} );

	if( filePaths[0] != undefined ) { 

		try {

			var data = fs.readFileSync( filePaths[0] );
			var png = PNG.sync.read( data );
		} catch( e ) {
			
			/* Error with bitmap decoding */
			return false;
		}
	}

	return { cancelled: canceled, data: png };
}

async function save_file_dialog( e, filter ) {

	const { canceled, filePath } = await dialog.showSaveDialog( {
		filters: [ filter ]
	} );

	return { cancelled: canceled, data: filePath };
}

function save_data( e, file_name, data ) {
	
	try {
		
		/* Write our JSON file */
		fs.writeFileSync( file_name, data, { encoding: "utf8", flag: "w" } );
		return true;
	} catch( e ) {

		/* Error writing project.json */
		return false;
	}
}

function load_projects( e ) {
	
	/* See if the projects directory exists */
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

function load_project_data( e, project_name ) {

	/* Load our project.json file */
	try {
		
		const data = fs.readFileSync( path.join( __dirname, "projects", project_name, "project.json" ), { encoding: "utf8", flag: "r" } );

		if( ( data != false ) && ( data != undefined ) ) {

			/* Try and parse project.json */
			try {

				var project_data = JSON.parse( data );

				/* See if we have a project name */
				if( ( project_data.name != false ) && ( project_data.name != undefined ) )
					return project_data;
				else 
					return false;

			} catch( e ) {

				/* Error parsing project.json */
				val.project = false;
			}
		} else {

			/* no data in project.json */
			return false;
		}
	} catch( e ) {

		/* Error reading project.json */
		return false;
	}
}

function save_project( e, project_name, data ) {
	
	/* See if the project directory exists */
	if( !fs.existsSync( path.join( __dirname, "projects", project_name ) ) ) {

		/* Project folder doesn't exist, let's create it */
		try {

			fs.mkdirSync( path.join( __dirname, "projects", project_name ) );
		} catch ( e ) {
		
			/* Error creating projects directory */
			return false;
		}
	}

	try {
		
		/* Write our JSON file */
		fs.writeFileSync( path.join( __dirname, "projects", project_name, "project.json" ), data, { encoding: "utf8", flag: "w" } );
		return true;
	} catch( e ) {

		/* Error writing project.json */
		return false;
	}
}

function delete_project( e, project_name ) {

	/* Recursively delete the project directory */
	try {

		fs.rmSync( path.join( __dirname, "projects", project_name ), { recursive: true, force: true } );
		return true;
	} catch ( e ) {
	
		return false;
	}
}

function rename_project( e, project_name, f_new_project_name ) {

	/* Generate new directory name since f_new_project_name is the formatted name */
	var new_dir_name = f_new_project_name.toLowerCase().replace( / /g, "_" );

	/* First rename directory */
	try {

		fs.renameSync( path.join( __dirname, "projects", project_name ), path.join( __dirname, "projects", new_dir_name ) );

	} catch( e ) {

		return false;
	}

	/* Load our project.json file */
	try {
		
		const data = fs.readFileSync( path.join( __dirname, "projects", new_dir_name, "project.json" ), { encoding: "utf8", flag: "r" } );

		if( ( data != false ) && ( data != undefined ) ) {

			/* Try and parse project.json */
			try {

				var project_data = JSON.parse( data );

				/* See if we have a project name */
				if( ( project_data.name == false ) || ( project_data.name == undefined ) )
					return false;

			} catch( e ) {

				/* Error parsing project.json */
				val.project = false;
			}
		} else {

			/* no data in project.json */
			return false;
		}
	} catch( e ) {

		/* Error reading project.json */
		return false;
	}

	/* Rename */
	project_data.name = f_new_project_name;

	/* Save project.json */
	if( save_project( 0, new_dir_name, JSON.stringify( project_data ) ) )
		return true;
	else
		return false;
}

async function import_project( e ) {

	var data = undefined;

	const { canceled, filePaths } = await dialog.showOpenDialog( {
		properties: [ 'openFile' ],
		filters: [
		    { name: 'Projects', extensions: [ 'json' ] },
		    { name: 'All Files', extensions: ['*'] }
		  ],
	} );

	if( filePaths[0] != undefined ) { 

		try {

			data = JSON.parse( fs.readFileSync( filePaths[0] ) );

		} catch( e ) {
			
			return false;
		}
	}

	return { cancelled: canceled, data: data };
}

function update_cached_image( e, project_name, image_type, image_size, image_name, image_data ) {

	/* Create a new blank image */
	let image = new Jimp( image_size, image_size, function ( err, image ) {
		
		if( err )
			return false;

		/* Map the pixels correct */
		var _image_data = Array.from( { length: image_size }, () => Array.from( { length: image_size }, () => undefined ) );

		for( var row_sel = 0; row_sel < image_size; row_sel++ )
			for( var col_sel = 0; col_sel < image_size; col_sel++ )
				_image_data[ col_sel ][ row_sel ]  = image_data.data[ row_sel ][ col_sel ];

		/* Loop through each pixel to add to the image */
		_image_data.forEach( ( row, y ) => {

			row.forEach( ( colour, x ) => {

				/* If we have a transparent pixel, don't add it to the image */
				if( ( colour == "" ) || ( colour == null ) )
					image.setPixelColor( Jimp.rgbaToInt( 0, 0, 0, 0 ), parseInt( x ), parseInt( y ) );
				else 
					image.setPixelColor( Jimp.cssColorToHex( "#" + colour ), parseInt( x ), parseInt( y ) );
			} );
		} );

		/* Resize to a nice large size */
		image.resize( 512, 512 , Jimp.RESIZE_NEAREST_NEIGHBOR );

		/* Save the image to project directory */
		image.write( path.join(  __dirname, "projects", project_name, "cache", image_type, image_name + ".png" ), ( err ) => {
		
			if( err )
				return false;
		} );
	} );

	return true;
}