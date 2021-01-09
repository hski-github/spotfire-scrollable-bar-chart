/**
 * Get access to the Spotfire Mod API by providing a callback to the initialize method.
 * @param {Spotfire.Mod} mod - mod api
 */
Spotfire.initialize(async (mod) => {
    /**
     * Create the read function.
     */
    const reader = mod.createReader(mod.visualization.data(), mod.windowSize(), mod.property("myProperty"));

    /**
     * Store the context.
     */
    const context = mod.getRenderContext();

    /**
     * Initiate the read loop
     */
    reader.subscribe(render);

    /**
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Size} windowSize
     * @param {Spotfire.ModProperty<string>} prop
     */
    async function render(dataView, windowSize, prop) {
        /**
         * Check the data view for errors
         */
        let errors = await dataView.getErrors();
        if (errors.length > 0) {
            // Showing an error overlay will hide the mod iframe.
            // Clear the mod content here to avoid flickering effect of
            // an old configuration when next valid data view is received.
            mod.controls.errorOverlay.show(errors);
            return;
        }
        mod.controls.errorOverlay.hide();

        /**
         * Get rows from dataView
         */
        const rows = await dataView.allRows();
        if (rows == null) {
            // User interaction caused the data view to expire.
            // Don't clear the mod content here to avoid flickering.
            return;
        }

        /**
         * Print out to document
         */
		var tabbarchart = document.querySelector("#tabularbarchart");
		tabbarchart.innerHTML = "";


		/**
		 * Create map of stacked bars
		 */
		var rowsstacked = new Map();
		rows.forEach(function(row){
			var barcategory = row.categorical("X").formattedValue();
			if ( !rowsstacked.has(barcategory) ){
				rowsstacked.set( barcategory, new Set() );
			}
			var barsegments = rowsstacked.get(barcategory);
			barsegments.add(row);
		});

		
		/** 
		 * Calculating total min and max value of stacked bars
		 */
		var maxvalue = Number(0);
		var minvalue = Number(0);
		rowsstacked.forEach(function(rowstacked){
			var maxvaluerowstacked = Number(0);
			var minvaluerowstacked = Number(0);
			rowstacked.forEach(function(row){
				var barvalue = Number(row.continuous("Y").value());
				if ( barvalue > 0 ){
					maxvaluerowstacked += barvalue;
				}
				else {
					minvaluerowstacked += barvalue;
				}
			})
			if ( maxvaluerowstacked > maxvalue ) {
				maxvalue = maxvaluerowstacked;
			}
			if ( minvaluerowstacked < minvalue ){
				minvalue = minvaluerowstacked;
			}
		});

		
		rowsstacked.forEach(function(rowstacked){
			rowstacked.forEach(function(row){
			
			var labeltd = document.createElement("td");
			labeltd.setAttribute("class", "label");
			labeltd.textContent = row.categorical("X").formattedValue();
			
			var valuetd = document.createElement("td");
			valuetd.setAttribute("class","value");
			valuetd.textContent = row.continuous("Y").formattedValue();
			
			var bartd = document.createElement("td");
			bartd.setAttribute("class","bar");
			var barsvg = document.createElementNS("http://www.w3.org/2000/svg","svg");
			barsvg.setAttribute("class","barsvg");
			bartd.appendChild(barsvg);
			
			var barsegmentrect = document.createElementNS("http://www.w3.org/2000/svg","rect");
			var barsegmentvalue = row.continuous("Y").value();
			var barsegmentpercentage = Number(barsegmentvalue) / maxvalue * 100;
			var barsegmentcolor = row.color().hexCode;
			var style = "fill:" + barsegmentcolor + ";";
			barsegmentrect.setAttribute("x", "0");
			barsegmentrect.setAttribute("y", "0");
			barsegmentrect.setAttribute("width", barsegmentpercentage + "%");
			barsegmentrect.setAttribute("height", "1em");
			barsegmentrect.setAttribute("style", style);
			barsvg.appendChild(barsegmentrect);

			var tr = document.createElement("tr");
			tr.appendChild(labeltd);
			tr.appendChild(valuetd);
			tr.appendChild(bartd);
			tabbarchart.appendChild(tr);
			
			});
		});
		
        /**
         * Signal that the mod is ready for export.
         */
        context.signalRenderComplete();
    }
});
