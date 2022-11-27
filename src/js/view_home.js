function load_project_list() {

	/* Show project view elements */
	$( "#container #sidebar" ).css( "display", "none" );
	$( "#container #sidebar #texture_list_toolbar_rename" ).css( "display", "none" );
	$( "#container #sidebar #texture_list_toolbar_delete" ).css( "display", "none" );

	$( "#container #content" ).css( "max-width", "100%" );

	$( "#container #content #toolbar" ).css( "display", "none" );
	$( "#container #content #project_view" ).css( "display", "flex" );

	$( "#container #content #project_view #project_list_container" ).css( "display", "flex" );
	$( "#container #content #project_view #sprite_editor_container" ).css( "display", "none" );
	$( "#container #content #project_view #sprite_list_container" ).css( "display", "none" );
	$( "#container #content #project_view #map_list_container" ).css( "display", "none" );
	$( "#container #content #project_upload" ).css( "display", "none" );

	$( "#container #content #map_editor_container" ).css( "display", "none" );
	$( "#container #content #map_editor_container #map_editor" ).css( "display", "none" );
	$( "#container #content #map_editor_container #map_editor_loading" ).css( "display", "none" );

	$( "#container #toolbar #settings #name_input_container #paint_auto_inc_en" ).css( "display", "none" );
	$( "#container #toolbar #settings #name_input_container label[for='paint_auto_inc_en']" ).css( "display", "none" );

	/* Show project icons */
	$( ".project_functions" ).css( "display", "block" );
	$( ".map_editing_functions" ).css( "display", "none" );

	/* Clear project list */
	$( "#project_list ul" ).html( "" );
	$( "#project_list ul li" ).css( "color", "#000" );

	/* Load map list */
	$( async () => {

		var projects = await window.electronAPI.load_projects();

		if( projects.length != 0 ) {

			/* Add all the maps to the list */
			$.each( projects, function( key, value ) {
				$( "#project_list ul" ).append( '<li class="" project_name="' + value.name + '">' + value.project + '</li>' );
			} );

			/* Add event listeners to the list */
			project_list_event_listeners();	
		}
	} );

	/* Toolbar event listeners */
	project_list_toolbar_event_listeners();

	/* Set the current view */
	current_view = "home";
}

function clear_project_list_event_listeners() {
	
	$( "#container #content #project_list ul li" ).unbind( "click" );
	$( "#container #content #project_list" ).unbind( "click" ); /* For click out - not implemented */
}

function project_list_event_listeners() {

	/* Remove existing event listeners */
	clear_project_list_event_listeners();

	/* Add onClick event listeners */
	$( "#container #content #project_list ul li" ).on( "click" , function( e ) {
		
		/* Ignore clicks on the items in the project list when controls are disabled */
		if( controls_disabled == false ) {
			
			/* Set the map */
			var project_name = $( this ).attr( "project_name" );

			/* Load the data */
			$( async () => {

				var data = await window.electronAPI.load_project_data( project_name );

				/* Set the project and load up the project view */
				if( data != false ) {

					project = data;

					$( "#overlay #overlay_text" ).html( "Project Loading" );
					$( "#overlay" ).css( "display", "flex" );

					/* Update cached images */
					update_cached_images();

					/* Clear changes */
					clear_changes();

					/* Open the project view */
					load_project_view();
				}
			} );
		}
	});
}

/* None of this is elegant, but it works great! */
var _image_cache_count, _image_cache_total, _image_cache_count_errors;
window.electronAPI.update_cached_image_callback( ( event, value ) => {
	
	/* Return value received from our update_cached_image function, increment the count */
	_image_cache_count++;

	/* If we had an error, add it to the count */
	if( !value ) _image_cache_count_errors++;

	/* Once all images have been re-cached, the project is ready to be shown */
	if ( _image_cache_count >= _image_cache_total ) {

		/* All images updated, let's remove the overlay */
		$( "#overlay" ).css( "display", "none" );

		/* See if we had any errors */
		if( _image_cache_count_errors != 0 ) {

			/* We had errors along the way, go back to the project list and show an error */
			load_project_list();
			show_error( "Error loading project." );
		}
	}
} );

function update_cached_images() {

	$( async () => {

		/* Calculate total number of textures */
		_image_cache_total = 0;
		$.each( project.textures , function( gi, group ) {
			_image_cache_total += group.textures.length;
		} );

		/* Reset all counters */
		_image_cache_count = 0;
		_image_cache_count_errors = 0;

		/* First delete all old cached images */
		if( await window.electronAPI.delete_all_cached_images( project.name.toLowerCase().replace( / /g, "_" ) ) ) {

			/* Then loop through each sprite group */
			$.each( project.textures , function( gi, g_texture ) {

				sort_textures_by_order( g_texture.gid );

				/* Loop through each sprite in the group */
				$.each( g_texture.textures, function( ti, texture ) {

					window.electronAPI.update_cached_image( project.name.toLowerCase().replace( / /g, "_" ), "textures", 8, ( g_texture.name + "_" + ti ).toLowerCase().replace( / /g, "_" ), texture );
				} );
			} );			
		} else {

			show_error( "Error caching project textures." );
		}
	} );
}

function clear_project_list_toolbar_event_listeners() {
	
	$( "#container #content #project_view #project_list_container #project_list_toolbar i" ).unbind( "click" );
}

function project_list_toolbar_event_listeners() {

	/* Remove all event listeners */
	clear_project_list_toolbar_event_listeners();

	/* Project toolbar event listener */
	$( "#container #content #project_view #project_list_container #project_list_toolbar i" ).on( "click", function() {

		/* Check if functions are disabled */
		if( controls_disabled == false ) {

			var func = $( this ).attr( "func" );
			
			switch( func ) {
				case "new-project":
					
					/* Disable controls - don't hide the name input */
					disable_controls( false );

					$( "#container #content #project_view #project_list_container #project_list_toolbar" ).css( "display", "none" );
					$( "#container #content #project_view #project_list_container #project_list_new_project_name" ).css( "display", "flex" );

					$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).val( "" );
					$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).attr( "placeholder", "Enter new project name" );
					$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).focus();

					/* Add event listeners */
					$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).on( "keyup blur", function( e ) {

						/* Save the change */
						if( e.key == "Enter" ) {

							var project_name_value = sanitise_input( $( this ).val() );

							if( project_name_value.match( /^\d/ ) ) {
								
								show_alert( "Project name cannot start with a number" );
							} else {

								/* Check if project already exists */
								$( async () => {

									var check_name = project_name_value.toLowerCase().replace( / /g, "_" );

									var projects = await window.electronAPI.load_projects();
									var check_array = projects.map( function( val ) {
										return val.name.toLowerCase().replace( / /g, "_" );;
									} );

									if( check_array.indexOf( check_name ) !== -1 ) {

										show_alert( "Project name already exists." );
									} else {

										/* Create new project and save to local directory */
										var empty_project = new Object();
										empty_project.name = project_name_value;
										empty_project.textures = new Array();
										empty_project.sprites = new Array();
										empty_project.maps = new Array();

										if( await window.electronAPI.save_project( check_name, JSON.stringify( empty_project ) ) ) {

											/* Project created successfully */
											show_alert( "Project created successfully." );

											/* Open the project view */
											project = empty_project;
											load_project_view();
										} else {

											show_error( "Error creating project." );
										}
									}
								} );
							}

							/* Put things back the way they were */
							$( "#container #content #project_view #project_list_container #project_list_toolbar" ).css( "display", "flex" );
							$( "#container #content #project_view #project_list_container #project_list_new_project_name" ).css( "display", "none" );
							$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).val( "" );

							/* Re-enable controls */
							enable_controls();

							/* Remove event listeners */
							$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).unbind( "keyup blur" );
						}

						/* Discard change */
						if( ( e.key == "Escape" ) || ( e.type == "blur" ) ) {

							/* Re-enable controls */
							enable_controls();

							/* Remove event listeners */
							$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).unbind( "keyup blur" );
							
							/* Put things back the way they were */
							$( "#container #content #project_view #project_list_container #project_list_toolbar" ).css( "display", "flex" );
							$( "#container #content #project_view #project_list_container #project_list_new_project_name" ).css( "display", "none" );
							$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).val( "" );
						}
					} );
					break;
				case "import-project":

					$( async () => {
						
						var data = await window.electronAPI.import_project();

						if( data.cancelled == false ) {

							if( data.data ) {

								/* Disable controls - don't hide the name input */
								disable_controls( false );

								$( "#container #content #project_view #project_list_container #project_list_toolbar" ).css( "display", "none" );
								$( "#container #content #project_view #project_list_container #project_list_new_project_name" ).css( "display", "flex" );

								$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).val( "" );
								$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).attr( "placeholder", "Enter imported project name" );
								$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).focus();

								/* Add event listeners */
								$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).on( "keyup blur", function( e ) {

									/* Save the change */
									if( e.key == "Enter" ) {

										var project_name_value = sanitise_input( $( this ).val() );

										if( project_name_value.match( /^\d/ ) ) {
											
											show_alert( "Project name cannot start with a number" );
										} else {

											/* Check if project already exists */
											$( async () => {

												var check_name = project_name_value.toLowerCase().replace( / /g, "_" );

												var projects = await window.electronAPI.load_projects();
												var check_array = projects.map( function( val ) {
													return val.name.toLowerCase().replace( / /g, "_" );;
												} );

												if( check_array.indexOf( check_name ) !== -1 ) {

													show_alert( "Project name already exists." );
												} else {

													/* Change name of imported project and save to local directory */
													data.data.name = project_name_value;

													if( await window.electronAPI.save_project( check_name, JSON.stringify( data.data ) ) ) {

														/* Project created successfully */
														$( "#overlay #overlay_text" ).html( "Project Loading" );
														$( "#overlay" ).css( "display", "flex" );

														/* Update cached images */
														update_cached_images();

														/* Open the project view */
														project = data.data;
														load_project_view();
													} else {

														show_error( "Error creating project." );
													}
												}
											} );
										}

										/* Put things back the way they were */
										$( "#container #content #project_view #project_list_container #project_list_toolbar" ).css( "display", "flex" );
										$( "#container #content #project_view #project_list_container #project_list_new_project_name" ).css( "display", "none" );
										$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).val( "" );

										/* Re-enable controls */
										enable_controls();

										/* Remove event listeners */
										$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).unbind( "keyup blur" );
									}

									/* Discard change */
									if( ( e.key == "Escape" ) || ( e.type == "blur" ) ) {

										/* Re-enable controls */
										enable_controls();

										/* Remove event listeners */
										$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).unbind( "keyup blur" );
										
										/* Put things back the way they were */
										$( "#container #content #project_view #project_list_container #project_list_toolbar" ).css( "display", "flex" );
										$( "#container #content #project_view #project_list_container #project_list_new_project_name" ).css( "display", "none" );
										$( "#container #content #project_view #project_list_container #project_list_new_project_name #new_project_name" ).val( "" );
									}
								} );							
							} else {

								show_error( "Error importing project." );
							}
						}
					} );
					break;
			}
		}
	} );
}