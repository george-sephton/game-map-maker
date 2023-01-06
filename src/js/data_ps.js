function export_data_ps() {

	/* Convert our data to the correct format for the Picosystem */
	var output = "";
	var h_output = "";

	output += "#pragma once\n\n";
	output += "namespace picosystem {\n\n";

	/* Start by exporting all the sprites */
	output += "  /*********************************************************************************\n";
	output += "    Sprites\n";
	output += "  *********************************************************************************/\n";

	h_output += "// sprites\n";

	sort_sprite_groups_by_gorder();

	/* Loop through each sprite group */
	$.each( project.sprites , function( gi, group ) {

		output += "  const uint16_t " + group.name.toLowerCase().replace( / /g, "_" ) + "[" +  ( group.sprites.length * group.size * group.size ) + "] = {\n";
		h_output += "const extern uint16_t " + group.name.toLowerCase().replace( / /g, "_" ) + "[" +  ( group.sprites.length * group.size * group.size ) + "];\n"
		
		sort_sprites_by_order( group.gid );

		$.each( group.sprites, function( si, sprite ) {

			/* Convert pixel values for Picosystem, clone to avoid altering the original */
			var convert_sprite = new Array();
			$.extend( true, convert_sprite, sprite.data ); /* Clone array */

			/* Loop through each row of the texture */
			$.each( convert_sprite, function( ri, sprite_row ) {

				/* Loop through each pixel */
				$.each( sprite_row, function( ci, sprite_cell ) {

					/* Check for transparent pixels */
					if( ( sprite_cell == "" ) || ( sprite_cell == undefined ) ) {

						/* Transparent pixel */
						sprite_cell_int = 0;
					} else {

						/* Convert value to int */
						var sprite_cell_int = parseInt( sprite_cell, 16 );
						/* Convert 24-bit colour to 12-bit colour for the Picosystem */
						sprite_cell_int = ( ((sprite_cell_int & 0xF0) >> 4) | ((sprite_cell_int & 0xF000) >> 8) | ((sprite_cell_int & 0xF00000) >> 12) );

						if ( sprite_cell_int == 0 ) {

							/* We need to convert black to not quite black, otherwise it'll be treated like a transparent pixel */
							sprite_cell_int = 0x01;
						}
					}

					/* Add to the output */
					convert_sprite[ri][ci] = "0x"+sprite_cell_int.toString(16).padStart(3, '0');
				} );
			} );

			/* Now convert array of values to string */
			var sprite_array = convert_sprite.toString();
			sprite_array = sprite_array.replace( /,/g, ", " );

			/* Add line breaks depending on sprite size */
			if( group.size == 16 )
				sprite_array = sprite_array.replace( /((?:.*?\s){15}.*?)\s/g, "$1\n    " )
			else
				sprite_array = sprite_array.replace( /((?:.*?\s){7}.*?)\s/g, "$1\n    " )

			output += "    " + sprite_array + ",\n";
		} );

		output += "  };\n\n";
	} );

	/* Next export all the textures */
	output += "  /*********************************************************************************\n";
	output += "    Textures\n";
	output += "  *********************************************************************************/\n";

	h_output += "\n// textures\n";

	sort_texture_groups_by_gorder();

	/* Loop through each texture group */
	$.each( project.textures , function( gi, group ) {

		output += "  const uint16_t " + group.name.toLowerCase().replace( / /g, "_" ) + "[" +  ( group.textures.length * 64 ) + "] = {\n";
		h_output += "const extern uint16_t " + group.name.toLowerCase().replace( / /g, "_" ) + "[" +  ( group.textures.length * 64 ) + "];\n";
		
		sort_textures_by_order( group.gid );

		$.each( group.textures, function( ti, texture ) {

			/* Convert pixel values for Picosystem, clone to avoid altering the original */
			var convert_texture = new Array();
			$.extend( true, convert_texture, texture.data ); /* Clone array */

			/* Loop through each row of the texture */
			$.each( convert_texture, function( ri, texture_row ) {

				/* If the row is completely blank, it won't export correctly so we need to pass a blank array */
				var converted_row = Array.from( { length: 8 }, () => null ); 

				if( texture_row.length != 0 )
					converted_row = texture_row;

				/* Loop through each pixel */
				$.each( converted_row, function( ci, texture_cell ) {

					/* Check for transparent pixels */
					if( ( texture_cell == "" ) || ( texture_cell == undefined ) ) {

						/* Transparent pixel */
						texture_cell_int = 0;
					} else {

						/* Convert value to int */
						var texture_cell_int = parseInt( texture_cell, 16 );
						/* Convert 24-bit colour to 12-bit colour for the Picosystem */
						texture_cell_int = ( ((texture_cell_int & 0xF0) >> 4) | ((texture_cell_int & 0xF000) >> 8) | ((texture_cell_int & 0xF00000) >> 12) );

						if ( texture_cell_int == 0 ) {

							/* We need to convert black to not quite black, otherwise it'll be treated like a transparent pixel */
							texture_cell_int = 0x01;
						}
					}

					/* Add to the output */
					convert_texture[ri][ci] = "0x"+texture_cell_int.toString(16).padStart(3, '0');
				} );
			} );

			/* Now convert array of values to string */
			var texture_array = convert_texture.toString();
			texture_array = texture_array.replace( /,/g, ", " );
			texture_array = texture_array.replace( /((?:.*?\s){7}.*?)\s/g, "$1\n    " )

			output += "    " + texture_array + ",\n";
		} );

		output += "  };\n\n";
	} );

	output += "  const uint16_t* _texture_map[" + project.textures.length + "] = {\n";

	/* Loop through each texture group */
	$.each( project.textures , function( i, group ) {

		output += "    " + group.name.toLowerCase().replace( / /g, "_" ) + ", // " + i + "\n";
	} );

	h_output += "\n// texture map\n";
	h_output += "const extern uint16_t* _texture_map[" + project.textures.length + "];\n";
	

	output += "  };\n\n";

	/* Next let's export the map settings */
	output += "  /*********************************************************************************\n";
	output += "    Map Settings\n";
	output += "  *********************************************************************************/\n";

	/* Sort the map settings array alphabetically by option name */
	sort_map_settings_by_name();

	/* Loop through each map setting */
	output += "  struct map_settings {\n";

	$.each( project.map_settings , function( i, setting ) {

		var var_type = "";
		switch( setting.type ) {

			case "string":  var_type = "char"; break;
			case "int":     var_type = "uint16_t"; break;
			case "bool":    var_type = "bool"; break;
		}

		/* Add the string length if needed */
		var var_string = "";
		if( setting.type == "string" ) {

			/* We first need to calculate the size of the longest string */
			var longest_string = 0;
			
			/* Loop through each map and find the longest string we have */
			$.each( project.maps , function( i, map ) {

				var map_settings_option_obj = map.map_settings.find( obj => obj.option == setting.option );

				if( map_settings_option_obj != undefined ) {

					/* Is this longer than we've seen before? */
					if( map_settings_option_obj.value.length > longest_string )
						longest_string = map_settings_option_obj.value.length;
				}
			} );

			/* Add an extra byte to the length to account for the null character */
			longest_string += 1;

			/* Format for the output */
			var_string = "[" + longest_string + "]";
		}

		/* Add to the output */
		output += "    " + var_type + " " + setting.option + var_string + ";\n";
	} );

	output += "  };\n\n";	

	/* Next let's export the maps */
	output += "  /*********************************************************************************\n";
	output += "    Maps\n";
	output += "  *********************************************************************************/\n";

	sort_maps_by_order();

	/* Used as the index for the map settings list */
	var map_count = 0;

	/* Loop through each map */
	$.each( project.maps , function( i, map ) {

		var map_name_conv = map.name.toLowerCase().replace( / /g, "_" );
		output += "  const struct map_tile _" + map_name_conv + "[" + map.height + "][" + map.width + "] = {\n";

		/* Loop through the map, one row at a time */
		$.each( map.data, function( ri, row ) {

			output += "    { ";
			
			/* Add each cell */
			$.each( row, function( ci, cell ) {


				output += "{ ";

				/* Get cell */
				var cell_output_map = project.maps.find( obj => obj.id == cell.exit_map_id );

				var cell_output_texture_gid = -1;
				var cell_output_texture_id = 0;

				if( cell.texture_gid != undefined ) {
					
					var cell_output_texture_group = project.textures.find( obj => obj.gid == cell.texture_gid );
					var cell_output_texture = cell_output_texture_group.textures.find( obj => obj.id == cell.texture_id );

					cell_output_texture_gid = cell_output_texture_group.gorder + 1;
					cell_output_texture_id = cell_output_texture.order;
				}

				var cell_output_bg_texture_gid = -1;
				var cell_output_bg_texture_id = 0;

				if( cell.bg_texture_gid != undefined ) {

					var cell_output_bg_texture_group = project.textures.find( obj => obj.gid == cell.bg_texture_gid );
					var cell_output_bg_texture = cell_output_bg_texture_group.textures.find( obj => obj.id == cell.bg_texture_id );

					cell_output_bg_texture_gid = cell_output_bg_texture_group.gorder + 1;
					cell_output_bg_texture_id = cell_output_bg_texture.order;
				}

				/* Add in the data for each cell */
				output += output_num(cell.top_layer) + ", ";
				output += output_num(cell.can_walk[0]) + ", " + output_num(cell.can_walk[1]) + ", " + output_num(cell.can_walk[2]) + ", " + output_num(cell.can_walk[3]) + ", ";
				output += output_num(cell_output_texture_gid) + ", " + output_num(cell_output_texture_id) + ", ";
				output += output_num(cell.texture_reverse_x) + ", " + output_num(cell.texture_reverse_y) + ", ";
				output += output_num(cell_output_bg_texture_gid) + ", " + output_num(cell_output_bg_texture_id) + ", ";
				output += output_num(cell.bg_texture_reverse_x) + ", " + output_num(cell.bg_texture_reverse_y) + ", ";
				output += output_num(cell.interact_en) + ", " + output_num(cell.interact_id) + ", ";
				output += output_num(cell.npc_en) + ", " + output_num(cell.npc_id) + ", ";
				output += output_num(cell.exit_tile) + ", " + output_num(cell_output_map.order) + ", {";
				output += cell.exit_map_dir[0] + ", " + cell.exit_map_dir[1] + "}, {";
				output += cell.exit_map_pos[0] + ", " + cell.exit_map_pos[1] + "} ";
				
				output += "}, ";		
			} );

			output += "},\n";
		} );

		output += "  };\n";

  		output += "  const struct map " + map_name_conv + " = { " + output_num(map.id) + ", *_" + map_name_conv + ", " + output_num(map.height) + ", " + output_num(map.width) + ", " + output_num(map_count) + " };\n"
  		map_count++;

  		/* Add the map settings */
  		output += "  const struct map_settings " + map_name_conv + "_settings = { ";

		/* Loop through all the map settings in the project */
		$.each( project.map_settings , function( i, option ) {

			/* Get the value of the current option */
			var map_settings_option_obj = map.map_settings.find( obj => obj.option == option.option );

			var show_value = "";
			if( map_settings_option_obj == undefined ) {

				/* This map has no value for this option, set it as the default */
				switch( option.type ) {

					case "string":  show_value = ""; break;
					case "int":     show_value = "0"; break;
					case "bool":    show_value = "false"; break;
				}
			} else {

				/* Copy the value */
				show_value = map_settings_option_obj.value;
			}

			/* Add the value to the output */
			switch( option.type ) {

				case "string":  output += "\"" + show_value + "\""; break;
				case "int":     output += output_num(show_value); break;
				case "bool":    output += show_value; break;
			}

			/* Add a delimiter if not on the last element */
			if( i < ( project.map_settings.length - 1 ) )
				output += ", ";
		} );

		output += " };\n\n"

	} );

	/* Finally add the map list and map settings list */
	output += "  map map_list[" + project.maps.length + "] = {\n";

	/* Loop through each map */
	$.each( project.maps , function( i, map ) {

		output += "    " + map.name.toLowerCase().replace( / /g, "_" ) + ", // " + i + "\n";
	} );

	output += "  };\n\n";

	output += "  map_settings map_settings_list[" + project.maps.length + "] = {\n";

	/* Loop through each map */
	$.each( project.maps , function( i, map ) {

		output += "    " + map.name.toLowerCase().replace( / /g, "_" ) + "_settings, // " + i + "\n";
	} );

	output += "  };\n\n";

	output += "}";

	return output;
}