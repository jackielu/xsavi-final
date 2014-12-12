//set up our Leaflet map
var map = L.map('map').setView([40.7056258,-73.97968], 10)

// var Esri_WorldGrayCanvas = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
// 	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
// 	maxZoom: 16
// }).addTo(map);


var CartoDB_DarkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	minZoom: 10,
	maxZoom: 18
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


// //set up scale that takes data values as input and outputs colors
// var color = d3.scale.quantize()
//                     .range(["rgb(237,248,233)", "rgb(186,228,179)",
//                      "rgb(116,196,118)", "rgb(49,163,84)","rgb(0,109,44)"]);

//set up scale that takes data values as input and outputs colors
var color = d3.scale.quantize()
                    .range(["#d9d9d9", "#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"]);

//code to add D3 polygon data to the map is based on http://bost.ocks.org/mike/leaflet/

//d3.json call starts here
d3.json("data/landcoversumm.geojson", function(lcData) {
	window.test = lcData;
	//console.log(lcData);

	color.domain([0, 100]);

	// color.domain([
 //                d3.min(lcData.features, function(d) { return d.properties.Can_P; }),
 //                d3.max(lcData.features, function(d) { return d.properties.Can_P; }       
 //    ]);


	var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform);

    var feature = g.selectAll("path")
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
                                        return color(value);
                                } else {
                                        //If value is undefined…
                                        return "#fff";
                                }
                   });

    //assign a class to a D3 feature based on data attributes
    feature.attr('id',function(d) {return d.properties.UniqueID;})
    	.attr('class', function(d) {return d.properties.Can_P;})
    	.attr('bin', function(d) {return color(d.properties.Can_P);})
    	.on('click',function(d) {alert(d.properties.Can_P + "% canopy and" + color(d.properties.Can_P))});
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
var widthH = 940 - marginH.left - marginH.right,
    heightH = 180 - marginH.top - marginH.bottom;

//create the SVG rectangle
var svgH = hist.append("svg")
    .attr("width", widthH)
    .attr("height", heightH)
  .append("g")
    .attr("transform", "translate(" + marginH.left + "," + marginH.top + ")");


//padding value to push the elements in away from the edges of the SVG
var padding = 30

//define the xScale
var xScale = d3.scale.linear()
	.domain([0,100])
	.range([padding, widthH - padding]);


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
  	.bins(xScale.ticks(10))
  	(array);

  // window.test3 = histBinnedData;

  // var yScale = d3.scale.linear()    
  // 	.domain([0, 100])
  // 	.range([heightH - padding, padding]);


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
    	//color the bars the same way you do the polygons in the choropleth
    	.style("fill", function(d) {
                        //Get data value
                        var value = d.x;
                        //window.test=value;
                        if (value) {
                                //If value exists…
                                return color(value);
                        } else {
                                //If value is undefined…
                                return "#fff";
                        }
           })
    	.attr('bin', function (d) {return color(d.x);})     
    	// .on('click',function(d) {return alert(color(d.x))})
    	// .on('click', function (d) {
    	// 	d3.selectAll("[bin='"+color(d.x)+"']")
    	// 	.style("fill","#F1B6DA");
    	// 	console.log(d3.selectAll("[bin='"+color(d.x)+"']"))
    	// })
    	.on('mouseover', function (d) {
    		d3.selectAll("[bin='"+color(d.x)+"']")
    		.style("fill","#F1B6DA");
    		// console.log(d3.selectAll("[bin='"+color(d.x)+"']"))
    	})
    	.on('mouseout', function (d) {
    		d3.selectAll("[bin='"+color(d.x)+"']")
    		.style("fill",color(d.x));
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
		.attr("x", 260)
		.attr("y", -5)
		.attr("text-anchor", "middle")
		.text("Canopy Percentage")

	var yAxis2 = svgH.append("g")
	    .attr("class", "y axis")
	    .attr("transform", "translate(" + padding + ",0)")
	    .call(yAxis);

	// yAxis2.append("text")
	//     .attr("class", "y axis")
	//     .attr("text-anchor", "middle")
	//     .attr("x", 0)
	//     .attr("y", -5)
	//     .attr("dy", ".75em")
	//     .attr("transform", "rotate(-90)")
	//     .text("Count");


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
