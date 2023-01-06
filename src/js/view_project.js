function load_project_view() {

	/* Show project view elements */
	$( "#container #sidebar" ).css( "display", "none" );
	$( "#container #sidebar #texture_list_toolbar_rename" ).css( "display", "none" );
	$( "#container #sidebar #texture_list_toolbar_delete" ).css( "display", "none" );

	$( "#container #content" ).css( "max-width", "100%" );

	$( "#container #content #toolbar #upload_settings" ).css( "display", "none" );
	$( "#container #content #toolbar #settings" ).css( "display", "flex" );
	$( "#container #content #toolbar #settings #name_input_container" ).css( "display", "flex" );
	$( "#container #content #toolbar #settings #name_input_container #name_input" ).attr( "disabled", "disabled" );
	$( "#container #content #toolbar #settings #name_input_container #name_input" ).val( "" );
	
	$( "#container #content #toolbar #settings #name_input_container #paint_auto_inc_en" ).css( "display", "none" );
	$( "#container #content #toolbar #settings #name_input_container label[for='paint_auto_inc_en']" ).css( "display", "none" );

	$( "#container #map_settings" ).css( "display", "none" );
	$( "#container #map_settings #map_settings_toolbar_new_option" ).css( "display", "none" );

	$( "#container #content #toolbar" ).css( "display", "flex" );
	$( "#container #content #toolbar #settings #controls" ).css( "display", "flex" );
	$( "#container #content #toolbar #settings #map_confirm" ).css( "display", "none" );

	$( "#container #content #toolbar #map_paint_preview" ).css( "display", "none" );
	$( "#container #content #toolbar #map_paint_settings" ).css( "display", "none" );
	$( "#container #content #toolbar #map_size_settings" ).css( "display", "none" );

	$( "#container #content #project_view #project_list_container" ).css( "display", "none" );

	$( "#container #content #project_view #sprite_editor_container #sprite_editor" ).css( "display", "none" );
	$( "#container #content #project_view #sprite_editor_container #sprite_editor_empty" ).css( "display", "flex" );

	$( "#container #content #project_view #sprite_list_container #sprite_list_toolbar" ).css( "display", "flex" );
	$( "#container #content #project_view #sprite_list_container #sprite_list_toolbar #toolbar_right" ).css( "display", "none" );
	$( "#container #content #project_view #sprite_list_container #sprite_list_toolbar #toolbar_new_sprite" ).css( "display", "none" );
	$( "#container #content #project_view #sprite_list_container #sprite_list_toolbar #toolbar_back" ).css( "display", "none" );
	$( "#container #content #project_view #sprite_list_container #sprite_list_toolbar #sprite_list_toolbar_new_group" ).css( "display", "none" );

	$( "#container #content #project_view" ).css( "display", "flex" );
	$( "#container #content #project_view #sprite_editor_container" ).css( "display", "flex" );
	$( "#container #content #project_view #sprite_list_container" ).css( "display", "flex" );

	$( "#container #content #project_view #map_list_container" ).css( "display", "flex" );
	$( "#container #content #project_view #map_list_container #map_list_toolbar" ).css( "display", "flex" );
	$( "#container #content #project_view #map_list_container #map_list_new_map_name" ).css( "display", "none" );

	$( "#container #content #map_editor_container" ).css( "display", "none" );
	$( "#container #content #map_editor_container #map_editor" ).css( "display", "none" );
	$( "#container #content #map_editor_container #map_editor_loading" ).css( "display", "none" );

	$( "#container #content #map_list" ).css( "display", "flex" );
	$( "#container #content #project_upload" ).css( "display", "none" );

	/* Show project icons */
	$( ".project_functions" ).css( "display", "block" );
	$( ".map_editing_functions" ).css( "display", "none" );

	/* Load map list */
	load_map_list();

	/* Toolbar event listeners */
	project_toolbar_event_listeners();
	sprite_toolbar_event_listeners();

	/* Load sprite list */
	load_sprite_list();

	/* Set the current view */
	current_view = "project";
}

function close_project_view( log_switch_view = true ) {

	/* Clear all event listeners */
	clear_map_list_event_listeners();
	clear_project_toolbar_event_listeners();
	clear_map_list_sortable();

	/* Close any open sprites */
	selected_sprite.group = false;
	selected_sprite.sprite = false;

	/* Clear project elements */
	$( "#container #content #map_list .sortable" ).html( "" );
}

function load_map_list() {

	/* Clear texture list */
	$( "#map_list .sortable" ).html( "" );
	$( "#map_list .sortable li" ).css( "color", "#000" );

	/* Add project name */
	$( "#container #toolbar #settings #name_input_container #name_input" ).attr( "placeholder", decodeURI( project.name ) );
	
	if( project.maps.length != 0 ) {

	 	/* Sort maps into order */
		sort_maps_by_order();

		/* Add all the maps to the list */
		$.each( project.maps, function( key, value ) {
			$( "#map_list .sortable" ).append( '<li class="ui-state-default" map_id="' + value.id + '">' + value.name + '</li>' );
		} );

		/* Add event listeners to the list */
		map_list_event_listeners();
	
		/* Add sorting capability */
		map_list_sortable();	
	}

	/* Set the icons */
	$( "#toolbar_new_group" ).css( "display", "block" );
	$( "#toolbar_new_texture" ).css( "display", "none" );
	$( "#toolbar_back" ).css( "display", "none" );
	$( "#container #sidebar #texture_list_toolbar #toolbar_right" ).css( "display", "none" );
}

function clear_map_list_event_listeners() {
	
	$( "#container #content #map_list .sortable li" ).unbind( "click" );
	$( "#container #content #map_list" ).unbind( "click" ); /* For click out - not implemented */
}

function map_list_event_listeners() {

	/* Remove existing event listeners */
	clear_map_list_event_listeners();

	/* Add onClick event listeners */
	$( "#container #content #map_list .sortable li" ).on( "click" , function( e ) {
		
		/* Ignore clicks on the items in the map list when controls are disabled */
		if( controls_disabled == false ) {
			
			/* Set the map */
			var map_obj = project.maps.find( obj => obj.id == $( this ).attr( "map_id" ) );
			selected_map = map_obj;

			/* Close the project view */
			close_project_view();

			/* Open the map editor view */
			load_map_editing_view();
		}
	});
}

function clear_project_toolbar_event_listeners() {
	
	$( "#container #toolbar #settings #controls i" ).unbind( "click" );
	$( "#container #toolbar #settings #name_input_container #name_input" ).unbind( "keyup blur" );
}

function project_toolbar_event_listeners() {

	/* Remove all event listeners */
	clear_project_toolbar_event_listeners();

	/* Project toolbar event listener */
	$( "#container #toolbar #settings #controls i, #container #content #project_view #map_list_container #map_list_toolbar i" ).on( "click", function() {

		/* Check if functions are disabled */
		if( controls_disabled == false ) {

			var func = $( this ).attr( "func" );

			switch( func ) {
				case "undo": undo(); break;
				case "redo": redo(); break;
				case "close-project":
					
					if( changes ) {

						/* Disable controls */
						disable_controls();

						/* There's unsaved changes, let's prompt to save first */
						$( "#container #toolbar #settings #map_confirm #map_confirm_prompt" ).html( "You have unsaved changes, do you want to close the project without saving?" );

						$( "#container #toolbar #settings #map_confirm input[type=button]" ).css( "display", "block" );
						$( "#container #toolbar #settings #map_confirm #map_done" ).css( "display", "none" );

						$( "#container #toolbar #settings #map_confirm" ).css( "display", "flex" );

						/* Add event listeners */
						$( "#container #toolbar #settings #map_confirm input[type=button]" ).on( "click" , function( e ) {
							
							if( $( this ).attr( "id" ) == "map_confirm_y" ) {
								
								/* Re-enable controls */
								enable_controls();

								/* Close the project view - don't record this to the undo tree */
								close_project_view( false );

								/* Clear the selected project */
								project = undefined;

								/* Load the project list */
								load_project_list();

							} else if( $( this ).attr( "id" ) == "map_confirm_n" ) {
								
								/* Re-enable controls */
								enable_controls();
							}

							/* Remove event listeners */
							$( "#container #toolbar #settings #map_confirm input[type=button]" ).unbind( "click" );

							/* Hide the confirmation prompt */
							$( "#container #toolbar #settings #map_confirm #map_confirm_prompt" ).html( "" );
							$( "#container #toolbar #settings #map_confirm" ).css( "display", "none" );
						} );

					} else {

						/* Close the project view - don't record this to the undo tree */
						close_project_view( false );

						/* Clear the selected project */
						project = undefined;

						/* Load the project list */
						load_project_list();
					}
					break;
				case "new-map":
					
					/* Reset toolbar for a clean start */
					map_editor_toolbar_reset();

					/* Disable controls - don't hide the name input */
					disable_controls( false );

					$( "#container #content #project_view #map_list_container #map_list_toolbar" ).css( "display", "none" );
					$( "#container #content #project_view #map_list_container #map_list_new_map_name" ).css( "display", "flex" );

					$( "#container #content #project_view #map_list_container #map_list_new_map_name #new_map_name" ).val( "" );
					$( "#container #content #project_view #map_list_container #map_list_new_map_name #new_map_name" ).attr( "placeholder", "Enter new map name" );
					$( "#container #content #project_view #map_list_container #map_list_new_map_name #new_map_name" ).focus();

					/* Add event listeners */
					$( "#container #content #project_view #map_list_container #map_list_new_map_name #new_map_name" ).on( "keyup blur", function( e ) {

						/* Save the change */
						if( e.key == "Enter" ) {

							var map_name_value = sanitise_input( $( this ).val() );

							if( map_name_value.match( /^\d/ ) ) {
								
								show_alert( "Map name cannot start with a number" );
							} else {

								/* Check if name already exists */
								var check_name = map_name_value.toLowerCase().replace( / /g, "_" );
								var check_array = project.maps.map( function( val ) {
									return val.name.toLowerCase().replace( / /g, "_" );;
								} );

								if( check_array.indexOf( check_name ) !== -1 ) {

									show_alert( "Map name already exists." );
								} else {

									if( map_name_value != "" ) {

										new_map = new Object();
										
										/* Set the new name */
										new_map.name = map_name_value;

										/* Give it a blank canvas */
										var blank_tile = new Object();

										blank_tile.texture_gid = undefined;
										blank_tile.texture_id = undefined;
										blank_tile.texture_reverse_x = false;
										blank_tile.texture_reverse_y = false;

										blank_tile.bg_texture_gid = undefined;
										blank_tile.bg_texture_id = undefined;
										blank_tile.bg_texture_reverse_x = false;
										blank_tile.bg_texture_reverse_y = false;

										blank_tile.can_walk = [true, true, true, true];
										blank_tile.top_layer = false;

										blank_tile.exit_tile = false;
										blank_tile.exit_map_id = false;
										blank_tile.exit_map_dir = [0, 0];
										blank_tile.exit_map_pos = [0, 0];

										blank_tile.interact_en = false;
										blank_tile.interact_id = false;

										blank_tile.npc_en = false;
										blank_tile.npc_id = false;

										new_map.width = 8;
										new_map.height = 8;
										new_map.map_settings = new Array();
										new_map.data = Array.from( { length: new_map.height }, () => Array.from( { length: new_map.width }, () => Object.assign( {}, blank_tile ) ) );

										/* Get new ID value */
										sort_maps_by_id();
										new_map.id = ( project.maps.length != 0 ) ? ( project.maps[project.maps.length - 1].id + 1 ) : 0;

										/* Get new order value */
										sort_maps_by_order();
										new_map.order = ( project.maps.length != 0 ) ? ( project.maps[project.maps.length - 1].order + 1 ) : 0;
										/* Note we sort by order 2nd so the array goes back to the correct order */

										/* Add the duplicated map to the array */
										project.maps.push( new_map );

										/* Log changes */
										log_change();

										/* Close the project view */
										close_project_view();

										/* Open the map editor view */
										selected_map = project.maps.find( obj => obj.id == new_map.id );
										load_map_editing_view();
									}
								}
							}

							/* Put things back the way they were */
							$( "#container #content #project_view #map_list_container #map_list_toolbar" ).css( "display", "flex" );
							$( "#container #content #project_view #map_list_container #map_list_new_map_name" ).css( "display", "none" );
							$( "#container #content #project_view #map_list_container #map_list_new_map_name #new_map_name" ).val( "" );

							/* Re-enable controls */
							enable_controls();

							/* Remove event listeners */
							$( "#container #content #project_view #map_list_container #map_list_new_map_name #new_map_name" ).unbind( "keyup blur" );
						}

						/* Discard change */
						if( ( e.key == "Escape" ) || ( e.type == "blur" ) ) {

							/* Re-enable controls */
							enable_controls();

							/* Remove event listeners */
							$( "#container #content #project_view #map_list_container #map_list_new_map_name #new_map_name" ).unbind( "keyup blur" );
							
							/* Put things back the way they were */
							$( "#container #content #project_view #map_list_container #map_list_toolbar" ).css( "display", "flex" );
							$( "#container #content #project_view #map_list_container #map_list_new_map_name" ).css( "display", "none" );
							$( "#container #content #project_view #map_list_container #map_list_new_map_name #new_map_name" ).val( "" );
						}
					} );
					break;
				case "trash-project":

					/* Disable controls */
					disable_controls();

					/* Show the confirmation prompt */
					$( "#container #toolbar #settings #map_confirm #map_confirm_prompt" ).html( "Are you sure you want to delete this project?" );

					$( "#container #toolbar #settings #map_confirm input[type=button]" ).css( "display", "block" );
					$( "#container #toolbar #settings #map_confirm #map_done" ).css( "display", "none" );

					$( "#container #toolbar #settings #map_confirm" ).css( "display", "flex" );

					/* Add event listeners */
					$( "#container #toolbar #settings #map_confirm input[type=button]" ).on( "click" , function( e ) {
						
						if( $( this ).attr( "id" ) == "map_confirm_y" ) {

							/* Delete the map */
							$( async () => {

								var project_name = project.name.toLowerCase().replace( / /g, "_" );

								if( await window.electronAPI.delete_project( project_name ) ) {

									/* Project deleted successfully */
									show_alert( "Project deleted successfully." );
								} else {

									show_error( "Error deleting project." );
								}
								
							} );

							/* Re-enable controls */
							enable_controls();

							/* Load project view */
							load_project_list();

						} else if( $( this ).attr( "id" ) == "map_confirm_n" ) {
							
							/* Re-enable controls */
							enable_controls();
						}

						/* Remove event listeners */
						$( "#container #toolbar #settings #map_confirm input[type=button]" ).unbind( "click" );

						/* Hide the confirmation prompt */
						$( "#container #toolbar #settings #map_confirm #map_confirm_prompt" ).html( "" );
						$( "#container #toolbar #settings #map_confirm" ).css( "display", "none" );
					});
					break;
				case "rename-project":
					
					/* Reset toolbar for a clean start */
					map_editor_toolbar_reset();

					/* Disable controls - don't hide the name input */
					disable_controls( false );

					$( "#container #toolbar #settings #name_input_container #name_input" ).attr( "placeholder", decodeURI( project.name ) );
					$( "#container #toolbar #settings #name_input_container #name_input" ).val( decodeURI( project.name ) );
					$( "#container #toolbar #settings #name_input_container #name_input" ).attr( "disabled", false );
					$( "#container #toolbar #settings #name_input_container #name_input" ).focus();

					/* Add event listeners */
					$( "#container #toolbar #settings #name_input_container #name_input" ).on( "keyup blur", function( e ) {

						/* Save the change */
						if( e.key == "Enter" ) {

							var project_name_value = sanitise_input( $( this ).val() );

							if( project_name_value.match( /^\d/ ) ) {
								
								show_alert( "Project name cannot start with a number" );
							} else {
							
								if( project_name_value != "" ) {

									$( async () => {

										var check_name = project_name_value.toLowerCase().replace( / /g, "_" );

										var projects = await window.electronAPI.load_projects();
										var check_array = projects.map( function( val ) {
											return val.name.toLowerCase().replace( / /g, "_" );
										} );

										if( ( check_array.indexOf( check_name ) !== -1 ) && ( check_name != project.name.toLowerCase().replace( / /g, "_" ) ) ) {

											show_alert( "Project name already exist." );
										} else {

											/* Rename project folder */
											if( await window.electronAPI.rename_project( project.name.toLowerCase().replace( / /g, "_" ), project_name_value ) ) {

												project.name = project_name_value;

												/* Project renamed successfully */
												show_alert( "Project renamed successfully." );

												/* Reload the project */
												var data = await window.electronAPI.load_project_data( project_name_value.toLowerCase().replace( / /g, "_" ) );

												/* Set the project and load up the project view */
												if( data != false ) {

													project = data;

													/* Open the project view */
													load_project_view();

													return;
												} else {

													show_error( "Error reloading project." );
												}
											} else {

												show_error( "Error renaming project." );
											}											
										}
									} );
								}
							}

							/* Re-enable controls */
							enable_controls();

							/* Remove event listeners */
							$( "#container #toolbar #settings #name_input_container #name_input" ).unbind( "keyup blur" );
							
							/* Put things back the way they were */
							$( "#container #toolbar #settings #name_input_container #name_input" ).val( "" );
							$( "#container #toolbar #settings #name_input_container #name_input" ).attr( "placeholder", decodeURI( project.name ) );
							$( "#container #toolbar #settings #name_input_container #name_input" ).attr( "disabled", "disabled" );
						}
						/* Discard change */
						if( ( e.key == "Escape" ) || ( e.type == "blur" ) ) {

							/* Re-enable controls */
							enable_controls();

							/* Remove event listeners */
							$( "#container #toolbar #settings #name_input_container #name_input" ).unbind( "keyup blur" );
							
							/* Put things back the way they were */
							$( "#container #toolbar #settings #name_input_container #name_input" ).val( "" );
							$( "#container #toolbar #settings #name_input_container #name_input" ).attr( "placeholder", decodeURI( project.name ) );
							$( "#container #toolbar #settings #name_input_container #name_input" ).attr( "disabled", "disabled" );
						}
					} );
					break;
				case "save-project":

					/* Check if project already exists */
					$( async () => {

						if( await window.electronAPI.save_project( project.name.toLowerCase().replace( / /g, "_" ), JSON.stringify( project ) ) ) {

							/* Project created successfully */
							show_alert( "Project saved successfully." );

							/* Clear changes */
							clear_changes();
						} else {

							show_error( "Error saving project." );
						}
					} );
					break;
				case "export-project":

					/* Disable controls */
					disable_controls();

					/* Show the confirmation prompt */
					$( "#container #toolbar #settings #map_export #map_export_prompt" ).html( "What format would you like to export?" );
					$( "#container #toolbar #settings #map_export #map_done" ).css( "display", "none" );

					$( "#container #toolbar #settings #map_export" ).css( "display", "flex" );

					/* Add event listeners */
					$( "#container #toolbar #settings #map_export input[type=button]" ).on( "click" , function( e ) {
						
						if( $( this ).attr( "id" ) != "map_export_cancel" ) {

							$( async () => {

								/* Which format are we exporting */
								if( $( this ).attr( "id" ) == "map_export_gba" ) {

									var filter = { name: "GBA Header File", extensions: [ "h" ] };
								} else if( $( this ).attr( "id" ) == "map_export_ps" ) {

									var filter = { name: "PicoSystem Header File", extensions: [ "hpp" ] };
								} else if( $( this ).attr( "id" ) == "map_export_json" ) {

									var filter = { name: "JSON", extensions: [ "json" ] };
								}

								var data = await window.electronAPI.save_file_dialog( filter );
								
								if( data.cancelled == false ) {

									/* Check if we returned actual data */
									if( data.data != undefined ) {

										if( $( this ).attr( "id" ) == "map_export_gba" ) {

											var export_data = export_data_gba();
											var alert_msg = "Project exported for Game Boy Advance at ";
										} else if( $( this ).attr( "id" ) == "map_export_ps" ) {

											var export_data = export_data_ps();
											var alert_msg = "Project exported for PicoSystem at ";
										} else if( $( this ).attr( "id" ) == "map_export_json" ) {

											var export_data =  JSON.stringify( project );
											var alert_msg = "Project exported in JSON format at ";
										}
										
										if( await window.electronAPI.save_data( data.data, export_data ) ) {

											show_alert( alert_msg + data.data );
										} else {

											show_error( "Error exporting project." );
										}
									} else {

										show_error( "Error exporting project." );
									}
								}
							} );
						}

						/* Re-enable controls */
						enable_controls();

						/* Remove event listeners */
						$( "#container #toolbar #settings #map_export input[type=button]" ).unbind( "click" );

						/* Hide the confirmation prompt */
						$( "#container #toolbar #settings #map_export #map_export_prompt" ).html( "" );
						$( "#container #toolbar #settings #map_export" ).css( "display", "none" );
					} );
					break;
			}
		}
	} );
}

function clear_map_list_sortable() {
	
	if ( $( "#map_list .sortable" ).hasClass( "ui-sortable" ) ) {
		$( "#map_list .sortable" ).sortable( "destroy" );
	}
	$( "#map_list .sortable" ).unbind( "sortstart" );
	$( "#map_list .sortable" ).unbind( "sortstop" );
	$( "#map_list .sortable" ).unbind( "selectstart" );
}

function map_list_sortable() {
	
	/* Destroy existing sortable list */
	clear_map_list_sortable();

	/* Turn map list into a sortable list */
	$( "#map_list .sortable" ).sortable( {
		placeholder: "ui-state-highlight",
		items: "li:not(.ui-state-disabled)",
		delay: 200
	} );
	$( "#map_list .sortable" ).disableSelection();

	/* Add sortable list event listeners */
	$( "#map_list .sortable" ).on( "sortstart", function( e, ui ) {

		/* Temporarily ignore onClick event listener */
		$( this ).css("pointer-events", "none");
	} );
	$( "#map_list .sortable" ).on( "sortstop", function( e, ui ) {
		/* Once drag and drop ends, save the new order */

		/* Create a new blank array that will temporarily hold the new order */
		var newOrderArray = new Array();

		/* Add each map object in order */
		var i = 0;
		$.each( $( "#map_list .sortable" ).children(), function( k, v ) {
			
			/* Get texture objects in sort order */
			var map_obj = project.maps.find( obj => obj.id == $( v ).attr( "map_id" ) );

			/* Give it it's new order and increment */
			map_obj.order = i;
			i++;

			/* Add it to the temporary array */
			newOrderArray.push( map_obj );
		} );

		/* Set the new order in the local array */
		project.maps = newOrderArray;

		/* Log changes */
		log_change();
					
		/* Reload texture list */
		load_map_list();

		/* Re-instate onClick event listener */
		$( this ).css("pointer-events", "auto");
	} );
}

function sort_maps_by_order() {
	project.maps.sort( function( a, b ) {
		return ((a.order < b.order) ? -1 : ((a.order > b.order) ? 1 : 0));
	} );
}

function sort_maps_by_id() {
	
	project.maps.sort( function( a, b ) {
		return ((a.id < b.id) ? -1 : ((a.id > b.id) ? 1 : 0));
	} );
}