/* Store which view we're in at the moment */
var current_view = undefined;

/* Store the currently selected texture */
var selected_texture = new Object();
selected_texture.texture = false;
selected_texture.group = false;

/* Store the texture state */
selected_texture.texture_reverse_x = false;
selected_texture.texture_reverse_y = false;

/* Store tile information */
selected_texture.can_walk = [true, true, true, true];
selected_texture.exit_tile = false;
selected_texture.exit_map_id = false;
selected_texture.exit_map_dir = [0, 0];
selected_texture.exit_map_pos = [0, 0];
selected_texture.interact_en = false;
selected_texture.interact_id = false;
selected_texture.npc_en = false;
selected_texture.npc_id = false;
selected_texture.top_layer = false;

/* Store the currently selected sprite */
var selected_sprite = new Object();
selected_sprite.sprite = false;
selected_sprite.group = false;

/* Store current map info */
var selected_map = false;
var map_cell_size = 6;
var map_border_size = 1;

/* Store drawing information */
var drawing_functions = false;
var paint_auto_inc = false;

/* Variables for tile duplication function */
var dupl_tiles = new Array();
var dupl_start_pos = new Object();
var dupl_end_pos = new Object();
var dupl_selection_size = new Object();

/* Store map resizing information */
var map_resizing = new Object();
map_resizing.new_width = 0;
map_resizing.new_height = 0;

/* Store if controls are disabled */
var controls_disabled = false;

/* Store if changes have been made */
var changes = false;

function sanitise_input( input_text ) {

	/* Function takes user input and remove any special characters that might cause issues */
	return input_text.replace(/[^a-zA-Z0-9\ _]/g, '_');
}

var notify_timeout;
function show_alert( text ) {

	clearTimeout( notify_timeout );
	$( "#container #notify_container" ).css( "display", "none" );

	$( "#container #notify_container" ).css( "display", "flex" ).hide().fadeIn( 500 );

	$( "#container #notify_container .error" ).css( "display", "none" );
	$( "#container #notify_container .info" ).css( "display", "block" );
	$( "#container #notify_container #notify_text" ).html( text );
	
	notify_timeout = setTimeout( function() {
		$( "#container #notify_container" ).fadeOut( 500 );
	}, 3000 );
}

function show_error( text ) {

	clearTimeout( notify_timeout );
	$( "#container #notify_container" ).css( "display", "none" );

	$( "#container #notify_container" ).css( "display", "flex" ).hide().fadeIn( 500 );

	$( "#container #notify_container .error" ).css( "display", "block" );
	$( "#container #notify_container .info" ).css( "display", "none" );
	$( "#container #notify_container #notify_text" ).html( text );
	
	notify_timeout = setTimeout( function() {
		$( "#container #notify_container" ).fadeOut( 500 );
	}, 3000 );
}

function clear_changes() {

	changes = false;
	$( "#save_project" ).removeClass( "save_changes" );
}

function log_change() {

	changes = true;
	$( "#save_project" ).addClass( "save_changes" );
}

/* No project */
var project = undefined;

/* Document load */
$( function() {

	/* Hide overlay */
	$( "#overlay" ).css( "display", "none" );

	/* Load editors and colour pickers, only called once */
	load_texture_editor_colour_pickers();
	load_sprite_editor_colour_pickers();

	//load_project_list();

	/* Debug */
	$( async () => {

		//$( "#overlay" ).css( "display", "flex" );
		//$( "#overlay #overlay_text" ).html( "Project Loading" );

		project = await window.electronAPI.load_project_data( "gba_game" );
		load_project_view();

		update_undo_panel();

		/* Update cached images */
		//update_cached_images();

		//selected_map = project.maps.find( obj => obj.id == 0 );
		//load_map_editing_view();

		//selected_texture.group = project.textures.find( obj => obj.gid == 2 );
		//selected_texture.texture = selected_texture.group.textures.find( obj => obj.id == 0 );
		//load_texture_list();
	} );
} );

/* Prevent accidental refreshes */
//$(window).on('beforeunload', function(){

	//return false;
//} );

/* Undo functionality */
var undo_list = new Array();
var undo_list_index = -1;

/* Undo panel used for debugging */
function update_undo_panel() {

	$( "#undo_list" ).html( "" );

	var li_value = "<i>Top</i>";
	if( undo_list_index == - 1 )
			li_value = "<i class=\"bi-arrow-right-short\"></i>" + li_value;

	$( "#undo_list" ).append( $( "<li>", { html: li_value, class: ( undo_list_index == - 1 ) ? "top_level" : 0 } ) );

	$.each( undo_list, function( key, value ) {

		if( value == undefined )
			var _action = "<i>none</i>";
		else 
			var _action = value.action + " - " + value.undo_data;

		var li_value = _action;

		if( key == undo_list_index )
			li_value = "<i class=\"bi-arrow-right-short\"></i>" + li_value;

		$( "#undo_list" ).append( $( "<li>", { html: li_value } ) );
	} );
}

function log_undo( action, identifier, undo_data, redo_data ) {

	/* Create an object to log into the undo list */
	var undo_object = new Object();

	/* Store the undo action and data */
	undo_object.action = action;
	undo_object.identifier = identifier;
	undo_object.undo_data = undo_data;
	undo_object.redo_data = redo_data;

	/* Store the currently selected texture and sprite */
	undo_object.selected_texture = new Object();
	undo_object.selected_sprite = new Object();

	undo_object.selected_texture.gid = ( selected_texture.group != false ) ? selected_texture.group.gid : false;
	undo_object.selected_texture.id = ( selected_texture.texture != false ) ? selected_texture.texture.id : false;

	undo_object.selected_sprite.gid = ( selected_sprite.group != false ) ? selected_sprite.group.gid : false;
	undo_object.selected_sprite.id = ( selected_sprite.sprite != false ) ? selected_sprite.sprite.id : false;

	console.log( undo_object );

	/* Crop the undo list so we only store the last 100 commands, and clear any things ahead in the tree */
	undo_list = undo_list.slice( ( undo_list_index + 1 ), 4 );

	/* Add to the undo list */
	undo_list.unshift( undo_object );

	/* Reset the undo tree */
	undo_list_index = -1

	/* Debugging */
	update_undo_panel();
}

function redo() {

	/* Go forward a step */
	if( undo_list_index >= 0 ) {

		var _redo = undo_list[ undo_list_index ];
		undo_list_index--;

		/* See if there's something to undo */
		if( _redo != undefined ) {

			//console.log( _redo );
			//console.log( "Parse: " + undo_list_index + "/" + undo_list.length );

			parse_undo_redo( false, _redo );
		} 

		/* Debugging */
		update_undo_panel();

	} else {

		//console.log( "Can't redo, index: " + undo_list_index + "/" + undo_list.length );
	}

	undo_list_dir = -1;
}

function undo() {

	/* Go back a step */
	if( undo_list_index < ( undo_list.length - 1 ) ) {

		undo_list_index++;
		var _undo = undo_list[ undo_list_index ];

		/* See if there's something to undo */
		if( _undo != undefined ) {

			//console.log( _undo );
			//console.log( "Parse: " + undo_list_index + "/" + undo_list.length );

			parse_undo_redo( true, _undo );
		}

		/* Debugging */
		update_undo_panel();

	} else {

		//console.log( "Can't undo, index: " + undo_list_index + "/" + undo_list.length );
	}

	undo_list_dir = 1;
}

function parse_undo_redo( is_undo, data ) {

	console.log( data );

	/* Parse the action */
	switch( data.action ) {

		case "switch_views":

			if( ( ( is_undo ) && ( data.undo_data == "project" ) ) || ( ( !is_undo ) && ( data.redo_data == "project" ) ) ) {

				/* We're switching to the project view, don't log this view switch otherwise we have to press undo twice */
				close_map_editing_view( false );

				/* See if we need to set a selected sprite */
				if( data.selected_sprite.gid != false ) {

					selected_sprite.group = project.sprites.find( obj => obj.gid == data.selected_sprite.gid );

					if( data.selected_sprite.id != false ) {

						selected_sprite.sprite = selected_sprite.group.sprites.find( obj => obj.id == data.selected_sprite.id );
					}
				}

				/* Load the project view */
				load_project_view();

			} else if( ( ( is_undo ) && ( data.undo_data == "map" ) ) || ( ( !is_undo ) && ( data.redo_data == "map" ) ) ) {

				/* We're switching to the map view */
				var map_obj = project.maps.find( obj => obj.id == data.identifier );
				selected_map = map_obj;

				/* Close the project view and open the map editor view */
				close_project_view( false );

				/* See if we need to set a selected texture */
				if( data.selected_texture.gid != false ) {

					selected_texture.group = project.textures.find( obj => obj.gid == data.selected_texture.gid );

					if( data.selected_texture.id != false ) {

						selected_texture.texture = selected_texture.group.textures.find( obj => obj.id == data.selected_texture.id );
					}
				}

				/* Load the map editing view */
				load_map_editing_view();
			}
			break;
		case "rename_sprite_group":

			/* Restore the sprite group name */
			var sprite_group_obj = project.sprites.find( obj => obj.gid == data.identifier );
			sprite_group_obj.name = ( is_undo ) ? data.undo_data : data.redo_data;

			/* Reload the sprite list */
			selected_sprite.group = sprite_group_obj;
			selected_sprite.sprite = false;
			load_sprite_list();

			break;
		case "rename_sprite":

			/* Restore the sprite name */
			var sprite_group_obj = project.sprites.find( obj => obj.gid == data.identifier[0] );
			var sprite_obj = sprite_group_obj.sprites.find( obj => obj.id == data.identifier[1] );
			sprite_obj.name = ( is_undo ) ? data.undo_data : data.redo_data;

			/* Reload the sprite list */
			selected_sprite.group = sprite_group_obj;
			selected_sprite.sprite = sprite_obj;
			load_sprite_list();
			break;
	}
}