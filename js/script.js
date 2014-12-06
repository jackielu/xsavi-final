//set up our Leaflet map
var map = L.map('map').setView([40.7056258,-73.97968], 11)

var Esri_WorldGrayCanvas = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map);


//create divs with IDs from the data
function makeDivs(feature, layer) {
	$('#geoList').append(
	'<p id='
	+ feature.properties.UniqueID
	+'>'
	+ feature.properties.UniqueID
	+ '</p>')
};


//set up D3 SVG for map
var svg = d3.select(map.getPanes().overlayPane).append("svg"), g = svg.append("g").attr("class", "leaflet-zoom-hide");

//code to add D3 polygon data to the map is based on http://bost.ocks.org/mike/leaflet/

//d3.json call starts here
d3.json("data/landcoversumm.geojson", function(lcData) {
	//window.test = lcData;
	//console.log(lcData);
	var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform);

    var feature = g.selectAll("path").data(lcData.features).enter().append("path");

    //assign a class to a D3 feature based on data attributes
    feature.attr('id',function(d) {return d.properties.UniqueID;})
      	//.on('click',function(d) {alert(d.properties.UniqueID)});

    map.on("viewreset", reset);
    reset();


  	// Reposition the SVG to cover the features.
	  function reset() {
	    var bounds = path.bounds(lcData),
	        topLeft = bounds[0],
	        bottomRight = bounds[1];
	        //here we are setting width and height of the attribute layer based on the bounds.
	    svg .attr("width", bottomRight[0] - topLeft[0])
	        .attr("height", bottomRight[1] - topLeft[1])
	        .style("left", topLeft[0] + "px")
	        .style("top", topLeft[1] + "px");
	    g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
	    //this is actually where we draw the shape on the map; out of the data that we passed turn this into an SVG attribute
	    feature.attr("d", path);
	  }

	// Use Leaflet to implement a D3 geometric transformation.
	  function projectPoint(x, y) {
	    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
	    this.stream.point(point.x, point.y);
	  }

	  drawChart(lcData);

	});  
//end d3json call




//start creating D3 histogram round 

//select the hist div and define it as a variable
var hist = d3.select("#hist");
//define the margin of the SVG rectangle
var marginH = {top: 0, right: 0, bottom: 0, left: 0};
//dimension of the SVG rectangle
var widthH = 960 - marginH.left - marginH.right,
    heightH = 180 - marginH.top - marginH.bottom;

//create the SVG rectangle
var svgH = hist.append("svg")
    .attr("width", widthH)
    .attr("height", heightH + 20)
  .append("g")
    .attr("transform", "translate(" + marginH.left + "," + marginH.top + ")");

var xScale = d3.scale.linear()
	.domain([0,100])
	.range([0,widthH]);


var array = [];

//function to create arrays from "columns" of attribute data
function getArray(data) {
	for (var i=0; i< data.features.length; i++) {
	array.push(data.features[i].properties.Can_P);
	array;
	}
}



//function that is pass the data to create the historgram
function drawChart(data){
	//window.test2 = data;
  var makeRoundP = d3.format(".3p") //a function for formatting numbers

  //a formatter for counts
  var formatCount = d3.format(",.0f");

  getArray(data);

  //grab the values you need and bin them
  var histBinnedData = d3.layout.histogram()
  	.bins(xScale.ticks(20))
  	(array);

  //window.test3 = histBinnedData;

  var yScale = d3.scale.linear()    
  	.domain([0, d3.max(histBinnedData, function(d) { return d.y; })])
  	.range([heightH, 0]);

  var xAxis = d3.svg.axis()
    .scale(xScale)
	.orient("bottom");

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
	    .attr("y", function (d) {heightH - yScale(d.y);})
	    .attr("width", xScale(histBinnedData[0].dx) - 1)
	    .attr("height", function(d) { return heightH - yScale(d.y); });

	bar.append("text")
	    .attr("dy", ".75em")
	    .attr("y", -4)
	    .attr("x", xScale(histBinnedData[0].dx)/2)
	    .attr("text-anchor", "top")
	    .text(function(d) { return formatCount(d.y); });

	svgH.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + heightH + ")")
	    .call(xAxis);

	svgH.append("g")
	    .attr("class", "y axis")
	    // .attr("transform", "translate(0," + widthH + ")")
	    // .attr("transform", "translate(" + widthH + ",0)")
	    .call(yAxis);


  // var barGroup = svg.selectAll("g.barGroup")
  //   .data(data)
  //   .enter()
  //   .append("g")
  //   .attr("class", function(d){ return "barGroup x-" + d.properties.OBJECTID; })
  //   .attr("transform", function(d){ return "translate(" + (d.properties.OBJECTID)*25 + ",50)"; });

  // var bars = barGroup
  //   .append("rect")
  //   .attr("height", function(d){ return (d.properties.Can_P)*5 ; })
  //   .attr("width", 10)
  //   .style("fill", "#99d594");

  // var barText = barGroup
  //   .append("text")
  //   .attr("x",".5em")
  //   .attr("dy", "1.1em")
  //   .text(function(d){ return makeRoundP(d.properties.Can_P/100); });
}





//getJSON call for creating divs  FIX THIS WHEN YOU CAN, using d3.json again
$.getJSON("data/landcoversumm.geojson", function(lcData) {
	//window.test = data;
	var geojsonLayer = L.geoJson(lcData.features, {
		onEachFeature: makeDivs
	})
})
//end getJSON call for creating divs
