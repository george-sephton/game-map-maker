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
				} else if( value.type == "int" ) {

					/* Integers */
					show_value = "<b>" + option_obj.value + "</b>";
				} else if( value.type == "bool" ) {

					/* Booleans */
					if( option_obj.value ) {
						show_value = '<input type="checkbox" class="checkbox-input" checked="checked" />';
					} else {
						show_value = '<input type="checkbox" class="checkbox-input" />';
					}
				}
			} else {

				switch( value.type ) {

					case "string":  show_value = "<em>empty</em>"; break;
					case "int":     show_value = "<em>0</em>"; break;
					case "bool":    show_value = '<input type="checkbox" class="checkbox-input" />'; break;
				}
			}
		}

		var store_value = "";

		if( ( ( value.type == "int" ) || ( value.type == "string" ) ) && ( !delete_option ) )
			store_value = ' old_value="' + show_value + '"';

		/* Add the rows */
		$( "#container #map_settings #map_settings_content #map_settings_options" ).append( '<div class="settings_row" option_name="' + value.option + '"><div class="settings_name' + ( delete_option ? "" : " name_editing" ) + '">' + value.option + '</div><div class="settings_value"' + store_value + '>' + show_value + '</div></div>' );
	} );

	/* Load event listeners */
	map_settings_toolbar_event_listeners();

	/* Clear name editing event listeners */
	clear_map_settings_value_event_listeners();

	if( delete_option ) {
		
		/* Add event listeners to the delete icons */
		map_settings_delete_option_event_listeners();
	} else {

		/* Add event listeners to the values to allow editing */
		map_settings_value_event_listeners();

		/* Add event listeners to the name to allow editing */
		map_settings_name_event_listeners();
	}
}

function map_settings_panel_show() {

	$( "#container #map_settings" ).css( "display", "flex" );
	$( "#container #map_settings_hidden" ).css( "display", "none" );

	/* content div width has to be adjusted manually else it won't allow the overflow to work correctly */
	$( "#container #content" ).css( "max-width", "calc(100vw - 350px - 370px - 40px)" );

	/* Store the state for later */
	map_settings_show = true;
}

function map_settings_panel_hide() {
	
	$( "#container #map_settings" ).css( "display", "none" );
	$( "#container #map_settings_hidden" ).css( "display", "flex" );
	
	/* content div width has to be adjusted manually else it won't allow the overflow to work correctly */
	$( "#container #content" ).css( "max-width", "calc(100vw - 350px - 30px - 50px)" );

	/* Store the state for later */
	map_settings_show = false;
}

function map_settings_panel_event_listeners() {

	$( "#container #map_settings #map_settings_heading i, #container #map_settings_hidden i" ).click( function() {

		if( $( "#container #map_settings" ).css( "display" ) == "flex" ) {

			map_settings_panel_hide();
		} else {

			map_settings_panel_show();
		}
	} );
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

function clear_map_settings_name_event_listeners() {

	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_name" ).unbind( "mousedown" );
	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_name" ).unbind( "dblclick" );
}

function map_settings_name_event_listeners() {

	/* Remove all event listeners */
	clear_map_settings_name_event_listeners();

	/* Prevent text highlight on double click */
	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_name" ).mousedown( function() { return false; } );

	/* Name change event listener */
	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_name" ).dblclick( function() {

		var option_name = $( this ).parent().attr( "option_name" );
		var option_obj = project.map_settings.find( obj => obj.option == option_name );

		/* Change the value to an input and focus */
		$( this ).html( '<input type="text" class="text-input" placeholder="' + option_name + '" />' );
		$( this ).find( "input" ).focus();
		
		/* Store the current selector */
		var val_selector = $( this );

		/* Add event listeners to allow saving */
		var input_selector = $( this ).find( "input" );

		input_selector.on( "keyup blur", function( e ) {

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

					/* Check to see if the name already exists */
					if( ( check_array.indexOf( check_name ) !== -1 ) && ( check_name != option_name ) ) {
						
						show_error( "Option name already exists." );
					} else {

						/* All good, let's save the name */
						option_obj.option = check_name;

						/* Sort the map settings array alphabetically by option name */
						sort_map_settings_by_name();

						/* Update all the maps */
						$.each( project.maps, function( key, map ) {
							
							/* Get the option object for each map */
							var map_settings_option_obj = map.map_settings.find( obj => obj.option == option_name );

							/* And update */
							if( map_settings_option_obj != undefined ) {

								map_settings_option_obj.option = check_name;
							}
						} );

						/* Log changes */
						log_change();

						/* Unbind event listeners */
						input_selector.unbind( "keyup blur" );

						/* Reload the map settings panel */
						load_map_settings();
					}
				}
			}

			/* Discard the new option */
			if( ( e.key == "Escape" ) || ( e.type == "blur" ) ) {
			
				val_selector.html( option_name );

				/* Unbind event listeners */
				input_selector.unbind( "keyup blur" );
			}
		} );

	} );
}

function clear_map_settings_value_event_listeners() {

	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_value:not(input)" ).unbind( "mousedown" );
	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_value:not(input)" ).unbind( "dblclick" );
	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_value input[type=checkbox]" ).unbind( "change" );
}

function map_settings_value_event_listeners() {

	/* Prevent text highlight on double click */
	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_value:not(input)" ).mousedown( function() { return false; } );

	/* Boolean event listeners */
	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_value input[type=checkbox]" ).on( "change", function() {

		/* Get the variables for the option value we're editing and the value */
		var option_name = $( this ).parent().parent().attr( "option_name" );
		var option_value = $( this ).is( ":checked" );

		/* Save the value */
		var map_option_obj = selected_map.map_settings.find( obj => obj.option == option_name );

		if( ( map_option_obj == "" ) || ( map_option_obj == undefined ) ) {

			/* The current map doesn't have anything assigned for this option */
			var new_option_obj = new Object();
			new_option_obj.option = option_name;
			new_option_obj.value = option_value;

			/* Add in our new value */
			selected_map.map_settings.push( new_option_obj );
		} else {

			/* Update the exisiting option */
			map_option_obj.value = option_value;
		}

		/* Log changes */
		log_change();
	} );

	/* String and Integer event listeners */
	$( "#container #map_settings #map_settings_content #map_settings_options .settings_row .settings_value:not(input)" ).dblclick( function() {

		/* Get the variables for the option value we're editing */
		var option_name = $( this ).parent().attr( "option_name" );
		var option_value = "";

		var option_obj = project.map_settings.find( obj => obj.option == option_name );
		var map_option_obj = selected_map.map_settings.find( obj => obj.option == option_name );

		/* Ignore any booleans, this is only for strings and ints */
		if( option_obj.type != "bool" ) {

			/* Get the actual value */
			if( ( map_option_obj == "" ) || ( map_option_obj == undefined ) ) {

				/* Option not found, default to empty */
				switch( option_obj.type ) {

					case "string":  option_value = ""; break;
					case "int":     option_value = 0; break;
				}
			} else {

				/* Option already has a value assigned */
				option_value = map_option_obj.value;
			}

			/* Change the value to an input */
			var input_html = "";

			switch( option_obj.type ) {

				case "int": /* Option is an int, show a textbox */
					
					input_html = '<input type="text" class="number-input" placeholder="' + option_value + '" />';
					break;
				case "string": /* Option is a string, show a textbox */
					
					input_html = '<input type="text" class="text-input" placeholder="' + option_value + '" />';
					break;
			}

			/* Change the HTML to our input and focus */
			$( this ).html( input_html );
			$( this ).find( "input" ).focus();

			/* Ensure only numbers are allowed in int fields */
			if( option_obj.type == "int" ) {

				/* Remove any existing bindings */
				$( ".number-input" ).unbind( "input" );

				$( ".number-input" ).on( "input", function( e ) {
					
					$( this ).val( $( this ).val().replace( /\D/g, "" ) );
					
					if( ( e.which < 48 || e.which > 57) ) {
						
						/* Disallow typing numbers */
						e.preventDefault();
					}
				} );
			}
		
			/* Store the current selector */
			var val_selector = $( this );

			/* Add event listeners to allow saving */
			var input_selector = $( this ).find( "input" );

			input_selector.on( "keyup blur", function( e ) {
								
				/* Save the new option */
				if( e.key == "Enter" ) {

					/* Get entered name */
					var new_value = sanitise_input( $( this ).val() );

					if( ( ( new_value == "" ) || ( new_value == undefined ) ) && ( option_obj.type == "int" ) ) {

						/* User entered a blank value for an integer, change it to a 0 */
						new_value = 0;
					}

					/* Save the value */
					if( ( map_option_obj == "" ) || ( map_option_obj == undefined ) ) {

						/* The current map doesn't have anything assigned for this option */
						var new_option_obj = new Object();
						new_option_obj.option = option_name;
						new_option_obj.value = new_value;

						/* Add in our new value */
						selected_map.map_settings.push( new_option_obj );
					} else {

						/* Update the exisiting option */
						map_option_obj.value = new_value;
					}

					/* Revert the table back to normal */
					if( ( ( new_value == "" ) || ( new_value == undefined ) ) && ( option_obj.type == "string" ) ) {

						/* The new value is blank, let's show this as empty */
						val_selector.html( "<em><b>empty</b></em>" );

					} else {

						/* Draw the entered value */
						val_selector.html( "<b>" + new_value + "</b>" );
					}

					/* Store the new old value */
					val_selector.attr( "old_value", val_selector.html() );

					/* Unbind event listeners */
					input_selector.unbind( "keyup blur" );

					/* Log changes */
					log_change();
				}

				/* Discard the new option */
				if( ( e.key == "Escape" ) || ( e.type == "blur" ) ) {
				
					val_selector.html( val_selector.attr( "old_value" ) );

					/* Unbind event listeners */
					input_selector.unbind( "keyup blur" );
				}
			} );

			return false;
		}
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