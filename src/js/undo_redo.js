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
			var _action = value.action + " - " + value.identifier;

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

	/* Crop the undo list so we only store the last 100 commands, and clear any things ahead in the tree */
	undo_list = undo_list.slice( ( undo_list_index + 1 ), 4 );

	/* Add to the undo list */
	undo_list.unshift( undo_object );

	/* Reset the undo tree */
	undo_list_index = -1;

	/* Log changes */
	log_change();

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

	/* Log changes */
	log_change();

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

			/* Reload Sprite list */
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

			/* Reload Sprite list */
			load_sprite_list();

			break;
		case "new_sprite_group":
		case "duplicate_sprite_group":

			/* Delete/Recreate the new/duplicated sprite group */
			if( is_undo ) {

				/* Undo - delete the new/duplicated sprite group */
				project.sprites = project.sprites.filter( obj => obj.gid != data.undo_data );
				/* No re-ordering required since this was the last sprite group added to the list, any re-ordering will already have been undone */
			} else {

				/* Read - re-add the new/duplicated sprite group */
				project.sprites.push( data.redo_data );
			}

			/* Select the sprite group if we're re-doing */
			if( !is_undo )
				selected_sprite.group = data.redo_data;
			else 
				selected_sprite.group = false;

			selected_sprite.sprite = false;

			/* Reload Sprite list */
			load_sprite_list();

			break;
		case "new_sprite":
		case "duplicate_sprite":

			/* Delete/Recreate the new/duplicated sprite */
			var sprite_group_obj = project.sprites.find( obj => obj.gid == data.identifier );

			if( is_undo ) {

				/* Undo - delete the new/duplicated sprite */
				sprite_group_obj.sprites = sprite_group_obj.sprites.filter( obj => obj.id != data.undo_data );
				/* No re-ordering required since this was the last sprite added to the list, any re-ordering will already have been undone */
			} else {

				/* Read - re-add the new/duplicated sprite */
				sprite_group_obj.sprites.push( data.redo_data );
			}

			/* Select the sprite group */
			selected_sprite.group = sprite_group_obj;

			/* Select the sprite if we're re-doing */
			if( !is_undo )
				selected_sprite.sprite = data.redo_data;
			else 
				selected_sprite.sprite = false;

			/* Reload Sprite list */
			load_sprite_list();

			break;
		case "delete_sprite_group":

			//Undo: [ selected_sprite.group, undo_orders ], Redo: selected_sprite.group.gid
			
			if( is_undo ) {

				/* Re-add the deleted sprite group to the project, first put the original order back */
				project.sprites.map( function( val ) {

					val.gorder = data.undo_data[1].find( obj => obj.gid == val.gid ).gorder;
					return val;
				} );

				/* Re-add the sprite group to the project */
				project.sprites.push( data.undo_data[0] );

				/* Let's also update the selected group to be our new one */
				selected_sprite.group = data.undo_data[0];
				selected_sprite.sprite = false;

				/* Reload Sprite list */
				load_sprite_list();
			} else {

				/* Redo, delete the selected sprite group */
				project.sprites = project.sprites.filter( obj => obj.gid != data.redo_data );

				/* Reorder the groups in local array */
				var i = 0;
				$.each( project.sprites, function( k, v ) {

					/* Give it it's new order and increment */
					v.gorder = i;
					i++;
				} );

				/* Return to sprite group list */
				selected_sprite.group = false;
				selected_sprite.sprite = false;

				/* Reload Sprite list */
				load_sprite_list();
			}
			break;
		case "delete_sprite":

			// NOTE: doesn't work when deleting the last sprite of the group

			//Undo: [ selected_sprite.sprite, undo_orders ], Redo: selected_sprite.sprite.id

			if( is_undo ) {

				/* Get the sprite group */
				var sprite_group_obj = project.sprites.find( obj => obj.gid == data.identifier );

				/* Re-add the deleted sprite group to the project, first put the original order back */
				sprite_group_obj.sprites.map( function( val ) {

					val.order = data.undo_data[1].find( obj => obj.id == val.id ).order;
					return val;
				} );

				/* Re-add the sprite group to the project */
				sprite_group_obj.sprites.push( data.undo_data[0] );

				/* Let's also update the selected group to be our new one */
				selected_sprite.group = sprite_group_obj;
				selected_sprite.sprite = data.undo_data[0];

				/* Reload Sprite list */
				load_sprite_list();
			} else {

				/* Redo, delete the selected sprite */

			}
			break;
	}
}