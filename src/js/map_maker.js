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
	//load_project_view();

	/* Load the data */
	$( async () => {

		project = await window.electronAPI.load_project_data( "gba_game" );
		load_project_view();

		/* Update cached images */
		update_cached_images();

		selected_map = project.maps.find( obj => obj.id == 1 );
		load_map_editing_view();
	} );

	//selected_texture.group = project.textures.find( obj => obj.gid == 2 );
	//selected_texture.texture = selected_texture.group.textures.find( obj => obj.id == 0 );
	//load_texture_list();
} );

/* Prevent accidental refreshes */
//$(window).on('beforeunload', function(){

	//return false;
//} );