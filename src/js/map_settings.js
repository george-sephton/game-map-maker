function load_map_settings( delete_option = true ) {

	/* Clear the options list */
	$( "#container #map_settings #map_settings_content #map_settings_options" ).html( "" );

	/* Set the border */
	if( project.map_settings.length == 0 ) {
		
		$( "#container #map_settings #map_settings_content #map_settings_options" ).css( "border", "0" );
	} else {

		$( "#container #map_settings #map_settings_content #map_settings_options" ).css( "border", "1px solid #333" );
	}

	/* Add each option to the list */
	$.each( project.map_settings, function( key, value ) {
		
		/* Are we showing delete icons */
		if( delete_option ) {

			var show_value = '<i class="bi-trash" id="delete_option"></i>';
		} else {

			var show_value = '';
		}
		/* Add the rows */
		$( "#container #map_settings #map_settings_content #map_settings_options" ).append( '<div class="settings_row" id="option_' + value.option + '"><div class="settings_name">' + value.option + '</div><div class="settings_value">' + show_value + '</div></div>' );


	} );




	/* Load event listeners */
	map_settings_toolbar_event_listeners();
}

function clear_map_settings_toolbar_event_listeners() {
	
	$( "#container #map_settings #map_settings_toolbar i" ).unbind( "click" );
}

function map_settings_toolbar_event_listeners() {
	
	/* Remove all event listeners */
	clear_map_settings_toolbar_event_listeners();

	/* Map settings toolbar event listeners */
	$( "#container #map_settings #map_settings_toolbar i" ).click( function() {
		
		if( controls_disabled == false ) {

			var func = $( this ).attr( "func" );
			console.log( func );
			
			switch( func ) {
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

						console.log( $( this ).attr( "id" ) );

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
							$( "#container #map_settings #map_settings_content #map_settings_options" ).prepend( '<div class="settings_row" id="option_new"><div class="settings_name"><input type="text" class="text-input" placeholder="New Option" /></div><div class="settings_value"></div></div>' );

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

function sort_map_settings_by_name() {

	var sort_group = project.map_settings;

	sort_group.sort( function( a, b ) {
		return ((a.option < b.option) ? -1 : ((a.option > b.option) ? 1 : 0));
	} );
}