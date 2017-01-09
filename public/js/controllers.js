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

    var history = {
        destination: {
            lat: Number($scope.destLatitude),
            lng: Number($scope.destLongitude)
        },
        origin: {
            lat: Number($scope.originLatitude),
            lng: Number($scope.originLongitude)
        },
        complete: false,
        lastRequest : [Date.now()]
    };

    $http.post('/Request', history).then();

    $window.directionsService.route({
      origin: originLatLong,
      destination: destLatLong,
      travelMode: google.maps.TravelMode.DRIVING
    }, function(response, status) {
      if (status) {
        console.log(response);
        console.log(status);
        $http.post('/mapDirection', response).then(function(){
            alert("Success!");
        });
        $window.directionsDisplay.setDirections(response);
      } else {
        alert('Directions request failed due to ' + status);
      }
    });
  };

  $scope.getCurrentLocation = function(){
    geolocation.getLocation().then(function(data){
      $scope.originLatitude = data.coords.latitude;
      $scope.originLongitude = data.coords.longitude;
    });
  };
});
