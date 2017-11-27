///////////////MAP CLASS///////////////
///////////////////////////////////////
function CircleMap(idForMap, zoom = 14, angle, idForInstuctions, center = {lat: 33.989073, lng: -84.507361}){
	this.map = new google.maps.Map(document.getElementById(idForMap), {
		zoom: zoom,
		center: center
	});
	this.name = idForMap;
	this.center = center;
	this.zoom = zoom;
	this.markerArray = [];
	this.waypoints = [];
	this.latArray = [];
	this.lngArray = [];
	this.angle = angle;
	this.startingAngle = angle;
	this.idForInstuctions = idForInstuctions;
}

CircleMap.prototype.initialize = function(newCenter = ""){
	if(newCenter !== ""){
		this.center = newCenter;
	}
	// console.log(`I am ${this.name} INITIALIZE ME!!!'`)
	this.marker = new google.maps.Marker({
		position: this.center,
		map: this.map
	});	
	this.directionsDisplay = new google.maps.DirectionsRenderer({map: this.map});



	this.lat = this.center.lat;
	this.lng = this.center.lng;

	var init_lat_lng = new google.maps.LatLng(this.lat,this.lng);
	this.markerArray.push(this.marker);
	this.latArray.push(init_lat_lng.lat()) /////push lat of our initial point
	this.lngArray.push(init_lat_lng.lng()) /////push lng of our initial point
	console.log(this.latArray);
	console.log(this.lngArray);
}

// This looks strangely familiar... (see initilaize method)
CircleMap.prototype.reset = function(){
	this.map = new google.maps.Map(document.getElementById(this.name),{
		zoom: this.zoom,
		center: this.center
	})
	this.marker = new google.maps.Marker({
		position: this.center,
		map: this.map
	});	
	this.directionsDisplay = new google.maps.DirectionsRenderer({map: this.map});	
	this.directionsDisplay.setPanel(document.getElementById(this.idForInstuctions));	
	this.angle = this.startingAngle;
}

CircleMap.prototype.findCoordinates = function(lat, lng, range){
    var numOfPoints = 6;
    var degreesPerPoint = -5 /numOfPoints;
    var x2;
    var y2;

    for(let i=0; i <= numOfPoints; i++){
      x2 = Math.cos(this.angle) * range;
      y2 = Math.sin(this.angle) * range;
      newLat = lat+x2;
      newLng = lng+y2;
      // console.log(typeof newLat);
      // console.log(newLng)
      lat_lng = new google.maps.LatLng(newLat,newLng);
      var marker = new google.maps.Marker({
        position: lat_lng,
        map: this.map,
        // visibile: false
        
      });
      this.latArray.push(lat_lng.lat()); ////push lats of points we just looped through and placed on map
      this.lngArray.push(lat_lng.lng());
      this.markerArray.push(marker);
      this.angle += degreesPerPoint;
    }
}

CircleMap.prototype.calculateAndDislayRoute = function(directionsService, stepDisplay){

	for(let i = 0; i < this.markerArray.length; i++){
		this.markerArray[i].setMap(null);
	}
	
	// var destination = new google.maps.LatLng(latArray[latArray.length-1],lngArray[lngArray.length-1])
	for(let i = 1; i <= 6; i++){
		this.waypoints.push({ 
			location:{
				lat: this.latArray[i],
				lng: this.lngArray[i]
			}
		})
	}

	console.log(this.waypoints)

	directionsService.route({
		origin: this.center,
		destination: this.center,
		waypoints: this.waypoints,
		travelMode: "WALKING",
		optimizeWaypoints: true,
		provideRouteAlternatives: true,
		avoidHighways: true,
		
		// unitSystem: UnitSystem.IMPERIAL,
	}, (response,status)=>{
		console.log(response)
		if(status === "OK"){
			document.getElementById('warning-panel').innerHTML = '<b>' + response.routes[0].warnings + '</b>';
			// console.log("Prombelm?")
			// this.directionsDisplay.setMap(this.name);
			// console.log("yes")
			this.directionsDisplay.setDirections(response);
			// showSteps(response,markerArray, stepDisplay, map);
		}else{
			window.alert("Request failed due to" + status)
		}
	});
}


//////////////////////////////
//////////GLOBALS/////////////
//////////////////////////////
var mapURL = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
var roadURL = `https://roads.googleapis.com/v1/snapToRoads?path=60.170880,24.942795|60.170879,24.942796|60.170877,24.942796&key=${apiKey}`
var userLocation;

var userLocationLatLng;
var init_lat;
var init_lng;
var range;
var geocoder;
var stepDisplay;
var lat_lng;
//////////////MAPS/////////////
// var map1;
// var map2;
// var map3;
var runningMaps = [];



var directionsDisplay;
var directionsService;

var latArray = []  
var lngArray = []
var latArray2 = []  
var lngArray2 = []
var latArray3 = []  
var lngArray3 = []
	
///////////////////////////////////////////////////////
////////////CODE THAT ACTUALLY RUNS ON LOAD////////////
///////////////////////////////////////////////////////
var ajaxRequest = $.ajax({
		type: 'GET',
		url: mapURL,
		url2: roadURL,
		// url3: geoURL,
		dataType: 'jsonp',
		jsonpCallback: 'initMap',
		async: false, // this is by default false, so not need to mention
		crossDomain: true // tell the browser to allow cross domain calls.
		

		
})


$(document).ready(function(){
	$('.run-form').submit(function(event){
		event.preventDefault();
		$("#instructions").show()
		$(".milesBox").show()
		// reset all maps so the directions dont hold over the last search
		reset();
		// get the new address from teh form
		var address = document.getElementById("location").value;

		var x = document.getElementById("miles").selectedIndex;
		var distance = document.getElementsByTagName("option")[x].innerHTML;
		if(distance == "1-3 miles"){
			range = .011
		}else if(distance == "3-5 miles"){
			range = .013
		}else if(distance == "5-7 miles"){
			range = .015
		}else if(distance == "7-10 miles"){
			range = .017
		}

		geocoder = new google.maps.Geocoder();
		geocoder.geocode({'address': address}, function(results,status){
			if(status === 'OK'){
				userLocationLatLng = {
					lat: results[0].geometry.location.lat(),
					lng: results[0].geometry.location.lng()
				}

				initMap2(userLocationLatLng)

				runningMaps.map((currMap)=>{
					currMap.findCoordinates(userLocationLatLng.lat, userLocationLatLng.lng, range);
					currMap.calculateAndDislayRoute(directionsService, stepDisplay);
				})

				
			
				// calculateAndDislayRoute(
				// directionsDisplay2, directionsService, markerArray2, stepDisplay, map2, userLocation);
			
				// calculateAndDislayRoute(
				// directionsDisplay3, directionsService, markerArray3, stepDisplay, map3, userLocation);
			}else{
				// alert("not valid")
			}
			// console.log(x);
			

		})
			console.log('im  not waitig for geocode.')
	});
});  

initMap = function (coordLocation = "") {
	if(runningMaps.length === 0){
		runningMaps.push(new CircleMap('map', 14, 90, 'instructions'));
		// runningMaps.push(new CircleMap('map2', 14, -45, 'instructions2'));
		// runningMaps.push(new CircleMap('map3', 14, -90, 'instructions3'));
		// runningMaps.push(new CircleMap('map4', 14, 45, 'instructions4'));
	}

	directionsService = new google.maps.DirectionsService;
	stepDisplay = new google.maps.InfoWindow;

	runningMaps.map((currMap)=>{
		currMap.initialize(coordLocation);
		currMap.directionsDisplay.setPanel(document.getElementById(currMap.idForInstuctions));
	})
}

initMap2 = function (coordLocation = "") {
	if(runningMaps.length === 0){
		runningMaps.push(new CircleMap('map', 14, 90, 'instructions'));
		runningMaps.push(new CircleMap('map2', 14, -45, 'instructions2'));
		runningMaps.push(new CircleMap('map3', 14, -90, 'instructions3'));
		runningMaps.push(new CircleMap('map4', 14, 45, 'instructions4'));
	}

	directionsService = new google.maps.DirectionsService;
	stepDisplay = new google.maps.InfoWindow;

	runningMaps.map((currMap)=>{
		currMap.initialize(coordLocation);
		currMap.directionsDisplay.setPanel(document.getElementById(currMap.idForInstuctions));
	})

}

function reset(){
	// markerArray = []
	// reset all 3 maps
	runningMaps.map((currMap)=>{
		currMap.reset();
	})
	// reset globals
	latArray = []
	lngArray = []
	directionsService = new google.maps.DirectionsService;
	stepDisplay = new google.maps.InfoWindow;
}




		// var myRoute;
		// var legsArray = []
	// function showSteps(directionResult, markerArray, stepDisplay, map){
	//     myRoute = directionResult.routes[0].legs
	//     console.log(myRoute)
	//     // console.log(myRoute)
	//     for(var j=0; j < directionResult.routes[0].legs.length; j++){
	//       legsArray.push(directionResult.routes[0].legs[j])
	//     }
	//     console.log(legsArray)
			// myRoute = directionResult.routes[0].legs[0]
			// console.log(myRoute)
			// for(var i = 0; i < directionResult.routes[0].legs.length; i++){
			//   marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
			//   marker.setMap(map);
			//   marker.setPosition(myRoute.steps[i].start_location);
				// attachInstructionText(
					// stepDisplay, marker, myRoute.instructions.map);
			// }
	//   }


	// function attachInstructionText(stepDisplay, marker, text, map){
	//     google.maps.event.addListener(marker, "click", function(){
	//       stepDisplay.setContent(text);
	//       stepDisplay.open(map, marker)
	//     })
	//   }

