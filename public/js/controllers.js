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
    console.log("hi");
    $http.post('/Request', history).then();
    console.log("hi");
    $window.directionsService.route({
      origin: originLatLong,
      destination: destLatLong,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true
    }, function(response, status) {
      if (status) {
        console.log(response);
        console.log(status);
        console.log("hi");
        //var temp = response.route[0];
        //response.route[0] = response.route[1];
        //response.route[1] = temp;
        $window.directionsDisplay.setDirections(response);
        $http.post('/mapDirection', response).then(function(){
            alert("Success!");
        });
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
