// this is the leaflet-based code for the map that was in commit bdf2dcfecd2b1537c8f86b5329c3b1668490827d from Dec 2nd 2014

//set up our Leaflet map
var map = L.map('map').setView([40.7056258,-73.97968], 10)

var Esri_WorldGrayCanvas = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map);

// LEAFLET CODE STARTS HERE
//function to create pop-ups and sidebar divs
function makePopUps(feature, layer){
	//console.log(feature);
	//layer.bindPopup defines the pop-up value
	layer.bindPopup(
		"Neighborhood: <br>"
		+ feature.properties.Alt_Name
		);

	//set up divs classed using the MINOR_DESC 
	$('#geoList').append(
		"<div class = 'geoListItem' id='"
		+ feature.properties.NEIGH_CODE
		+"'>"
		+ feature.properties.Alt_Name
		+"</div>"
		)
	}



function highlightMarker(geojsonLayer,thisPoly) {
  geojsonLayer.eachLayer(function(marker) {
		if(thisPoly==marker.feature.properties.NEIGH_CODE) {
   		marker.setStyle({
   			fillOpacity: 1,
   			weight:1,
   			color: 'steelblue'
   			});
   			//console.log(marker.options.fillOpacity);
		} else {
			marker.setStyle({
				fillOpacity:.8,
				weight:1,
				color: '#cecece'
				});
		}
  });
}


// get color depending on population density value
function getColor(d) { //at some point in the future we will be calling out the value d from the dataset
	return d > 80  ? '#00441b' :
	       d > 60  ? '#238b45' :
	       d > 40  ? '#74c476' :
	       d > 20  ? '#c7e9c0' :
	                  '#f7fcf5';
}

function style(feature) {//this function is being passed a feature and is returning a pile of style attributed
	//console.log(feature);
	return {
		weight: 1,
		opacity: 1,
		color: '#cecece',
		fillOpacity: 0.8,
		fillColor: getColor(feature.properties.Can_P) //getColor was defined right up above. this statement says pick the color depending on the value in the density property of the us-states.js.  so feature.properties.density is being passed as 'd'
	};
}



//add data to the map
$.getJSON('data/landcoversumm.geojson', function(data) {
	var geojsonLayer = L.geoJson(data.features, {
		style: style, //styled above
		onEachFeature: makePopUps,
	}).addTo(map);


	$('.geoListItem')
	.mouseenter(function(){
		$(this).toggleClass('highlight');
		var thisPoly = $(this).attr('id');
		highlightMarker(geojsonLayer,thisPoly);
	})
	.mouseout(function(){
		$(this).toggleClass('highlight');
		var thisPoly;
		highlightMarker(geojsonLayer,thisPoly);
	})
});

