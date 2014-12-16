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


//SET UP THE COLOR SCALES THAT TAKE INPUT VALUE AND OUTPUT A COLOR

//color scale for initial Can_P value
var colorCan = d3.scale.quantize()
                    .range(["#adac8f", "#98a381", "#849974", "#718e67", "#5f845b", "#4e794f", "#3e6e44", "#2g633a", "#205831", "#124d28"])
                    .domain([0, 100]);

//color scale for Build_P value
var colorBuild = d3.scale.quantize()
					.range(["#c4a58e","#c3947d","#c0836e","#bb735f","#b46452","#ab5545","#a1463a","#96392f","#892b25","#7c1f1d"])
					.domain([0, 100]);

//color scale for Imperv_P value
var colorImperv = d3.scale.quantize()
					.range(["#b0aa9e","#9d9f9c","#8b9498","#798993","#677d8d", "#567287","#46687f","#365d77","#26526d","#144763"])
					.domain([0, 100]);


//CALL THE DATA and ADD THE MAP
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



//BEGIN CODE FOR CREATING HISTOGRAM

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
margin = {top: 0, right: 0, bottom: 50, left: 10};

//dimension of the SVG rectangle
width = 960 - margin.left - margin.right;
height = 300 - margin.top - margin.bottom;

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


//FUNCTION TO DRAW THE CHART for Can_P value
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
                        //window.test=value;
                        if (value) {
                                //If value exists…
                                return colorCan(value);
                        } else {
                                //If value is undefined…
                                return "#fff";
                        }
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
                        if (value) {
                                //If value exists…
                                return colorImperv(value);
                        } else {
                                //If value is undefined…
                                return "#fff";
                        }
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
//END CODE FOR UPDATE HISTOGRAM FUNCTION

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
                        if (value) {
                                //If value exists…
                                return colorBuild(value);
                        } else {
                                //If value is undefined…
                                return "#fff";
                        }
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




// ** Update Map data section (Called from the onclick)
function updateDataImperv(lcData) {

		feature = gMap.selectAll("path")
	    	.transition()
	        .duration(2000)
	    	.style("fill", function(lcData) {
	                                //Get data value
	                                var value = lcData.properties.Imperv_P;
	                                //window.test=value;
	                                if (value) {
	                                        //If value exists…
	                                        return colorImperv(value);
	                                } else {
	                                        //If value is undefined…
	                                        return "#fff";
	                                }
	                   });

	    feature.attr('class', function(lcData) {return lcData.properties.Imperv_P;})
	    	.attr('bin', function(lcData) {return colorImperv(lcData.properties.Imperv_P);})
	    	.on('click',function(lcData) {alert(lcData.properties.Imperv_P + "% impervious and " + colorImperv(lcData.properties.Imperv_P))});
	   		
};

function updateDataBuild(lcData) {

		feature = gMap.selectAll("path")
	    	.transition()
	        .duration(2000)
	    	.style("fill", function(lcData) {
	                                //Get data value
	                                var value = lcData.properties.Build_P;
	                                //window.test=value;
	                                if (value) {
	                                        //If value exists…
	                                        return colorBuild(value);
	                                } else {
	                                        //If value is undefined…
	                                        return "#fff";
	                                }
	                   });

	    feature.attr('class', function(lcData) {return lcData.properties.Build_P;})
	    	.attr('bin', function(lcData) {return colorBuild(lcData.properties.Build_P);});
	   		
};

function updateDataCan(lcData) {

		feature = gMap.selectAll("path")
	    	.transition()
	        .duration(2000)
	    	.style("fill", function(lcData) {
	                                //Get data value
	                                var value = lcData.properties.Can_P;
	                                //window.test=value;
	                                if (value) {
	                                        //If value exists…
	                                        return colorCan(value);
	                                } else {
	                                        //If value is undefined…
	                                        return "#fff";
	                                }
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


d3.select("#Can_P.layer")
  .on("click", function (data) {
    //console.log(this);
	d3.json("data/landcoversumm.geojson", function(data) {
		updateDataCan(data);
		});
    d3.json("data/landcoversumm.geojson", function(data) {
		drawChartCan(data);
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



//listeners for the About pop-up window
$('#about').on('click',function(){
	$('#mask').fadeIn(250);
	$('.popup').fadeIn(250);
});

$('.close').on('click',function(){
	$(this).parent().fadeOut(250);
	$('#mask').fadeOut(250);
});

