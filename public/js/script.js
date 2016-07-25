var map;
var x;
var y;
var infoWindow;
var service;

function initGoogleMap(){
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 43.4695172, lng: -80.5490679},
    zoom: 14,
	styles: [{
            stylers: [{ visibility: 'simplified' }]
          }, {
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }]
  });
// Add destination latitude and longitude when click on the map
  google.maps.event.addListener(map, 'click', function(event){
	  //alert('Lat: ' + event.latLng.lat() + ' Lng: ' + event.latLng.lng());
	  var x = event.latLng.lat();
	  var y = event.latLng.lng();
	  document.getElementById("destlat").value = x;
	  document.getElementById("destlong").value = y;
	 //finddestination();
	  });
}
