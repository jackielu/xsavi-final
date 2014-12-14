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

//set up color scale that takes data values as input and outputs colors

//color scale for initial Can_P value
var colorCan = d3.scale.quantize()
                    .range(["#d9d9d9", "#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"])
                    .domain([0, 100]);

//color scale for Build_P value
var colorBuild = d3.scale.quantize()
					.range(["#31130F","#471D1C","#5E292B","#76343C","#8D414F","#A44E65","#BA5D7D","#CF6D97","#E27FB3","#F392D0"])
					.domain([0, 100]);

//color scale for Imperv_P value
var colorImperv = d3.scale.quantize()
					.range(["#05201F","#0A3130","#104342","#175555","#1F696A", "#277C7F","#309195","#39A6AC","#43BBC3","#4DD1DC"])
					.domain([0, 100]);


//code to add D3 polygon data to the map is based on http://bost.ocks.org/mike/leaflet/

//d3.json call starts here
d3.json("data/landcoversumm.geojson", function(lcData) {
	//window.test = lcData;
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
    	.attr('bin', function(d) {return colorCan(d.properties.Can_P);})
    	.on('click',function(d) {alert(d.properties.Can_P + "% canopy and" + colorCan(d.properties.Can_P))});
      	//.on('click',function(d) {alert(d.properties.UniqueID)});

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
	  drawChart(lcData);
	});  
//END d3json call

// ** Update data section (Called from the onclick)
function updateDataImperv(lcData) {
    // Get the data again
	d3.json("data/landcoversumm.geojson", function(lcData) {
	    // create path elements for each of the features using D3’s data join:
	    var feature2 = gMap.selectAll("path")
	    	.transition()
	        .duration(2000)
	    	.style("fill", function(d) {
	                                //Get data value
	                                var value = d.properties.Imperv_P;
	                                //window.test=value;
	                                if (value) {
	                                        //If value exists…
	                                        return colorImperv(value);
	                                } else {
	                                        //If value is undefined…
	                                        return "#fff";
	                                }
	                   });

	   	feature2.attr('class', function(d) {return d.properties.Imperv_P;})
	    	.attr('bin', function(d) {return colorImperv(d.properties.Imperv_P);})
	    	.on('click',function(d) {alert(d.properties.Imperv_P + "% impervious and " + colorImperv(d.properties.Imperv_P))});

		//call the function that creates the histogram and appends it to the #hist div
		drawChartImperv(lcData);
	});
}


d3.select("li#Imperv_P.layer")
	.on("click", function (d){ 
		console.log(this);
    	updateDataImperv(d);
    });

//this adds HARD CODED interactivity - click on #imp_p.layer button and the polygon update
// d3.select("li#Imperv_P.layer")
// 	.on("click", function(d){ 
// 		console.log(this);
//     	d3.selectAll("path")
// 	        .transition()
// 	        .duration(2000)
// 	    	.style("fill", function(d) {
// 	    		value = d.properties.Imperv_P;
//                 return colorImperv(value);
// 			});
//     });

d3.select("li#Build_P.layer")
	.on("click", function(d){ 
		console.log(this);
    	d3.selectAll("path")
	        .transition()
	        .duration(2000)
	    	.style("fill", function(d) {
	    		value = d.properties.Build_P;
                return colorBuild(value);
			});
    });

d3.select("li#Can_P.layer")
	.on("click", function(d){ 
		console.log(this);
    	d3.selectAll("path")
	        .transition()
	        .duration(2000)
	    	.style("fill", function(d) {
	    		value = d.properties.Can_P;
                return colorCan(value);
			});
    });

// TEST variable based interactivity W/ SINGLE FILL COLOR listeners for place button clicks
// $('.layer').on("click",function (d){
// 	console.log(this.id);  //what is the ID of what you clicked on?
// 	var value = "d.properties." + this.id;
// 	console.log(value);
// 	d3.selectAll("path")
// 	    .transition()
// 	    .duration(2000)
// 		.style("fill", "#C52034");
// });


// // TEST variable based interactivity W/ SINGLE FILL COLOR listeners for place button clicks
// $('.layer').on("click",function (d){
// 	console.log(this.id);  //what is the ID of what you clicked on?
// 	d3.selectAll("path")
// 	    .transition()
// 	    .duration(2000)
// 		.style("fill", function () {
// 			if (this.id == "Build_P") {return "#C52034";} 
// 			else {return "#1656A0";}
// 		});
// });

// TEST variable based interactivity W/ SINGLE FILL COLOR listeners for place button clicks
// $('.layer').on("click",function (d){
// 	console.log(this.id);  //what is the ID of what you clicked on?
// 	d3.selectAll("path")
// 	    .transition()
// 	    .duration(2000)
// 		.style("fill", function () {
// 			if (this.id == "Build_P") {return "#C52034";}
// 			else if (this.id == "Imperv_P") {return "#1656A0";}
// 			else {return "#fff"}
// 		});
// });


// attempt to create listeners for place button clicks that uses a function to update map polys 
// $('.layer').on("click",function (d){
// 	console.log(this.id);  //what is the ID of what you clicked on?
// 	var value = "d.properties." + this.id;
// 	console.log(value);
// 	d3.selectAll("path")
// 	    .transition()
// 	    .duration(2000)
// 		.style("fill", function (){
// 			return colorImp(value);
// 			} 
// 		);
// });


//BEGIN CODE FOR CREATING HISTOGRAM

//select the hist div and define it as a variable
var hist = d3.select("#hist");
//define the margin of the SVG rectangle
var marginH = {top: -20, right: 0, bottom: 0, left: 0};
//dimension of the SVG rectangle
var widthH = 940 - marginH.left - marginH.right,
    heightH = 180 - marginH.top - marginH.bottom;

//create the SVG rectangle
var svgH = hist.append("svg")
    .attr("width", widthH)
    .attr("height", heightH)
  .append("g")
    .attr("transform", "translate(" + marginH.left + "," + marginH.top + ")");


//padding value to push the elements in away from the edges of the SVG
var padding = 40

//define the xScale
var xScale = d3.scale.linear()
	.domain([0,100])
	.range([padding, widthH - padding]);

var array = [];
//function to create arrays from "columns" of attribute data to bin in the histogram
function getArray(data) {
	for (var i=0; i< data.features.length; i++) {
	array.push(data.features[i].properties.Can_P);
	array;
	}
}

var arrayImperv = [];
function getArrayImperv(data) {
	for (var i=0; i< data.features.length; i++) {
	arrayImperv.push(data.features[i].properties.Imperv_P);
	arrayImperv;
	}
}


//function that is passed the data to create the histogram
function drawChart(data){
	//window.test2 = data;
  var makeRoundP = d3.format(".3p") //a function for formatting numbers

  //a formatter for counts
  var formatCount = d3.format(",.0f");

  getArray(data);

  //grab the values you need and bin them
  var histBinnedData = d3.layout.histogram()
  	.bins(xScale.ticks(10))
  	(array);

  // window.test3 = histBinnedData;

  var yScale = d3.scale.linear()    
  	.domain([0, d3.max(histBinnedData, function(d) { return d.y; })])
  	.range([heightH - padding, padding])
  	.nice();

  var xAxis = d3.svg.axis()
    .scale(xScale)
	.orient("bottom")
	.tickFormat(function(d) { return d + "%"; });

  var yAxis = d3.svg.axis()
  	.scale(yScale)
  	.orient("left")

	var bar = svgH.selectAll(".bar")
	    .data(histBinnedData)
	    .enter().append("g")
	    .attr("class", "bar")
	    .attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

	bar.append("rect")
	    .attr("x", 0)
	    .attr("y", function (d) { (heightH - padding) - yScale(d.y);})
	    .attr("width", xScale(histBinnedData[0].dx)/2)
	    .attr("height", function(d) { return (heightH - padding) - yScale(d.y); })
    	//color the bars the same way you do the polygons in the choropleth by using the color function on the value
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
    	// .on('click',function(d) {return alert(colorCan(d.x))})
    	.on('mouseover', function (d) {
    		d3.selectAll("[bin='"+colorCan(d.x)+"']")
    		.style("fill","#F1B6DA");
    		// console.log(d3.selectAll("[bin='"+colorCan(d.x)+"']"))
    	})
    	.on('mouseout', function (d) {
    		d3.selectAll("[bin='"+colorCan(d.x)+"']")
    		.style("fill",colorCan(d.x));
    	})
    	// .on('click',function(d) {alert(d.bin)})

	bar.append("text")
	    .attr("dy", ".75em")
	    .attr("y", -10)
	    .attr("x", xScale(histBinnedData[0].dx)/5)
	    .attr("text-anchor", "top")
	    .text(function(d) { return formatCount(d.y); });

	var xAxis2 = svgH.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + (heightH - padding) + ")")
	    .call(xAxis);

	xAxis2.append("text")
		.attr("x", widthH / 2)
		.attr("y", 30)
		.attr("text-anchor", "middle")
		.text("Canopy Percentage")

	var yAxis2 = svgH.append("g")
	    .attr("class", "y axis")
	    .attr("transform", "translate(" + padding + ",0)")
	    .call(yAxis);
}
//END CODE FOR HISTOGRAM

//V1 of the update function that is passed the data to create the histogram for impervious cover
function drawChartImperv(data){
	//window.test2 = data;

  getArrayImperv(data);

  //grab the values you need and bin them
  histBinnedData = d3.layout.histogram()
  	.bins(xScale.ticks(10))
  	(arrayImperv);

  //window.test4 = histBinnedDataImperv;

  yScale = d3.scale.linear
  	.domain([0, d3.max(histBinnedDataImperv, function(d) { return d.y; })])
  	.range([heightH - padding, padding])
  	.nice();

  yAxis = d3.svg.axis()
  	.scale(yScale)
  	.orient("left");

	svgH.selectAll(".bar").transition()
		.attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

	bar.selectAll("rect")
		.duration(2000)
	    .attr("y", function (d) { (heightH - padding) - yScale(d.y);})
	    .attr("width", xScale(histBinnedData[0].dx)/2)
	    .attr("height", function(d) { return (heightH - padding) - yScale(d.y); })
    	//color the bars the same way you do the polygons in the choropleth by using the color function on the value
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
    	// .on('click',function(d) {return alert(colorImperv(d.x))})
    	.on('mouseover', function (d) {
    		d3.selectAll("[bin='"+colorImperv(d.x)+"']")
    		.style("fill","#F1B6DA");
    		// console.log(d3.selectAll("[bin='"+colorImperv(d.x)+"']"))
    	})
    	.on('mouseout', function (d) {
    		d3.selectAll("[bin='"+colorImperv(d.x)+"']")
    		.style("fill",colorImperv(d.x));
    	})
    	// .on('click',function(d) {alert(d.bin)})

	bar.selectAll("text")
	    .attr("x", xScale(histBinnedData[0].dx)/5)
	    .text(function(d) { return formatCount(d.y); });

	xAxis2.select("text")
		.text("Impervious Percentage")

	yAxis2.select(".y axis")
		.call(yAxis);
}
//END CODE FOR V1 UPDATE HISTOGRAM


//listeners for layer button hovers
$('.layer').hover(function(){
		// console.log(this);
		$(this).toggleClass('hover');
	}, function(){
	$(this).toggleClass('hover');
});
