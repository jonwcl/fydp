var map;
var directionsDisplay;
var directionsService;
var x;
var y;
var infoWindow;
var service;
var geocoder;
var tempdestlng;
var tempdestlat;
var tempstartlng;
var tempstartlat;

function initGoogleMap(){
  directionsDisplay = new google.maps.DirectionsRenderer;
  directionsService = new google.maps.DirectionsService;
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 43.4695172, lng: -80.5490679},
    zoom: 14,
	styles: [{
            stylers: [{ visibility: 'simplified' }]
          }, {
            elementType: 'labels',
            //stylers: [{ visibility: 'off' }]
          }]
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });
  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
  var places = searchBox.getPlaces();
  if (places.length == 0) {
    return;
  }
  // Clear out the old markers.
  markers.forEach(function(marker) {
    marker.setMap(null);
  });
  markers = [];
  // For each place, get the icon, name and location.
  var bounds = new google.maps.LatLngBounds();
  places.forEach(function(place) {
  if (!place.geometry) {
    console.log("Returned place contains no geometry");
    return;
    }
  var icon = {
    url: place.icon,
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 25)
  };
  // Create a marker for each place.
  markers.push(new google.maps.Marker({
    map: map,
    icon: icon,
    title: place.name,
    position: place.geometry.location
  }));

  var x = place.geometry.location.lat();
  var y = place.geometry.location.lng();
  // document.getElementById("startlat").value = x.toFixed(7);
  // document.getElementById("startlong").value = y.toFixed(7);

  document.getElementById("startlat").value = "43.4642578";
  document.getElementById("startlong").value = "-80.5204096";

  if (place.geometry.viewport) {
    // Only geocodes have viewport.
    bounds.union(place.geometry.viewport);
    } else {
    bounds.extend(place.geometry.location);
    }
    });
    map.fitBounds(bounds);

	var geocoder = new google.maps.Geocoder();

	searchBox.addListener('places_changed', function(){
		alert("ok");
		  geocodeAddress1(geocoder, map);
        });
    });

  // Create the search box and link it to the UI element.
  var input2 = document.getElementById('pac-input2');
  var searchBox2 = new google.maps.places.SearchBox(input2);
  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox2.setBounds(map.getBounds());
  });
  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox2.addListener('places_changed', function() {
  var places = searchBox2.getPlaces();
  if (places.length == 0) {
    return;
  }
  // Clear out the old markers.
  markers.forEach(function(marker) {
    marker.setMap(null);
  });
  markers = [];
  // For each place, get the icon, name and location.
  var bounds = new google.maps.LatLngBounds();
  places.forEach(function(place) {
  if (!place.geometry) {
    console.log("Returned place contains no geometry");
    return;
    }
  var icon = {
    url: place.icon,
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 25)
  };
  // Create a marker for each place.
  markers.push(new google.maps.Marker({
    map: map,
    icon: icon,
    title: place.name,
    position: place.geometry.location
  }));

  var x = place.geometry.location.lat();
  var y = place.geometry.location.lng();
  // document.getElementById("destlat").value = x.toFixed(7);
  // document.getElementById("destlong").value = y.toFixed(7);

  document.getElementById("destlat").value = "43.6532260";
  document.getElementById("destlong").value = "-79.3831843";
  if (place.geometry.viewport) {
    // Only geocodes have viewport.
    bounds.union(place.geometry.viewport);
    } else {
    bounds.extend(place.geometry.location);
    }
    });
    map.fitBounds(bounds);

	var geocoder = new google.maps.Geocoder();
	searchBox2.addListener('places_changed', function(){
		alert("ok");
		  geocodeAddress2(geocoder, map);
        });
    });



  directionsDisplay.setMap(map);

  google.maps.event.addListener(map, 'click', function(event){
	  //alert('Lat: ' + event.latLng.lat() + ' Lng: ' + event.latLng.lng());
	  var x = event.latLng.lat();
	  var y = event.latLng.lng();
	  document.getElementById("destlat").value = x.toFixed(7);
	  document.getElementById("destlong").value = y.toFixed(7);
	  //finddestination();
	  });

  google.maps.event.addListener(marker, "click", function (event) {
                    alert(this.latandlong);
}); //end addListener

}

function finddestination() {
  document.getElementById("destlat").value = x;
  document.getElementById("destlong").value = y;
}

function lookupfunction() {
  infoWindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);
  performSearch();
}

function performSearch() {
  var keyword = document.getElementById("loopUpKeyword").value;
    var request = {
      bounds: map.getBounds(),
      keyword: keyword
    };
  service.radarSearch(request, callback);
}

function callback(results, status) {
  if (status !== google.maps.places.PlacesServiceStatus.OK) {
    console.error(status);
    return;
  }
  for (var i = 0, result; result = results[i]; i++) {
    addMarker(result);
  }
}

function addMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: {
      url: 'http://maps.gstatic.com/mapfiles/circle.png',
      anchor: new google.maps.Point(10, 10),
      scaledSize: new google.maps.Size(10, 17)
    }
  });

  google.maps.event.addListener(marker, 'click', function() {
    service.getDetails(place, function(result, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        console.error(status);
        return;
      }
      infoWindow.setContent(result.name);
      infoWindow.open(map, marker);
    });
  });
}

function geocodeAddress1(geocoder, resultsMap) {
        var address = document.getElementById('pac-input').value;
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
			  var tempstartlng = results[0].geometry.location.lng();
			  var tempstartlat = results[0].geometry.location.lat();
			  document.getElementById("startlat").value = tempstartlat;
			  document.getElementById("startlong").value = tempstartlng;
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
              map: resultsMap,
              position: results[0].geometry.location
            });
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
}

function geocodeAddress2(geocoder, resultsMap) {
        var address = document.getElementById('pac-input2').value;
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
			  var tempdestlng = results[0].geometry.location.lng();
			  var tempdestlat = results[0].geometry.location.lat();
			  document.getElementById("destlat").value = tempdestlat;
			  document.getElementById("destlong").value = tempdestlng;
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
              map: resultsMap,
              position: results[0].geometry.location
            });
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
}
