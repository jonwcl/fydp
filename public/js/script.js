var map;
var directionsDisplay;
var directionsService;
var x;
var y;
var infoWindow;
var service;

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
