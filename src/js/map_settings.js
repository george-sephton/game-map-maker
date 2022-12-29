function load_map_settings( delete_option = false ) {

	/* Clear the options list */
	$( "#container #map_settings #map_settings_content #map_settings_options" ).html( "" );

	/* Set the border */
	$( "#container #map_settings #map_settings_content #map_settings_options" ).css( "border", "1px solid #333" );

	/* Add the headings */
	$( "#container #map_settings #map_settings_content #map_settings_options" ).append( '<div class="settings_row_heading"><div class="settings_name">Name</div><div class="settings_value">Value</div></div>' );

	/* Add each option to the list */
	$.each( project.map_settings, function( key, value ) {
		
		/* Are we showing delete icons */
		if( delete_option ) {

			var show_value = '<i class="bi-trash" id="delete_option"></i>';
		} else {

			/* Get the current maps option value */
			var option_obj = selected_map.map_settings.find( obj => obj.option == value.option );
			var show_value = "";

			/* If the option is unassigned show the default value */
			if( option_obj != undefined ) {
				
				/* Show "empty" if we have an empty string */
				if( value.type == "string" ) {

					if( ( option_obj.value == undefined ) || ( option_obj.value == "" ) )
						show_value = "<em><b>empty</b></em>";
					else
						show_value = "<b>" + option_obj.value + "</b>";
				} else {

					/* Ints and bools */
					show_value = "<b>" + option_obj.value + "</b>"
				}
			} else {

				switch( value.type ) {

					case "string":  show_value = "<em>empty</em>"; break;
					case "int":     show_value = "<em>0</em>"; break;
					case "bool":    show_value = "<em>false</em>"; break;
				}
			}
		}
		/* Add the rows */
		$( "#container #map_settings #map_settings_content #map_settings_options" ).append( '<div class="settings_row" option_name="' + value.option + '"><div class="settings_name">' + value.option + '</div><div class="settings_value">' + show_value + '</div></div>' );
	} );

	/* Load event listeners */
	map_settings_toolbar_event_listeners();

	if( delete_option ) {
		
		/* Add event listeners to the delete icons */
		map_settings_delete_option_event_listeners();
	} else {

		/* Add event listeners to the values to allow editing */
		map_settings_value_event_listeners();
	}
}

function clear_map_settings_toolbar_event_listeners() {
	
	$( "#container #map_settings #map_settings_toolbar i" ).unbind( "click" );
}

function map_settings_toolbar_event_listeners() {
	
	/* Remove all event listeners */
	clear_map_settings_toolbar_event_listeners();

	/* Map settings toolbar event listeners */
	$( "#container #map_settings #map_settings_toolbar i" ).click( function() {

		var func = $( this ).attr( "func" );
		
		if( ( controls_disabled == false ) || ( func == "delete-option" ) ) {

			switch( func ) {
				case "delete-option":

					/* See if we're switching to delete mode */
					if( controls_disabled == false ) {

						/* Disable controls - don't hide the name input */
						disable_controls( false );

						/* Re-enable the delete icon and highlight */
						$( "#container #map_settings #map_settings_toolbar #settings_toolbar_delete" ).removeClass( "resize_disabled" );
						$( "#container #map_settings #map_settings_toolbar #settings_toolbar_delete" ).addClass( "selected_tool" );

						/* Show the warning */
						$( "#container #map_settings #map_settings_content #map_settings_delete_warning" ).css( "display", "flex" );

						/* Reload the map settings list but with the delete options icons */
						load_map_settings( true );
					} else {

						/* Revert back to normal */
						enable_controls();

						/* Re-enable the delete icon and highlight */
						$( "#container #map_settings #map_settings_toolbar #settings_toolbar_delete" ).removeClass( "selected_tool" );

						/* Hide the warning */
						$( "#container #map_settings #map_settings_content #map_settings_delete_warning" ).css( "display", "none" );

						/* Reload the map settings list but without the delete options icons */
						load_map_settings( false );
					}
					break;
				case "new-option":

					/* Disable controls - don't hide the name input */
					disable_controls( false );

					/* Hide the toolbar and show the new option prompt */
					$( "#container #map_settings #map_settings_toolbar" ).css( "display", "none" );
					$( "#container #map_settings #map_settings_toolbar_new_option" ).css( "display", "flex" );

					/* Add event listners for escape key to discard change */
					$( document ).on( "keyup", function( e ) {
						
						if( e.key == "Escape" ) {

							/* Exit new option confirmation */
							$( "#container #map_settings #map_settings_toolbar_new_option" ).css( "display", "none" );
							$( "#container #map_settings #map_settings_toolbar" ).css( "display", "flex" );
							
							/* Unbind event listeners */
							$( document ).unbind( "keyup" );
							$( "#container #map_settings #map_settings_toolbar_new_option input[type=button]" ).unbind( "click" );

							/* Enable controls */
							enable_controls();
						}
					});

					/* Add event listeners for buttons */
					$( "#container #map_settings #map_settings_toolbar_new_option input[type=button]" ).click( function() {

						if( $( this ).attr( "id" ) == "setting_new_option_cancel" ) {

							/* Exit new option confirmation */
							$( "#container #map_settings #map_settings_toolbar_new_option" ).css( "display", "none" );
							$( "#container #map_settings #map_settings_toolbar" ).css( "display", "flex" );
							
							/* Unbind event listeners */
							$( document ).unbind( "keyup" );
							$( "#container #map_settings #map_settings_toolbar_new_option input[type=button]" ).unbind( "click" );

							/* Enable controls */
							enable_controls();
						} else {

							/* Get new option type */
							var option_type = "string";

							switch( $( this ).attr( "id" ) ) {

								case "setting_new_option_string":  option_type = "string"; break;
								case "setting_new_option_int":     option_type = "int"; break;
								case "setting_new_option_bool":    option_type = "bool"; break;
							}

							/* Exit new option confirmation */
							$( "#container #map_settings #map_settings_toolbar_new_option" ).css( "display", "none" );
							$( "#container #map_settings #map_settings_toolbar" ).css( "display", "flex" );
							
							/* Unbind event listeners */
							$( document ).unbind( "keyup" );
							$( "#container #map_settings #map_settings_toolbar_new_option input[type=button]" ).unbind( "click" );

							/* Add the new option row */
							$( '<div class="settings_row" id="option_new"><div class="settings_name"><input type="text" class="text-input" placeholder="New Option" /></div><div class="settings_value"></div></div>' ).insertAfter( "#container #map_settings #map_settings_content #map_settings_options .settings_row_heading" );

							/* Focus on the name input */
							$( "#container #map_settings #map_settings_content #map_settings_options #option_new .settings_name input" ).focus();

							/* Add event listeners */
							$( "#container #map_settings #map_settings_content #map_settings_options #option_new .settings_name input" ).on( "keyup blur", function( e ) {
								
								/* Save the new option */
								if( e.key == "Enter" ) {

									/* Get entered name */
									var new_name = sanitise_input( $( this ).val() );
									if( new_name.match( /^\d/ ) ) {
										
										show_error( "Option name cannot start with a number" );
									} else {

										/* Check if name already exists */
										var check_name = new_name.toLowerCase().replace( / /g, "_" );
										var check_array = project.map_settings.map( function( val ) {
											return val.option.toLowerCase().replace( / /g, "_" );
										} );

										if( check_array.indexOf( check_name ) !== -1 ) {
											
											show_error( "Option name already exists." );
										} else {

											/* Add the new option to the project map settings array */
											var new_obj = new Object();
											new_obj.option = check_name;
											new_obj.type = option_type;

											project.map_settings.push( new_obj );

											/* Sort the map settings array alphabetically by option name */
											sort_map_settings_by_name();
							
											/* Unbind event listeners */
											$( document ).unbind( "keyup" );
											$( "#container #map_settings #map_settings_toolbar_new_option input[type=button]" ).unbind( "click" );
											$( "#container #map_settings #map_settings_content #map_settings_options #option_new .settings_name input" ).unbind( "keyup blur" );

											/* Enable controls */
											enable_controls();

											/* Log changes */
											log_change();

											/* Reload the map settings panel */
											load_map_settings();
										}
									}
								}

								/* Discard the new option */
								if( ( e.key == "Escape" ) || ( e.type == "blur" ) ) {
							
									/* Unbind event listeners */
									$( document ).unbind( "keyup" );
									$( "#container #map_settings #map_settings_toolbar_new_option input[type=button]" ).unbind( "click" );
									$( "#container #map_settings #map_settings_content #map_settings_options #option_new .settings_name input" ).unbind( "keyup blur" );

									/* Enable controls */
									enable_controls();

									/* Reload the map settings panel */
									load_map_settings();
								}
							} );
						}
					} );
					break;
			}
		}
	} );
}

function clear_map_settings_value_event_listeners() {

	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_value" ).unbind( "dblclick" );
}

function map_settings_value_event_listeners() {

	/* Remove all event listeners */
	clear_map_settings_value_event_listeners();

	/* Map settings toolbar event listeners */
	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_value" ).dblclick( function() {

		console.log( $( this ).parent().attr( "option_name" ) );
	} );
}

function clear_map_settings_delete_option_event_listeners() {
	
	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_value #delete_option" ).unbind( "click" );
}

function map_settings_delete_option_event_listeners() {
	
	/* Remove all event listeners */
	clear_map_settings_delete_option_event_listeners();

	/* Map settings toolbar event listeners */
	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_value #delete_option" ).click( function() {
		
		/* Show the confirmation prompt and hide the toolbar */
		$( "#container #map_settings #map_settings_toolbar" ).css( "display", "none" );
		$( "#container #map_settings #map_settings_toolbar_delete_option" ).css( "display", "flex" );

		/* Set the delete option attribute */
		$( "#container #map_settings #map_settings_toolbar_delete_option #setting_delete_option_confirm" ).attr( "delete_option", $( this ).parent().parent().attr( "option_name" ) )

		/* Add event listners for escape key to discard change */
		$( document ).on( "keyup", function( e ) {
			
			if( e.key == "Escape" ) {

				/* Exit delete option confirmation */
				$( "#container #map_settings #map_settings_toolbar_delete_option" ).css( "display", "none" );
				$( "#container #map_settings #map_settings_toolbar" ).css( "display", "flex" );
				
				/* Unbind event listeners */
				$( document ).unbind( "keyup" );
				$( "#container #map_settings #map_settings_toolbar_delete_option input[type=button]" ).unbind( "click" );
			}
		});

		/* Add event listeners for buttons */
		$( "#container #map_settings #map_settings_toolbar_delete_option input[type=button]" ).click( function() {

			if( $( this ).attr( "id" ) == "setting_delete_option_confirm" ) {

				/* Create a global variable so we can pass it to functions later on */
				var delete_option = $( this ).attr( "delete_option" );

				/* Remove the option from the project map settings list */
				project.map_settings = project.map_settings.filter( obj => obj.option != delete_option );

				/* Sort the map settings array alphabetically by option name */
				sort_map_settings_by_name();

				/* Remove the option from all map settings lists */
				$.each( project.maps, function( key, map ) {
					
					map.map_settings = map.map_settings.filter( obj => obj.option != delete_option );
				} );

				/* Exit delete option confirmation */
				$( "#container #map_settings #map_settings_toolbar_delete_option" ).css( "display", "none" );
				$( "#container #map_settings #map_settings_toolbar" ).css( "display", "flex" );
				
				/* Unbind event listeners */
				$( document ).unbind( "keyup" );
				$( "#container #map_settings #map_settings_toolbar_delete_option input[type=button]" ).unbind( "click" );

				/* Log changes */
				log_change();

				/* Reload the map settings panel */
				load_map_settings( true );
			} else {

				/* Exit delete option confirmation */
				$( "#container #map_settings #map_settings_toolbar_delete_option" ).css( "display", "none" );
				$( "#container #map_settings #map_settings_toolbar" ).css( "display", "flex" );
				
				/* Unbind event listeners */
				$( document ).unbind( "keyup" );
				$( "#container #map_settings #map_settings_toolbar_delete_option input[type=button]" ).unbind( "click" );
			}
		} );
	} );
}

function sort_map_settings_by_name() {

	var sort_group = project.map_settings;

	sort_group.sort( function( a, b ) {
		return ((a.option < b.option) ? -1 : ((a.option > b.option) ? 1 : 0));
	} );
}