//set up our Leaflet map
var map = L.map('map').setView([40.7056258,-73.97968], 10)

var Esri_WorldGrayCanvas = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map);

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    // attach an empty g element with specific attributes - any thing with a class of leaflet-zoom-hide means leaflet will hide it while the zoom is taking place
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

//this is saying go get us-states.json in a callback function and then do to it a WHOLE BUNCH OF STUFF called collection
d3.json("data/landcoversumm.geojson", function(collection) {
  //this is a path builder.  a path is an SVG element that is a polygon.  geojson has to be transformed to turn it into a path on the screen - to the "d" notation for SVG elements
  var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform);
  
  //setting a variable called feature.  recall that the g object was created earlier, it's a group element in the SVG.  this is where you have to select something that doesn't exist so that you can create them.
  var feature = g.selectAll("path")  //at this point the paths don't exist but we have to call them
      .data(collection.features) //for every path - affiliate it with some data. collection.features are your geojson subfeatures.  features is an array, each object is an individual state.  .data connects the features array to the path
    .enter().append("path");  //.enter means that any new data that D3 wasn't aware of previously - do it.  sibling features are .update and .exit - this is doing stuff to data that is being updated or coming off the screen.  this says for every element in this data - append a path element inside the g element

    //assign a class to a D3 feature based on data attributes
    feature.attr('class',function(d) {
      return d.properties.name;
    }).on('click',function(d) {
      alert(d.properties.name)});

  map.on("viewreset", reset);
  reset();


  // Reposition the SVG to cover the features.
  function reset() {
    var bounds = path.bounds(collection),
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