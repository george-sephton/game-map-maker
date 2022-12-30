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
var map_settings_show = true;

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

/* No project */
var project = undefined;

/* Document load */
$( function() {

	/* Hide overlay */
	$( "#overlay" ).css( "display", "none" );

	/* Load editors and colour pickers, only called once */
	load_texture_editor_colour_pickers();
	load_sprite_editor_colour_pickers();

	/* Load map settings panel event listener, only called once */
	map_settings_panel_event_listeners();

	//load_project_list();
	//return;

	/* Debug */
	$( async () => {

		//$( "#overlay" ).css( "display", "flex" );
		//$( "#overlay #overlay_text" ).html( "Project Loading" );

		project = await window.electronAPI.load_project_data( "small" );
		load_project_view();

		/* Update cached images */
		//update_cached_images();

		selected_map = project.maps.find( obj => obj.id == 1 );
		load_map_editing_view();
		
		//selected_texture.group = project.textures.find( obj => obj.gid == 2 );
		//selected_texture.texture = selected_texture.group.textures.find( obj => obj.id == 0 );
		//load_texture_list();
		
		//selected_sprite.group = project.sprites.find( obj => obj.gid == 0 );
		//selected_sprite.sprite = selected_sprite.group.sprites.find( obj => obj.id == 0 );
		//load_sprite_list();			
	} );
} );

function sanitise_input( input_text ) {

	/* Function takes user input and remove any special characters that might cause issues */
	return input_text.replace(/[^a-zA-Z0-9\ _]/g, '_');
}

var notify_timeout;
function show_alert( text ) {

	clearTimeout( notify_timeout );
	$( "#notify_container" ).css( "display", "none" );

	$( "#notify_container" ).css( "display", "flex" ).hide().fadeIn( 500 );

	$( "#notify_container .error" ).css( "display", "none" );
	$( "#notify_container .info" ).css( "display", "block" );
	$( "#notify_container #notify_text" ).html( text );
	
	notify_timeout = setTimeout( function() {
		$( "#notify_container" ).fadeOut( 500 );
	}, 3000 );
}

function show_error( text ) {

	clearTimeout( notify_timeout );
	$( "#notify_container" ).css( "display", "none" );

	$( "#notify_container" ).css( "display", "flex" ).hide().fadeIn( 500 );

	$( "#notify_container .error" ).css( "display", "block" );
	$( "#notify_container .info" ).css( "display", "none" );
	$( "#notify_container #notify_text" ).html( text );
	
	notify_timeout = setTimeout( function() {
		$( "#notify_container" ).fadeOut( 500 );
	}, 3000 );
}

$( function() {

	/* Click event handler for notification bar */
	$( "#notify_container" ).on( "click", function( e ) {

		/* Clear the notification bar quickly if clicked */
		$( this ).fadeOut( 100 );
	} );
} );

function clear_changes() {

	changes = false;
	$( "#save_project" ).removeClass( "save_changes" );
}

function log_change() {

	changes = true;
	$( "#save_project" ).addClass( "save_changes" );
}

function disable_controls( hide_name_input = true ) {
	
	controls_disabled = true;

	/* Disable all other controls */
	$( "#toolbar #settings #controls i" ).addClass( "resize_disabled" );
	$( "#container #content #project_view #map_list_container #map_list_toolbar i" ).addClass( "resize_disabled" );
	$( "#project_view #map_list .sortable li" ).addClass( "resize_disabled" );
	
	$( "#container #map_settings #map_setting_toolbar i" ).addClass( "resize_disabled" );

	$( "#sidebar #texture_list_toolbar i:not( #colour_ind )" ).addClass( "resize_disabled" );
	$( "#sidebar #texture_list .sortable li" ).addClass( "resize_disabled" );

	$( "#project_view #sprite_list_toolbar i" ).addClass( "resize_disabled" );
	$( "#project_view #sprite_list .sortable li" ).addClass( "resize_disabled" );

	$( "#container #map_settings #map_settings_toolbar i" ).addClass( "resize_disabled" );

	$( ".sprite_picker" ).addClass( "auto_cursor" );
	$( ".texture_picker" ).addClass( "auto_cursor" );

	$( "#container #toolbar #map_settings" ).css( "display", "none" );

	/* Sprites: Hide delete and new group confirmation prompt and show the toolbar */
	$( "#container #content #project_view #sprite_editor_container #sprite_list_toolbar_delete" ).css( "display", "none" );
	$( "#container #content #project_view #sprite_editor_container #sprite_list_toolbar_new_group" ).css( "display", "none" );
	$( "#container #content #project_view #sprite_editor_container #sprite_list_toolbar" ).css( "display", "flex" );

	if( ( selected_sprite.group != false ) && ( drawing_functions == false ) ) {
		
		$( "#container #content #project_view #sprite_editor_container #sprite_editor_toolbar" ).css( "display", "none" );
	} else {

		/* We're drawing, just grey out the icons */
		$( "#container #content #project_view #sprite_editor_container #sprite_editor_toolbar i:not( #colour_ind )" ).addClass( "resize_disabled" );
	}

	/* Textures: Hide delete confirmation prompt and show the toolbar */
	$( "#container #sidebar #texture_list_toolbar_delete" ).css( "display", "none" );
	$( "#container #sidebar #texture_list_toolbar" ).css( "display", "flex" );

	/* Disable sorting on texture list */
	clear_texture_list_sortable();

	/* Hide the other toolbar elements */
	if( hide_name_input )
		$( "#container #toolbar #settings #name_input_container" ).css( "display", "none" );
}

function enable_controls() {
	
	controls_disabled = false;

	/* Re-enable all other controls */
	$( "#toolbar #settings #controls i" ).removeClass( "resize_disabled" );
	$( "#container #content #project_view #map_list_container #map_list_toolbar i" ).removeClass( "resize_disabled" );
	$( "#project_view #map_list .sortable li" ).removeClass( "resize_disabled" );
	
	$( "#container #map_settings #map_setting_toolbar i" ).removeClass( "resize_disabled" );

	$( "#sidebar #texture_list_toolbar i" ).removeClass( "resize_disabled" );
	$( "#sidebar #texture_list .sortable li" ).removeClass( "resize_disabled" );

	$( "#project_view #sprite_list_toolbar i" ).removeClass( "resize_disabled" );
	$( "#project_view #sprite_list .sortable li" ).removeClass( "resize_disabled" );
	$( "#project_view #sprite_editor_toolbar i" ).removeClass( "resize_disabled" );

	$( "#container #map_settings #map_settings_toolbar i" ).removeClass( "resize_disabled" );

	$( ".sprite_picker" ).removeClass( "auto_cursor" );
	$( ".texture_picker" ).removeClass( "auto_cursor" );

	/* Re-show flip icons and texture preview */
	if( selected_texture.texture == false ) {
		$( "#map_toolbar_flip_h" ).css( "display", "none" );
		$( "#map_toolbar_flip_v" ).css( "display", "none" );
	}

	/* Show the other toolbar elements */
	$( "#container #toolbar #settings #name_input_container" ).css( "display", "flex" );
	
	if( selected_texture.texture != false )
		$( "#container #toolbar #map_paint_preview" ).css( "display", "block" );

	if( ( selected_texture.group == false ) && ( selected_map != false ) ) {
		
		$( "#container #toolbar #map_settings" ).css( "display", "flex" );
		$( "#container #toolbar #map_paint_preview" ).css( "display", "block" );

		/* Re-enable the map settings panel */
		map_settings_panel_enable();
	}

	/* Hide auto increment option */
	$( "#container #toolbar #settings #name_input_container #paint_auto_inc_en" ).css( "display", "none" );
	$( "#container #toolbar #settings #name_input_container label[for='paint_auto_inc_en']" ).css( "display", "none" );

	if( selected_map == false ) {
		
		if( selected_sprite.group != false ) {
			$( "#container #content #project_view #sprite_editor_container #sprite_editor_toolbar" ).css( "display", "flex" );

			$( "#container #content #project_view #sprite_editor_container #sprite_editor_toolbar i" ).removeClass( "resize_disabled" );
		}

		/* Show sprite list in case it's hidden */
		$( "#container #content #project_view #sprite_list_container #sprite_list" ).css( "display", "flex" );
	}
}