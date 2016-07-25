var map;

function initGoogleMap(){
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 43.4695172, lng: -80.5490679},
    zoom: 14
  });
}
