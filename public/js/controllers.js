var app = angular.module('mapApp', ['mapController', 'geolocation']);
var mapController = angular.module('mapController', ['geolocation']);

mapController.controller('mapController', function($scope, $http, $window, geolocation) {
  $scope.getDirection = function() {
    var originLatLong = $scope.originLatitude + ', ' + $scope.originLongitude;
    var destLatLong = $scope.destLatitude + ', ' + $scope.destLongitude;
    var locations = {
      "origin": originLatLong,
      "destination": destLatLong
    };

    $window.directionsService.route({
      origin: originLatLong,
      destination: destLatLong,
      travelMode: google.maps.TravelMode.DRIVING
    }, function(response, status) {
      if (status) {
        console.log(response);
        console.log(status);
        $window.directionsDisplay.setDirections(response);
      } else {
        alert('Directions request failed due to ' + status);
      }
    });

    $http.post('/mapDirection', locations).then(function(){
      alert("Success!");
    });
  };

  $scope.getCurrentLocation = function(){
    geolocation.getLocation().then(function(data){
      $scope.originLatitude = data.coords.latitude;
      $scope.originLongitude = data.coords.longitude;
    });
  };
});
