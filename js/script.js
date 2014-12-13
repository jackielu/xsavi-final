//set up our Leaflet map
var map = L.map('map',{zoomControl:false}).setView([40.7056258,-73.97968], 11)

var CartoDB_DarkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	minZoom: 10,
	maxZoom: 18
}).addTo(map);


//this adds a new zoom control in the specified position.  requires setting zoomControl:false in L.map
L.control.zoom({position: "topright"}).addTo(map);


//set up D3 SVG for map by adding SVG element to Leaflet’s overlay pane. Leaflet automatically repositions the overlay pane when the map pans. Note that the SVG element is initialized with no width or height; the dimensions must be set dynamically because they change on zoom. 
var svgMap = d3.select(map.getPanes().overlayPane)
	.append("svg");

//Inside the SVG, you’ll also need a G (group) element. This will be used to translate the SVG elements so that the top-left corner of the SVG, ⟨0,0⟩, corresponds to Leaflet’s layer origin. The leaflet-zoom-hide class is needed so that the overlay is hidden during Leaflet’s zoom animation; alternatively, you could disable the animation using the zoomAnimation option when constructing the map.
var gMap = svgMap.append("g")
	.attr("class", "leaflet-zoom-hide");

//set up scale that takes data values as input and outputs colors
var color = d3.scale.quantize()
                    .range(["#d9d9d9", "#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"])
                    .domain([0, 100]);

var colorImp = d3.scale.quantize()
					.range(["#05201F","#0A3130","#104342","#175555","#1F696A", "#277C7F","#309195","#39A6AC","#43BBC3","#4DD1DC"])
					.domain([0, 100]);


//code to add D3 polygon data to the map is based on http://bost.ocks.org/mike/leaflet/

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
    	.on('click',function(d) {alert(d.properties.Can_P + "% canopy and" + d.properties.Imperv_P + "% Imperv and" +color(d.properties.Can_P))});
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

	// Use Leaflet to implement a D3 geometric transformation. A transform converts an input geometry (such as polygons in spherical geographic coordinates) to a different output geometry (such as polygons in projected screen coordinates). Using d3.geo.transform, it can be implemented as a simple function that projects individual points:
	  function projectPoint(x, y) {
	    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
	    this.stream.point(point.x, point.y);
	  }

	  drawChart(lcData);
	});  
//end d3json call


//this adds interactivity to the map - click on #imp_p.layer and the polygon update
d3.select("li#Imperv_P.layer")
	.on("click", function(d){ 
		//console.log(this);
    	d3.selectAll("path")
	        .transition()
	        .duration(2000)
	    	.style("fill", function(d) {
	    		value = d.properties.Imperv_P;
                return colorImp(value);
			});
    });


//start creating D3 histogram round 

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

//function to create arrays from "columns" of attribute data
function getArray(data) {
	for (var i=0; i< data.features.length; i++) {
	array.push(data.features[i].properties.Can_P);
	array;
	}
}


//function that is pass the data to create the histogram
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
		.attr("x", widthH / 2)
		.attr("y", 30)
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
}






// Old code for creating divs using Leaflet

//create divs with IDs from the data
function makeDivs(feature, layer) {
	$('#geoList').append(
	'<p class=place id='
	+ feature.properties.UniqueID
	+'>'
	+ feature.properties.UniqueID
	+ '</p>')
};


//getJSON call for creating divs  FIX THIS WHEN YOU CAN, using d3.json again
$.getJSON("data/landcoversumm.geojson", function(lcData) {
	//window.test = data;
	var geojsonLayer = L.geoJson(lcData.features, {
		onEachFeature: makeDivs
	})
})
//end getJSON call for creating divs


