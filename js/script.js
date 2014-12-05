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
}


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
      	.on('click',function(d) {alert(d.properties.UniqueID)});

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
	});  
//end d3json call



//getJSON call for creating divs
$.getJSON("data/landcoversumm.geojson", function(lcData) {
	//window.test = data;
	var geojsonLayer = L.geoJson(lcData.features, {
		onEachFeature: makeDivs
	})
})