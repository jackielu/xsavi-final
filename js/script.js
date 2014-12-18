//set up our Leaflet map
var map = L.map('map',{zoomControl:false}).setView([40.7056258,-73.97968], 11)

var CartoDB_DarkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	minZoom: 10,
	maxZoom: 18
}).addTo(map);


//this adds a new zoom control in the specified position.  requires setting zoomControl:false in L.map
L.control.zoom({position: "topright"}).addTo(map);


//Add SVG element for map to Leaflet’s overlay pane. Leaflet automatically repositions the overlay pane when the map pans. SVG dimensions are set dynamically b/c they change on zoom. 
var svgMap = d3.select(map.getPanes().overlayPane)
	.append("svg");

//"g" group element used to translate so that top-left corner of the SVG, ⟨0,0⟩, corresponds to Leaflet’s layer origin. The leaflet-zoom-hide class hides overlay during Leaflet’s zoom animation.
var gMap = svgMap.append("g")
	.attr("class", "leaflet-zoom-hide");


//SET UP THE COLOR SCALES THAT TAKES AN INPUT VALUE AND OUTPUT A COLOR

//color scale for initial Can_P value
var colorCan = d3.scale.quantize()
                    .range(["#adac8f", "#98a381", "#849974", "#718e67", "#5f845b", "#4e794f", "#3e6e44", "#2g633a", "#205831", "#124d28"])
                    .domain([0, 100]);

//color scale for Grass_P value
var colorGrass = d3.scale.quantize()
                    .range(["#e5e09b", "#cfcb8b", "#b9b67b", "#a4a16c", "#8f8d5d", "#7b794f", "#676641", "#545434", "#424227", "#31311c"])
                    .domain([0, 100]);

//color scale for Soil_P value
var colorSoil = d3.scale.quantize()
                    .range(["#6f5544", "#6a503f", "#654b3b", "#604637", "#5b4133", "#553d2f", "#50382b", "#4b3427", "#462f23", "#412b1f"])
                    .domain([0, 100]);

//color scale for Water_P value
var colorWater = d3.scale.quantize()
                    .range(["#e9f9ff", "#cde5f5", "#b1d3e9", "#97c0dc", "#7dadce", "#659bbf", "#4d89ae", "#36779d", "#1f668b", "#025577"])
                    .domain([0, 100]);

//color scale for Build_P value
var colorBuild = d3.scale.quantize()
					.range(["#c4a58e","#c3947d","#c0836e","#bb735f","#b46452","#ab5545","#a1463a","#96392f","#892b25","#7c1f1d"])
					.domain([0, 100]);

//color scale for Road_P value
var colorRoad = d3.scale.quantize()
					.range(["#f6b296","#f19d81","#e9886e","#de745d","#d2604d","#c34e3e","#b33c31","#a22b25","#8f1b1b","#7b0a11"])
					.domain([0, 100]);

//color scale for Imperv_P value
var colorImperv = d3.scale.quantize()
					.range(["#b0aa9e","#9d9f9c","#8b9498","#798993","#677d8d", "#567287","#46687f","#365d77","#26526d","#144763"])
					.domain([0, 100]);

//color scale for Imperv_P value
var colorPaved = d3.scale.quantize()
					.range(["#d9c4c3","#c3adca","#ac97cc","#9483ca","#7c6fc3", "#635db7","#4b4ba8","#333b95","#1c2c7e","#031e65"])
					.domain([0, 100]);


//CALL THE DATA and ADD THE MAP - based on http://bost.ocks.org/mike/leaflet/
//d3.json call starts here
d3.json("data/landcoversumm.geojson", function(lcData) {
	window.test = lcData;
	//console.log(lcData);

	// create a d3.geo.path to convert GeoJSON to SVG:
	var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform);

    // create path elements for each of the features using D3’s data join:
    var feature = gMap.selectAll("path")
    	.data(lcData.features)
    	.enter()
    	.append("path")
    	.attr("d",path)
    	.style("fill", function(d) {
                    //Get data value
                    var value = d.properties.Can_P;
                    //window.test=value;
                    if (value) {
                            //If value exists…
                            return colorCan(value);
                    } else {
                            //If value is undefined…
                            return "#fff";
                    }
                   });

    //assign a class to a D3 feature based on data attributes
	feature.attr('id',function(d) {return d.properties.UniqueID;})
    	.attr('class', function(d) {return d.properties.Can_P;})
    	.attr('bin', function(d) {return colorCan(d.properties.Can_P);});

    map.on("viewreset", reset);
    reset();


  	// Reposition the SVG to cover the features.  Comput the projected bounding box of our features using our custom transform to convert the longitude and latitude to pixels:
	  function reset() {
	    var bounds = path.bounds(lcData),
	        topLeft = bounds[0],
	        bottomRight = bounds[1];
	        //here we are setting width and height of the attribute layer based on the bounds.  

	    //set the dimensions of the SVG with sufficient padding to display features above or to the left of the origin. this is part of "viewreset" event so SVG is repositioned and re-rendered whenever the map zooms
	    svgMap .attr("width", bottomRight[0] - topLeft[0])
	        .attr("height", bottomRight[1] - topLeft[1])
	        .style("left", topLeft[0] + "px")
	        .style("top", topLeft[1] + "px");
	    gMap   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
	    //this is actually where we draw the shape on the map; out of the data that we passed turn this into an SVG attribute
	    feature.attr("d", path);
	  }

	// Use Leaflet to implement a D3 geometric transformation. 
	  function projectPoint(x, y) {
	    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
	    this.stream.point(point.x, point.y);
	  }

	//call the function that creates the histogram and appends it to the #hist div
	  drawChartCan(lcData);
	});  
//END d3json call



//BEGIN CODE FOR CREATING HISTOGRAM - based on http://bl.ocks.org/mbostock/3048450

//CREATE VARIABLES
var hist;
var margin, padding;
var width, height;
var svg, bar;
var makeRoundP, formatCount;
var xScale, xAxis, xAxis2, yScale, yAxis, yAxis2;


//CREATE THE VARIABLES NEEDED TO DRAW THE CHART
//select the div for the histogram and define it as a variable
hist = d3.select("#hist");

//this is where you define the margin of the SVG rectangle that is attached to #hist
margin = {top: -25, right: 0, bottom: 0, left: 10};

//dimension of the SVG rectangle
width = 960 - margin.left - margin.right;
height = 180 - margin.top - margin.bottom;

//create the SVG rectangle
svg = hist.append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//padding value to push the elements in away from the edges of the SVG
padding = 35;

//a function for formatting numbers
makeRoundP = d3.format(".3p") 

//a formatter for counts
formatCount = d3.format(",.0f");


//define the xScale
xScale = d3.scale.linear()
  .domain([0,100])
  .range([padding, width - padding]);

xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom")
  .tickFormat(function(d) { return d + "%"; });

xAxis2 = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - padding) + ")")
    .call(xAxis);

xAxis2.append("text")
  .attr("x", width / 2)
  .attr("y", 30)
  .attr("text-anchor", "middle")
  .attr("class", "xLabel")

yScale = d3.scale.linear()    
  .range([height - padding, padding]);

yAxis = d3.svg.axis()
  .scale(yScale)
  .orient("left")

yAxis2 = svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);


//FUNCTION TO DRAW THE CHART for Can_P value.  This is only for executing the first chart that draws - you need another function to remove existing recs for updating (b/c there is not always the same number of rects)
function drawChartCan(data){

  //grab the values you need and bin them
  histogramData = d3.layout.histogram()
    .bins(xScale.ticks(10))
    (data.features.map(function (d) {
        return d.properties.Can_P}));

  window.histogramData = histogramData;

  yScale.domain([0, d3.max(histogramData, function(d) { return d.y; })])
    .nice();
  yAxis.scale(yScale);
  yAxis2.call(yAxis);


  xAxis2.select(".xLabel")
    .text("Canopy Percentage")

  //bind the data once
  bar = svg.selectAll(".bar")
      .data(histogramData)

  //handle new elements
  bar.enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

  bar.append("rect")
      .attr("x", 0)
      .attr("y", function (d) { (height - padding) - yScale(d.y);})
      .attr("width", xScale(histogramData[0].dx)/2)
      .attr("height", function (d) { return (height - padding) - yScale(d.y); })
      //color the bars using the color function for the layer
      .style("fill", function(d) {
                        //Get data value
                        var value = d.x;
                        return colorCan(value);
           })
      .attr('bin', function (d) {return colorCan(d.x);})
		.on('mouseover', function (d) {
			d3.selectAll("[bin='"+colorCan(d.x)+"']")
			.style("fill","#F1B6DA");
			// console.log(d3.selectAll("[bin='"+colorCan(d.x)+"']"))
		})
     	.on('mouseout', function (d) {
     		d3.selectAll("[bin='"+colorCan(d.x)+"']")
     		.style("fill",colorCan(d.x));
     	})     

    // handle updated elements
  bar.transition()
    .duration(3000)
    .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; })

    // handle removed elements
  bar.exit()
    .remove();
}

//FUNCTION TO DRAW THE CHART for Grass_P value
function drawChartGrass(data){

  //grab the values you need and bin them
  histogramData = d3.layout.histogram()
    .bins(xScale.ticks(10))
    (data.features.map(function (d) {
        return d.properties.Grass_P}));

  window.histogramData = histogramData;

  yScale.domain([0, d3.max(histogramData, function(d) { return d.y; })])
    .nice();
  yAxis.scale(yScale);
  yAxis2.call(yAxis);


  xAxis2.select(".xLabel")
    .text("Grass Cover Percentage")

  bar.remove();

  //bind the data once
  bar = svg.selectAll(".bar")
      .data(histogramData)

  //handle new elements
  bar.enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

  bar.append("rect")
      .attr("x", 0)
      .attr("y", function (d) { (height - padding) - yScale(d.y);})
      .attr("width", xScale(histogramData[0].dx)/2)
      .attr("height", function (d) { return (height - padding) - yScale(d.y); })
      //color the bars using the color function for the layer
      .style("fill", function(d) {
                        //Get data value
                        var value = d.x;
                        //window.test=value;
                        return colorGrass(value);
           })
      .attr('bin', function (d) {return colorGrass(d.x);})
		.on('mouseover', function (d) {
			d3.selectAll("[bin='"+colorGrass(d.x)+"']")
			.style("fill","#F1B6DA");
			// console.log(d3.selectAll("[bin='"+colorCan(d.x)+"']"))
		})
     	.on('mouseout', function (d) {
     		d3.selectAll("[bin='"+colorGrass(d.x)+"']")
     		.style("fill",colorGrass(d.x));
     	})     

    // handle updated elements
  bar.transition()
    .duration(3000)
    .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; })

    // handle removed elements
  bar.exit()
    .remove();
}


//FUNCTION TO DRAW THE CHART for Grass_P value
function drawChartSoil(data){

  //grab the values you need and bin them
  histogramData = d3.layout.histogram()
    .bins(xScale.ticks(10))
    (data.features.map(function (d) {
        return d.properties.Soil_P}));

  window.histogramData = histogramData;

  yScale.domain([0, d3.max(histogramData, function(d) { return d.y; })])
    .nice();
  yAxis.scale(yScale);
  yAxis2.call(yAxis);

  xAxis2.select(".xLabel")
    .text("Soil Cover Percentage")

  bar.remove();

  //bind the data once
  bar = svg.selectAll(".bar")
      .data(histogramData)

  //handle new elements
  bar.enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

  bar.append("rect")
      .attr("x", 0)
      .attr("y", function (d) { (height - padding) - yScale(d.y);})
      .attr("width", xScale(histogramData[0].dx)/2)
      .attr("height", function (d) { return (height - padding) - yScale(d.y); })
      //color the bars using the color function for the layer
      .style("fill", function(d) {
                        //Get data value
                        var value = d.x;
                        //window.test=value;
                        return colorSoil(value);
           })
      .attr('bin', function (d) {return colorSoil(d.x);})
		.on('mouseover', function (d) {
			d3.selectAll("[bin='"+colorSoil(d.x)+"']")
			.style("fill","#F1B6DA");
		})
     	.on('mouseout', function (d) {
     		d3.selectAll("[bin='"+colorSoil(d.x)+"']")
     		.style("fill",colorSoil(d.x));
     	})     

    // handle updated elements
  bar.transition()
    .duration(3000)
    .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; })

    // handle removed elements
  bar.exit()
    .remove();
}

//FUNCTION TO DRAW THE CHART for Water_P value
function drawChartWater(data){

  //grab the values you need and bin them
  histogramData = d3.layout.histogram()
    .bins(xScale.ticks(10))
    (data.features.map(function (d) {
        return d.properties.Water_P}));

  window.histogramData = histogramData;

  yScale.domain([0, d3.max(histogramData, function(d) { return d.y; })])
    .nice();
  yAxis.scale(yScale);
  yAxis2.call(yAxis);


  xAxis2.select(".xLabel")
    .text("Water Percentage")

  bar.remove();

  //bind the data once
  bar = svg.selectAll(".bar")
      .data(histogramData)

  //handle new elements
  bar.enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

  bar.append("rect")
      .attr("x", 0)
      .attr("y", function (d) { (height - padding) - yScale(d.y);})
      .attr("width", xScale(histogramData[0].dx)/2)
      .attr("height", function (d) { return (height - padding) - yScale(d.y); })
      //color the bars using the color function for the layer
      .style("fill", function(d) {
                        //Get data value
                        var value = d.x;
                        //window.test=value;
                        return colorWater(value);
           })
      .attr('bin', function (d) {return colorWater(d.x);})
		.on('mouseover', function (d) {
			d3.selectAll("[bin='"+colorWater(d.x)+"']")
			.style("fill","#F1B6DA");
		})
     	.on('mouseout', function (d) {
     		d3.selectAll("[bin='"+colorWater(d.x)+"']")
     		.style("fill",colorWater(d.x));
     	})     

    // handle updated elements
  bar.transition()
    .duration(3000)
    .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; })

    // handle removed elements
  bar.exit()
    .remove();
}

//FUNCTION TO UPDATE THE CHART ON CLICK for Imperv_P value
function drawChartImperv(data) {

  //grab the values you need and bin them
  histogramData = d3.layout.histogram()
    .bins(xScale.ticks(10))
    (data.features.map(function (d) {
        return d.properties.Imperv_P}));

  window.histogramData = histogramData;

  yScale.domain([0, d3.max(histogramData, function(d) { return d.y; })])
    .nice();
  yAxis.scale(yScale);
  yAxis2.call(yAxis);

  xAxis2.select(".xLabel")
    .text("Impervious Percentage")

  bar.remove();

  //bind the data once
  bar = svg.selectAll(".bar")
      .data(histogramData)

  //handle new elements
  bar.enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

  bar
    .append("rect")
      .attr("x", 0)
      .attr("y", function (d) { (height - padding) - yScale(d.y);})
      .attr("width", xScale(histogramData[0].dx)/2)
      .attr("height", function (d) { return (height - padding) - yScale(d.y); })
      //color the bars using the color function for the layer
      .style("fill", function(d) {
                        //Get data value
                        var value = d.x;
                        //window.test=value;
						return colorImperv(value);
           })
      .attr('bin', function (d) {return colorImperv(d.x);})     
    	.on('mouseover', function (d) {
			d3.selectAll("[bin='"+colorImperv(d.x)+"']")
			.style("fill","#F1B6DA");
			// console.log(d3.selectAll("[bin='"+colorCan(d.x)+"']"))
		})
     	.on('mouseout', function (d) {
     		d3.selectAll("[bin='"+colorImperv(d.x)+"']")
     		.style("fill",colorImperv(d.x));
     	}) 

    // handle updated elements
  bar.transition()
    .duration(3000)
    .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

    // handle removed elements
  bar.exit()
    .remove();
}

//FUNCTION TO UPDATE THE CHART ON CLICK for Road_P value
function drawChartRoad(data) {

  //grab the values you need and bin them
  histogramData = d3.layout.histogram()
    .bins(xScale.ticks(10))
    (data.features.map(function (d) {
        return d.properties.Road_P}));

  window.histogramData = histogramData;

  yScale.domain([0, d3.max(histogramData, function(d) { return d.y; })])
    .nice();
  yAxis.scale(yScale);
  yAxis2.call(yAxis);

  xAxis2.select(".xLabel")
    .text("Road Cover Percentage")

  bar.remove();

  //bind the data once
  bar = svg.selectAll(".bar")
      .data(histogramData)

  //handle new elements
  bar.enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

  bar
    .append("rect")
      .attr("x", 0)
      .attr("y", function (d) { (height - padding) - yScale(d.y);})
      .attr("width", xScale(histogramData[0].dx)/2)
      .attr("height", function (d) { return (height - padding) - yScale(d.y); })
      //color the bars using the color function for the layer
      .style("fill", function(d) {
                        //Get data value
                        var value = d.x;
                        //window.test=value;
						return colorRoad(value);
           })
      .attr('bin', function (d) {return colorRoad(d.x);})     
    	.on('mouseover', function (d) {
			d3.selectAll("[bin='"+colorRoad(d.x)+"']")
			.style("fill","#F1B6DA");
			// console.log(d3.selectAll("[bin='"+colorCan(d.x)+"']"))
		})
     	.on('mouseout', function (d) {
     		d3.selectAll("[bin='"+colorRoad(d.x)+"']")
     		.style("fill",colorRoad(d.x));
     	}) 

    // handle updated elements
  bar.transition()
    .duration(3000)
    .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

    // handle removed elements
  bar.exit()
    .remove();
}

//FUNCTION TO UPDATE THE CHART ON CLICK for Build_P value
function drawChartPaved(data) {

  //grab the values you need and bin them
  histogramData = d3.layout.histogram()
    .bins(xScale.ticks(10))
    (data.features.map(function (d) {
        return d.properties.Paved_P}));

  window.histogramData = histogramData;

  yScale.domain([0, d3.max(histogramData, function(d) { return d.y; })])
    .nice();
  yAxis.scale(yScale);
  yAxis2.call(yAxis);

  xAxis2.select(".xLabel")
    .text("Misc. Paved Percentage Cover")

  bar.remove();

  //bind the data once
  bar = svg.selectAll(".bar")
      .data(histogramData)

  //handle new elements
  bar.enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

  bar
    .append("rect")
      .attr("x", 0)
      .attr("y", function (d) { (height - padding) - yScale(d.y);})
      .attr("width", xScale(histogramData[0].dx)/2)
      .attr("height", function (d) { return (height - padding) - yScale(d.y); })
      //color the bars using the color function for the layer
      .style("fill", function(d) {
                        //Get data value
                        var value = d.x;
                        //window.test=value;
                        return colorPaved(value);
           })
      .attr('bin', function (d) {return colorPaved(d.x);})     
    	.on('mouseover', function (d) {
			d3.selectAll("[bin='"+colorPaved(d.x)+"']")
			.style("fill","#F1B6DA");
		})
     	.on('mouseout', function (d) {
     		d3.selectAll("[bin='"+colorPaved(d.x)+"']")
     		.style("fill",colorPaved(d.x));
     	}) 

    // handle updated elements
  bar.transition()
    .duration(3000)
    .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

    // handle removed elements
  bar.exit()
    .remove();
}

//FUNCTION TO UPDATE THE CHART ON CLICK for Build_P value
function drawChartBuild(data) {

  //grab the values you need and bin them
  histogramData = d3.layout.histogram()
    .bins(xScale.ticks(10))
    (data.features.map(function (d) {
        return d.properties.Build_P}));

  window.histogramData = histogramData;

  yScale.domain([0, d3.max(histogramData, function(d) { return d.y; })])
    .nice();
  yAxis.scale(yScale);
  yAxis2.call(yAxis);

  xAxis2.select(".xLabel")
    .text("Building Percentage Cover")

  bar.remove();

  //bind the data once
  bar = svg.selectAll(".bar")
      .data(histogramData)

  //handle new elements
  bar.enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

  bar
    .append("rect")
      .attr("x", 0)
      .attr("y", function (d) { (height - padding) - yScale(d.y);})
      .attr("width", xScale(histogramData[0].dx)/2)
      .attr("height", function (d) { return (height - padding) - yScale(d.y); })
      //color the bars using the color function for the layer
      .style("fill", function(d) {
                        //Get data value
                        var value = d.x;
                        //window.test=value;
                        return colorBuild(value);
           })
      .attr('bin', function (d) {return colorBuild(d.x);})     
    	.on('mouseover', function (d) {
			d3.selectAll("[bin='"+colorBuild(d.x)+"']")
			.style("fill","#F1B6DA");
		})
     	.on('mouseout', function (d) {
     		d3.selectAll("[bin='"+colorBuild(d.x)+"']")
     		.style("fill",colorBuild(d.x));
     	}) 

    // handle updated elements
  bar.transition()
    .duration(3000)
    .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

    // handle removed elements
  bar.exit()
    .remove();
}
//END CODE FOR UPDATE HISTOGRAM FUNCTION

//FUNCTION TO UPDATE THE CHART ON CLICK for Can_P value
function drawChartCan_PUpdate(data) {

  //grab the values you need and bin them
  histogramData = d3.layout.histogram()
    .bins(xScale.ticks(10))
    (data.features.map(function (d) {
        return d.properties.Can_P}));

  window.histogramData = histogramData;

  yScale.domain([0, d3.max(histogramData, function(d) { return d.y; })])
    .nice();
  yAxis.scale(yScale);
  yAxis2.call(yAxis);

  xAxis2.select(".xLabel")
    .text("Canopy Percentage")

  bar.remove();

  //bind the data once
  bar = svg.selectAll(".bar")
      .data(histogramData)

  //handle new elements
  bar.enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

  bar
    .append("rect")
      .attr("x", 0)
      .attr("y", function (d) { (height - padding) - yScale(d.y);})
      .attr("width", xScale(histogramData[0].dx)/2)
      .attr("height", function (d) { return (height - padding) - yScale(d.y); })
      //color the bars using the color function for the layer
      .style("fill", function(d) {
                        //Get data value
                        var value = d.x;
                        //window.test=value;
                        return colorBuild(value);
           })
      .attr('bin', function (d) {return colorCan_P(d.x);})     
      .on('mouseover', function (d) {
      d3.selectAll("[bin='"+colorCan_P(d.x)+"']")
      .style("fill","#F1B6DA");
    })
      .on('mouseout', function (d) {
        d3.selectAll("[bin='"+colorCan_P(d.x)+"']")
        .style("fill",colorCan_P(d.x));
      }) 

    // handle updated elements
  bar.transition()
    .duration(3000)
    .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

    // handle removed elements
  bar.exit()
    .remove();
}



// ** Update Map data section (Called from the onclick)
function updateDataGrass(lcData) {

		feature = gMap.selectAll("path")
	    	.transition()
	        .duration(2000)
	    	.style("fill", function(lcData) {
	                                //Get data value
	                                var value = lcData.properties.Grass_P;
	                                //window.test=value;
	                                return colorGrass(value);
	                   });

	    feature.attr('class', function(lcData) {return lcData.properties.Grass_P;})
	    	.attr('bin', function(lcData) {return colorGrass(lcData.properties.Grass_P);});
	   		
};

function updateDataSoil(lcData) {

		feature = gMap.selectAll("path")
	    	.transition()
	        .duration(2000)
	    	.style("fill", function(lcData) {
	                                //Get data value
	                                var value = lcData.properties.Soil_P;
	                                //window.test=value;
	                                return colorSoil(value);
	                   });

	    feature.attr('class', function(lcData) {return lcData.properties.Soil_P;})
	    	.attr('bin', function(lcData) {return colorSoil(lcData.properties.Soil_P);});
	   		
};

function updateDataWater(lcData) {

		feature = gMap.selectAll("path")
	    	.transition()
	        .duration(2000)
	    	.style("fill", function(lcData) {
	                                //Get data value
	                                var value = lcData.properties.Water_P;
	                                //window.test=value;
	                                return colorWater(value);
	                   });

	    feature.attr('class', function(lcData) {return lcData.properties.Water_P;})
	    	.attr('bin', function(lcData) {return colorWater(lcData.properties.Water_P);});
	   		
};

function updateDataImperv(lcData) {

		feature = gMap.selectAll("path")
	    	.transition()
	        .duration(2000)
	    	.style("fill", function(lcData) {
	                                //Get data value
	                                var value = lcData.properties.Imperv_P;
	                                //window.test=value;
	                                return colorImperv(value);
	                   });

	    feature.attr('class', function(lcData) {return lcData.properties.Imperv_P;})
	    	.attr('bin', function(lcData) {return colorImperv(lcData.properties.Imperv_P);})
};

function updateDataRoad(lcData) {

		feature = gMap.selectAll("path")
	    	.transition()
	        .duration(2000)
	    	.style("fill", function(lcData) {
	                                //Get data value
	                                var value = lcData.properties.Road_P;
	                                //window.test=value;
	                                return colorRoad(value);
	                   });

	    feature.attr('class', function(lcData) {return lcData.properties.Road_P;})
	    	.attr('bin', function(lcData) {return colorRoad(lcData.properties.Road_P);})
};


function updateDataBuild(lcData) {

		feature = gMap.selectAll("path")
	    	.transition()
	        .duration(2000)
	    	.style("fill", function(lcData) {
	                                //Get data value
	                                var value = lcData.properties.Build_P;
	                                //window.test=value;
	                                return colorBuild(value);
	                   });

	    feature.attr('class', function(lcData) {return lcData.properties.Build_P;})
	    	.attr('bin', function(lcData) {return colorBuild(lcData.properties.Build_P);});
	   		
};

function updateDataPaved(lcData) {

		feature = gMap.selectAll("path")
	    	.transition()
	        .duration(2000)
	    	.style("fill", function(lcData) {
	                                //Get data value
	                                var value = lcData.properties.Paved_P;
	                                //window.test=value;
	                                return colorPaved(value);
	                   });

	    feature.attr('class', function(lcData) {return lcData.properties.Paved_P;})
	    	.attr('bin', function(lcData) {return colorBuild(lcData.properties.Paved_P);});
	   		
};

function updateDataCan(lcData) {

		feature = gMap.selectAll("path")
	    	.transition()
	        .duration(2000)
	    	.style("fill", function(lcData) {
	                                //Get data value
	                                var value = lcData.properties.Can_P;
	                                //window.test=value;
	                                return colorCan(value);
	                   });

	    feature.attr('class', function(lcData) {return lcData.properties.Can_P;})
	    	.attr('bin', function(lcData) {return colorCan(lcData.properties.Can_P);});
	   		
};


d3.select("li#Imperv_P.layer")
	.on("click", function (data){ 
		//console.log(this);
    d3.json("data/landcoversumm.geojson", function(data) {
		updateDataImperv(data);
		});
    d3.json("data/landcoversumm.geojson", function(data) {
		drawChartImperv(data);
		});
    });

d3.select("#Build_P.layer")
	.on("click", function (data){ 
		//console.log(this);
	    d3.json("data/landcoversumm.geojson", function(data) {
			updateDataBuild(data);
			});
		d3.json("data/landcoversumm.geojson", function(data) {
			drawChartBuild(data);
			});
    });

d3.select("#Road_P.layer")
	.on("click", function (data){ 
		//console.log(this);
	    d3.json("data/landcoversumm.geojson", function(data) {
			updateDataRoad(data);
			});
		d3.json("data/landcoversumm.geojson", function(data) {
			drawChartRoad(data);
			});
    });


d3.select("#Can_P.layer")
  .on("click", function (data) {
    //console.log(this);
	d3.json("data/landcoversumm.geojson", function(data) {
		updateDataCan(data);
		});
    d3.json("data/landcoversumm.geojson", function(data) {
		drawChartCan_PUpdate(data);
		});
	});

d3.select("#Grass_P.layer")
  .on("click", function (data) {
    //console.log(this);
	d3.json("data/landcoversumm.geojson", function(data) {
		updateDataGrass(data);
		});
    d3.json("data/landcoversumm.geojson", function(data) {
		drawChartGrass(data);
		});
	});

d3.select("#Soil_P.layer")
	.on("click", function (data){ 
		//console.log(this);
	    d3.json("data/landcoversumm.geojson", function(data) {
			updateDataSoil(data);
			});
		d3.json("data/landcoversumm.geojson", function(data) {
			drawChartSoil(data);
			});
    });


d3.select("#Water_P.layer")
	.on("click", function (data){ 
		//console.log(this);
	    d3.json("data/landcoversumm.geojson", function(data) {
			updateDataWater(data);
			});
		d3.json("data/landcoversumm.geojson", function(data) {
			drawChartWater(data);
			});
    });

d3.select("#Paved_P.layer")
  .on("click", function (data) {
    //console.log(this);
	d3.json("data/landcoversumm.geojson", function(data) {
		updateDataPaved(data);
		});
    d3.json("data/landcoversumm.geojson", function(data) {
		drawChartPaved(data);
		});
	});




//listeners for layer button hovers
$('.layer').hover(function(){
		// console.log(this);
		$(this).toggleClass('hover');
	}, function(){
	$(this).toggleClass('hover');
});



//listeners for the About pop-up window - code based on Chris Whong's class example
$('#about').on('click',function(){
	$('#mask').fadeIn(250);
	$('.popup').fadeIn(250);
});

$('.close').on('click',function(){
	$(this).parent().fadeOut(250);
	$('#mask').fadeOut(250);
});

