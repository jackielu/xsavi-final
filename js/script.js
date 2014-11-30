//set up our map
var map = L.map('map').setView([40.7056258,-73.97968], 10)

		//Add basemap from mapbox
		L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
			maxZoom: 18,  //can't zoom in closer than 18
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'examples.map-20v6611k'
			//not sure why the map was given an ID?  
		}).addTo(map);



//function to create pop-ups and sidebar divs
function makeMarkers(feature, layer){
	console.log(feature);
	//layer.bindPopup defines the pop-up value
	layer.bindPopup(
		"Neighborhood: <br>"
		+ feature.properties.Alt_Name
		);
	}

//ad data to the map

$.getJSON('data/landcoversumm.geojson', function(data) {
	var geojsonLayer = L.geoJson(data.features, {
		onEachFeature: makeMarkers,
	}).addTo(map);
});

