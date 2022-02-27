/**
 * Get access to the Spotfire Mod API by providing a callback to the initialize method.
 * @param {Spotfire.Mod} mod - mod api
 */
Spotfire.initialize(async (mod) => {
    /**
     * Create the read function.
     */
    const reader = mod.createReader(
		mod.visualization.data(), mod.windowSize(), 
		mod.property("showPercentage"), mod.property("showValue")
	);

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
    async function render(dataView, windowSize, showPercentage, showValue) {

        // Check the data view for errors
        let errors = await dataView.getErrors();
        if (errors.length > 0) {
            // Showing an error overlay will hide the mod iframe.
            // Clear the mod content here to avoid flickering effect of
            // an old configuration when next valid data view is received.
            mod.controls.errorOverlay.show(errors);
            return;
        }
        mod.controls.errorOverlay.hide();


        // Get rows from dataView
        const rows = await dataView.allRows();
        if (rows == null) {
            // User interaction caused the data view to expire.
            // Don't clear the mod content here to avoid flickering.
            return;
        }


		// Get colors from theme
		var fontColor = mod.getRenderContext().styling.general.font.color;
		var backgroundColor = mod.getRenderContext().styling.general.backgroundColor;


        // Remove previous content
		var tabbarchart = document.querySelector("#tabularbarchart");
		tabbarchart.innerHTML = "";


		// Create map of stacked bars as internal data structure for rendering
		var rowsstacked = new Map();
		rows.forEach(function(row){
			var barcategory = row.categorical("Category").formattedValue();
			if ( !rowsstacked.has(barcategory) ){
				rowsstacked.set( barcategory, new Set() );
			}
			var barsegments = rowsstacked.get(barcategory);
			barsegments.add(row);
		});
		
		
		// Calculating total and total min max value of stacked bars
		var total = Number(0);
		var maxvalue = Number(0);
		var minvalue = Number(0);
		rowsstacked.forEach(function(rowstacked){
			var maxvaluerowstacked = Number(0);
			var minvaluerowstacked = Number(0);
			rowstacked.forEach(function(row){
				var barvalue = Number(row.continuous("Value").value());
				total += barvalue;
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
		var minmaxvalue = maxvalue - minvalue;
		var nullpointx = Math.abs(minvalue) / minmaxvalue * 100;
		
		
		// Render header with axis in case of negative values
		if ( minvalue < 0 ){
			var theadbarchart = document.createElement("thead");
			tabbarchart.appendChild(theadbarchart);
			var tr = document.createElement("tr");
			theadbarchart.appendChild(tr);
			
			tr.appendChild(createElementWithClass("td","label"));
			tr.appendChild(createElementWithClass("td","value"));
			tr.appendChild(createElementWithClass("td","percentage"));

			var td = createElementWithClass("td","bar");
			tr.appendChild(td);
			var svg = createElementSvgWithClass("svg","headersvg");
			td.appendChild(svg);
			var axis = createAxisSvg(nullpointx, fontColor);
			svg.appendChild(axis);
		}


		// Render rows
		var tbodybarchart = document.createElement("tbody");
		tabbarchart.appendChild(tbodybarchart);

		rowsstacked.forEach(function(rowstacked, key){
			var tr = document.createElement("tr");
			tbodybarchart.appendChild(tr);
			
			// Render label
			var labeltd = createElementWithClass("td","label");
			labeltd.textContent = key;
			
			// Render stacked bar
			var bartd = createElementWithClass("td","bar");
			var barsvg = createElementSvgWithClass("svg","barsvg");
			bartd.appendChild(barsvg);
			
			var maxvaluerowstacked = Number(0);
			var minvaluerowstacked = Number(0);

			rowstacked.forEach(function(row){
				var barsegmentrect = document.createElementNS("http://www.w3.org/2000/svg","rect");
				var barsegmentvalue = Number(row.continuous("Value").value());
				if ( barsegmentvalue > 0){
					var barsegmentx = (maxvaluerowstacked - minvalue) / minmaxvalue * 100;
				}
				else{
					var barsegmentx = (Math.abs(minvalue) + minvaluerowstacked + barsegmentvalue) / minmaxvalue * 100;
				}
				var barsegmentwidth = Math.abs(barsegmentvalue) / minmaxvalue * 100;
				barsegmentrect.setAttribute("x", barsegmentx + "%");
				barsegmentrect.setAttribute("y", "10%");
				barsegmentrect.setAttribute("width", barsegmentwidth + "%");
				barsegmentrect.setAttribute("height", "80%");
				barsegmentrect.setAttribute("style", "fill:" + row.color().hexCode + ";");
				barsegmentrect.setAttribute("row", row.elementId() );
				barsvg.appendChild(barsegmentrect);

				if ( barsegmentvalue > 0 ){
					maxvaluerowstacked += barsegmentvalue;
				}
				else {
					minvaluerowstacked += barsegmentvalue;
				}
			});

			// Render axis in case of negative values
			if ( minvalue < 0 ){
				var axis = createAxisSvg(nullpointx, fontColor);
				barsvg.appendChild(axis);
			}
			
			// Render numerical value of row
			var valuetd = createElementWithClass("td","value");
			valuetd.textContent = maxvaluerowstacked + minvaluerowstacked;
						
			// Render percentage value of row
			var percentagetd = createElementWithClass("td","percentage");
			percentagetd.textContent = Number((maxvaluerowstacked + minvaluerowstacked) / total * 100).toFixed(0) + " %";
			
			// Append table row with label, value and bar
			tr.appendChild(labeltd);
			tr.appendChild(valuetd);
			tr.appendChild(percentagetd);
			tr.appendChild(bartd);
		});


		// Render footer with axis in case of negative values
		if ( minvalue < 0 ){
			var tfootbarchart = document.createElement("tfoot");
			tabbarchart.appendChild(tfootbarchart);
			var tr = document.createElement("tr");
			tfootbarchart.appendChild(tr);
			
			tr.appendChild(createElementWithClass("td","label"));
			tr.appendChild(createElementWithClass("td","value"));
			tr.appendChild(createElementWithClass("td","percentage"));

			var td = createElementWithClass("td","bar");
			tr.appendChild(td);
			var svg = createElementSvgWithClass("svg","headersvg");
			td.appendChild(svg);
			var axis = createAxisSvg(nullpointx, fontColor);
			svg.appendChild(axis);
		}


		// Show label and percentage as defined per property
		if ( showValue = false ){
			var allvaluetds = document.querySelectorAll(".value");
			allvaluetds.forEach( function( valuetd ){
				valuetd.setAttribute("style", "display: none;"); 
			});
		}
		if ( showPercentage = false ){
			var allvaluetds = document.querySelectorAll(".percentage");
			allvaluetds.forEach( function( valuetd ){
				valuetd.setAttribute("style", "display: none;"); 
			});
		}
		

		// Marking
		var allbarrects = document.querySelectorAll(".barsvg rect");
		allbarrects.forEach( function(onebarrect){
			onebarrect.onclick = function ( event ){

				var elementId = event.target.getAttribute("row");
				var row = rows.find( obj => { return obj.elementId() === elementId });

				if (event.shiftKey) {
					dataView.mark(new Array(row),"Add");
				}
				else {
					dataView.mark(new Array(row),"Replace");
				}
				event.stopPropagation();
			};
		});


		// Clear marking
		var allbarsvgs = document.querySelectorAll(".barsvg");
		allbarsvgs.forEach( function(onebarsvg){
			onebarsvg.onclick = function ( event ) {
				if (!event.shiftKey) dataView.clearMarking();
			};		
		});

				
        // Signal that the mod is ready for export.
        context.signalRenderComplete();
    }
});
	
	
function createAxisSvg(nullpointx, fontColor){
	var axis = document.createElementNS("http://www.w3.org/2000/svg","line");
	axis.setAttribute("x1", nullpointx + "%");
	axis.setAttribute("y1", 0);
	axis.setAttribute("x2", nullpointx + "%");
	axis.setAttribute("y2", "100%");
	axis.setAttribute("style", "stroke:" + fontColor + "; stroke-width:1;");
	return axis;
};


function createElementWithClass(tag, cssclass){
	var element = document.createElement(tag);
	element.setAttribute("class",cssclass);
	return element;	
};


function createElementSvgWithClass(tag, cssclass){
	var element = document.createElementNS("http://www.w3.org/2000/svg",tag);
	element.setAttribute("class",cssclass);
	return element;	
};